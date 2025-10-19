import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { io } from "socket.io-client";
import { backArrowIcon, downArrowIcon } from '../assets/svgs';
import AuctionTeamView from './AuctionTeamView';

var SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;
var defaultViewSelection = { liveBidding: false, team: false, playerDetails: false };

const requiredPlayerColumnForDisplay = ["playerNumber", "name", "team", "auctionStatus", "basePrice", "soldPrice", "auctionSet", "role", "bowlingHand", "bowlingType", "battingHand", "battingPossition", "battingType", "commnets"];
const filterFields = ["auctionSet", "team", "auctionStatus"];

export default function AuctionLiveUpdate(props) {
    const [auction, setAuction] = useState({});
    const [sets, setSets] = useState([]);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [playersCopy, setPlayersCopy] = useState([]);

    const [currentPlayer, setCurrentPlayer] = useState({});
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [currentTeamPlayerMap, setCurrentTeamPlayerMap] = useState(null);
    const [isLinkValid, setIsLinkValid] = useState(false);
    const [socket, setSocket] = useState(null);
    const [view, setView] = useState({ ...defaultViewSelection, liveBidding: true });
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [setPlayerMap, setSetPlayerMap] = useState([]);
    
    // Viewer count (mock for now, TODO: integrate with WebSocket)
    const [viewerCount, setViewerCount] = useState(0);

    const [playerListFilters, setPlayerListFilters] = useState({
        auctionStatus: [],
        team: [],
        auctionSet: []
    });
    const [selectedPlayerListFilters, setSelectedPlayerListFilters] = useState({
        auctionStatus: null,
        team: null,
        auctionSet: null
    });

    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getAuctionData();
    }, [])

    useEffect(() => {
        if (isLinkValid) {
            createAuctionSocket();
        } else {
            socket && socket.disconnect();
        }
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isLinkValid]);

    function createAuctionSocket() {
        const socket = new io(SOCKET_ADDRESS, {
            query: { slug: "auction-" + auctionId },
            path: "/auction/", // Custom path for Socket.IO
        });

        socket.on("playerBiddingUpdate", (player) => {
            setCurrentPlayer(player);
        });
        socket.on("playerSoldUpdate", (message) => {
            toast.success(message);
        });
        
        // Viewer count tracking (TODO: Implement when backend WebSocket is ready)
        // socket.emit('joinLiveView', auctionId);
        // socket.on('viewerCount', (count) => {
        //     setViewerCount(count);
        // });
        
        // Mock viewer count for demo
        setViewerCount(Math.floor(Math.random() * 150) + 20);

        setSocket(socket);
    }
    useEffect(() => {
        console.log("selectedPlayerListFilters", selectedPlayerListFilters)
        var auctionStatus = selectedPlayerListFilters.auctionStatus
        var team = selectedPlayerListFilters.team
        var auctionSet = selectedPlayerListFilters.auctionSet

        if (playersCopy && playersCopy.length > 0) {
            let allPlayers = structuredClone(playersCopy);
            allPlayers.sort((p1, p2) => p1.playerNumber - p2.playerNumber);
            let filterdPlayers = allPlayers.filter((p) => {
                let shouldDisplay = true;
                if (auctionStatus) {
                    shouldDisplay = (shouldDisplay && (p.auctionStatus == auctionStatus));
                }
                if (team) {
                    shouldDisplay = (shouldDisplay && (p.team == team));
                }
                if (auctionSet) {
                    shouldDisplay = (shouldDisplay && p.auctionSet == auctionSet);
                }
                return shouldDisplay;
            });
            setPlayers(filterdPlayers);
        }
    }, [selectedPlayerListFilters])

    const getAuctionData = () => {
        AuctionService.getPublicAuctionDetails({ auctionId: auctionId }, true).then((res) => {
            if (res.auction) {
                setAuction(res.auction);
            }
            if (res.teams) {
                setTeams(res.teams);
            }
            if (res.players) {
                var statusUniqueValues = new Set();

                const updatedPlayers = res.players.map(element => {
                    statusUniqueValues.add(element.auctionStatus);
                    element.isSelected = false;
                    return element;
                });
                const auctionStatus = [];
                statusUniqueValues.forEach((t) => {
                    auctionStatus.push({ value: t, displayValue: t });
                });
                const team = res.teams.map((t) => { return { value: t._id, displayValue: t.name } });
                const auctionSet = res.sets.map((t) => { return { value: t._id, displayValue: t.name } });

                setPlayerListFilters({
                    auctionStatus: auctionStatus ? auctionStatus : [],
                    auctionSet: auctionSet ? auctionSet : [],
                    team: team ? team : []
                })

                updatedPlayers.sort((p1, p2) => p1.playerNumber - p2.playerNumber);
                setPlayers(updatedPlayers);
                setPlayersCopy(updatedPlayers);
            }
            if (res.sets) {
                var data = [];
                var map = {};
                res.players.forEach(element => {
                    if (!map[element.auctionSet]) {
                        map[element.auctionSet] = [];
                    }
                    map[element.auctionSet].push(element);
                });
                Object.keys(map).map((key) => {
                    data.push({ set: key, players: map[key] });
                })
                setSetPlayerMap(data);
                setSets(res.sets)
            }

            if (res.teams && res.players) {
                var data = [];
                var map = {};
                res.teams.forEach((t) => {
                    map[t._id] = [];
                })
                res.players.forEach(element => {
                    if (!map[element.team]) {
                        map[element.team] = [];
                    }
                    map[element.team].push(element);
                });
                Object.keys(map).map((key) => {
                    if (key != "null") {
                        map[key] = map[key].sort((a, b) => a.soldNumber - b.soldNumber);
                        var rb = map[key].reduce((total, p) => {
                            return total + parseInt(p.soldPrice);
                        }, 0);

                        rb = getTeamBudget(key, res.teams) - rb;
                        data.push({ team: key, players: map[key], remainingBudget: rb });
                    }
                })
                setTeamPlayerMap(data);
            }
            setIsLinkValid(true);

        }).catch((error) => {
            console.error(error);
            toast.error(error);
            setIsLinkValid(false);
            navigate("/p/t/auction/");
        });
    }

    const getTeamName = (teamId) => {
        var team = teams.find((t) => { return t._id == teamId });
        if (team) {
            return team.name;
        } else {
            return "null";
        }
    }

    const getTeamBudget = (teamId, teams) => {
        var team = teams.find((t) => { return t._id == teamId });
        if (team) {
            return parseInt(team.budget);
        } else {
            return "null";
        }
    }
    const getTeamBudgetForView = (number) => {
        number = parseInt(number);
        return (number / 100000) + " L";
    }

    const getBiddingView = (player) => {
        if (player && Object.keys(player).length > 0 && player.bidding.length > 0) {
            var x = structuredClone(player.bidding);
            x.reverse();
            return x.map((b, index) => {
                return (
                    <div key={"getBiddingView" + player.name + "_" + index} className={`${index == 0 ? "bg-green-400" : "bg-slate-300"} flex flex-row justify-center  w-full  rounded p-2 `}>
                        <div >
                            {getTeamName(b.team)} -  {getTeamBudgetForView(b.price)}
                        </div>
                    </div>
                )
            })
        }
    }

    const getPlayerCard = (player) => {
        if (player && Object.keys(player).length > 0) {
            return (
                <div className={`flex flex-row justify-center items-center sm:gap-1 md:gap-1 lg:gap-2  rounded sm:p-1 md:p-2 `}>

                    <div className="bg-slate-200 sm:max-w-[200px] md:max-w-[300px] lg:max-w-[300px] rounded-full">
                        {getProfilePicture(player)}
                    </div>

                    <div className='flex flex-col sm:text-xs md:text-sm lg:text-lg text-start justify-start items-start '>
                        <div className='font-medium '>Player No. - {player.playerNumber}</div>
                        <div className='font-bold'>Name - {player.name}</div>
                        <div className='font-medium'>Role - {player.role}</div>
                        {player.bowlingHand && <div className='font-medium'>Bowl  -<span className='lowercase'> {player.bowlingHand} Arm - {player.bowlingType} </span></div>}
                        {player.battingHand && <div className='font-medium '>Bat - <span className='lowercase'> {player.battingHand} Arm - {player.battingPossition} order {player.battingType}</span> </div>}

                        <div className='font-medium'>Base Price - {getTeamBudgetForView(player.basePrice)}</div>
                    </div>
                </div>
            )
        }
    }

    const getProfilePicture = (player) => {
        var name = player.name;
        name = name.split(" ");
        let sn = name[0][0];
        if (name[1]) {
            sn += name[1][0];
        }
        return (<div className='flex flex-col justify-center items-center text-6xl  w-[125px] h-[125px] max-w-[125px] max-h-[125px] md:w-[150px] md:h-[150px] md:max-w-[150px] md:max-h-[150px] lg:w-[200px] lg:h-[200px] lg:max-w-[200px] lg:max-h-[200px] capitalize'>{sn}</div>)
    }
    const getTeamLogo = (team) => {
        let name = getTeamName(team);
        name = name.split(" ");
        if (name.length >= 2) {
            return name[0][0] + name[1][0];
        }
        return name[0][0] + name[0][1];
    }
    const displayTeamBoard = () => {
        setSelectedPlayer(null)
        setCurrentTeamPlayerMap(null)
    }
    const getSetName = (setId) => {
        var s = sets.find((s) => { return s._id == setId });
        if (s) {
            return s.name;
        } else {
            return "undefiend set";
        }
    }

    // Calculate sold players for display
    const soldPlayers = players.filter(p => p.auctionStatus === 'sold');
    const recentSold = soldPlayers.slice(-5).reverse(); // Last 5 sold, most recent first

    return (
        <div className='flex flex-col w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white'>
            {/* Modern Header */}
            <div className="bg-black bg-opacity-50 backdrop-blur-md px-4 py-4 shadow-2xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold">{auction?.name || 'Auction'}</h1>
                            <span className="px-4 py-2 bg-red-600 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                                <span className="w-3 h-3 bg-white rounded-full"></span>
                                LIVE
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex items-center gap-2">
                                <span>👥</span>
                                <span className="font-semibold">{viewerCount} watching</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-blue-200 mt-2">
                        <span className="flex items-center gap-1">
                            <span>🎯</span>
                            <span>{players.length} Players</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span>✅</span>
                            <span>{soldPlayers.length} Sold</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span>⏳</span>
                            <span>{players.length - soldPlayers.length} Remaining</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className='flex flex-col w-full max-w-full h-full text-sx gap-4 p-2'>
                <div className='header flex flex-row flex-wrap justify-start gap-2 font-medium capitalize'>
                    <div onClick={() => { navigate("/p/t/auction/" + auctionId) }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >Auction Home</div>
                    {!view.liveBidding && <div onClick={() => {
                        setView(() => {
                            var val = structuredClone(defaultViewSelection);
                            val.liveBidding = true;
                            return val;
                        })
                    }} type="button" className="normal-case flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >
                        Go to Live Bidding...</div>
                    }
                    {!view.team && <div onClick={() => {
                        setView(() => {
                            var val = structuredClone(defaultViewSelection);
                            val.team = true;
                            return val;
                        })
                    }} type="button" className="normal-case flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >
                        Go to Team Details...</div>
                    }
                    {!view.playerDetails && <div onClick={() => {
                        setView(() => {
                            var val = structuredClone(defaultViewSelection);
                            val.playerDetails = true;
                            return val;
                        })
                    }} type="button" className="normal-case flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >
                        Go to Player Details...</div>
                    }
                </div>
                <div className='flex flex-col w-full h-full justify-between overflow-auto'>

                    {view.liveBidding && <div className='flex flex-col w-full min-w-full h-full min-h-[300px] items-center  overflow-auto'>
                        <div className="flex bg-slate-300 w-full flex-col px-4 py-1 space-y-1 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                            <div className="flex items-center flex-1 space-x-4 p-2 font-bold uppercase">
                                Live Bidding Updates
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row max-w-full  w-full h-full flex-wrap items-center pt-2 overflow-auto justify-start gap-2 md:justify-center mx-auto" >
                            {(currentPlayer && Object.keys(currentPlayer).length > 0) ? <>
                                <div className='flex flex-col w-[100%] md:w-[49%]'>
                                    {getPlayerCard(currentPlayer)}
                                </div>
                                <div className='flex-1 flex flex-col w-[100%] md:w-[49%] max-h-full items-center overflow-auto'>
                                    <div className='font-medium'> Current Bidding...</div>
                                    {(currentPlayer.bidding && currentPlayer.bidding.length > 0) ? <div className='flex max-w-[400px] w-full flex-col gap-[1px] overflow-auto'>
                                        {getBiddingView(currentPlayer)}
                                    </div> : <div className='normal-case font-medium'>
                                        Bidding not start yet
                                    </div>}
                                </div>
                            </> : <>
                                <div className='flex flex-row normal-case font-medium'>Bidding status is not available, please wait for sometime</div>
                            </>}
                        </div>
                    </div>}

                    {view.team &&
                        <AuctionTeamView currentTeamPlayerMap={currentTeamPlayerMap} teamPlayerMap={teamPlayerMap} setCurrentTeamPlayerMap={setCurrentTeamPlayerMap} teams={teams} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />
                    }

                    {view.playerDetails && <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full h-auto max-h-[100vh] px-4 mx-auto max-w-[100vw] lg:px-12 p-1 overflow-auto">
                        {/* <div className="px-4 mx-auto max-w-screen-2xl h-full lg:px-12 p-1"> */}
                        <div className="flex flex-col h-full mx-h-full mx-w-full bg-white shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                            <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                <div className="flex items-center flex-1 space-x-4">
                                    <h5>
                                        <span className="text-gray-900">{`Players: ${playersCopy.length} || Selected players: ${players.length}`}</span>
                                    </h5>
                                </div>
                            </div>

                            <div className="relative w-full h-full overflow-auto">
                                <table className="w-full max-w-full text-sm text-left h-full overflow-auto text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            {requiredPlayerColumnForDisplay.map(key => {
                                                return (<th key={"filterColumnHeader_" + key} scope="col" className="px-4 py-1"><div className='flex flex-row items-center gap-2'><div>{key}</div><div className='cursor-pointer' onClick={() => { }}> {downArrowIcon}</div></div></th>)
                                            })}
                                        </tr>

                                        {/* filters */}
                                        <tr className='pb-2' >
                                            {requiredPlayerColumnForDisplay.map(key => {
                                                if (filterFields.includes(key)) {
                                                    return (<th key={"filterColumn_" + key} scope="col" className="px-1 py-1 w-full">
                                                        <div className="relative w-full min-w-12">
                                                            {/* <span className="absolute inset-y-0 left-3 flex items-center cursor-pointer pointer-events-none">
                                                                    {getFilterFieldDisplayText(key)}
                                                                </span> */}
                                                            <select
                                                                onChange={(e) => {
                                                                    var val = e.target.value;
                                                                    val = val == "" ? null : val;
                                                                    setSelectedPlayerListFilters((old) => {
                                                                        old = structuredClone(old);
                                                                        old[key] = val;
                                                                        return old;
                                                                    })
                                                                }}
                                                                name={key + "_filter_select_element"}
                                                                id={key + "_filter_select_element"}
                                                                defaultValue={""}
                                                                className=" min-w-24 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                                            >
                                                                <option className='min-w-24 text-black' value={""}>-</option>

                                                                {playerListFilters && playerListFilters[key] && playerListFilters[key].length > 0 && playerListFilters[key].map((opt, _index) => {
                                                                    return (
                                                                        <option className='flex items-center min-w-24 text-black' key={key + "_filter_select_element_option_" + _index} value={opt.value} >
                                                                            {/* <input onChange={(e) => { }} checked={true} id="checkbox-table-search-1" type="checkbox" className="bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" /> */}
                                                                            {/* <label htmlFor="checkbox-table-search-1" className="sr-only">{opt.displayValue}</label> */}
                                                                            {opt.displayValue}
                                                                        </option>
                                                                    )
                                                                })}
                                                            </select>
                                                        </div>
                                                    </th>)
                                                } else {
                                                    return (<th key={"filterColumn_" + key} scope="col" className="px-4 py-1"></th>)
                                                }
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className='overflow-auto'>
                                        {players.length > 0 && players.map((player, rowIndex) => {
                                            return (
                                                <tr key={"player-" + rowIndex} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    {requiredPlayerColumnForDisplay.map((key, colIndex) => {
                                                        if (player.hasOwnProperty(key)) {
                                                            var value = "";
                                                            if (key == "auctionSet") { value = getSetName(player[key]) }
                                                            else if (key == "team") { if (player[key]) { value = getTeamName(player[key]); } else { value = "-"; } }
                                                            else if (key == "soldPrice" || key == "basePrice") { value = getTeamBudgetForView(player[key]) }
                                                            else { value = player[key]; }
                                                            return (
                                                                <td key={"player-" + rowIndex + "-" + colIndex} className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{value}</td>
                                                            )
                                                        }
                                                        return null;
                                                    })}

                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </section>}
                </div>
            </div>
        </div>
    )
}
