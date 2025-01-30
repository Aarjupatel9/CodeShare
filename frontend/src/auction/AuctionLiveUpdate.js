import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { io } from "socket.io-client";
import { backArrowIcon, downArrowIcon } from '../assets/svgs';

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
            console.log("playerBiddingUpdate comming", player);
            setCurrentPlayer(player);
        });
        socket.on("playerSoldUpdate", (message) => {
            console.log("playerSoldUpdate comming", message);
            toast.success(message);
        });

        setSocket(socket);
    }
    useEffect(() => {
        var auctionStatus = selectedPlayerListFilters.auctionStatus
        var team = selectedPlayerListFilters.team
        var auctionSet = selectedPlayerListFilters.auctionSet

        if (players && players.length > 0) {

            playersCopy.sort((p1, p2) => p1.playerNumber - p2.playerNumber);
            var filterdPlayers = playersCopy.filter((p) => {
                var shouldDisplay = true;
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
            console.log(res);
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
            console.log(error);
            toast.error(error);
            setIsLinkValid(false);
            navigate("/t/auction/");
        });
    }

    useEffect(() => {
        console.log("view ", view);
    }, [view])

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
            console.log("x", player.bidding, x);
            return x.map((b, index) => {
                return (
                    <div className={`${index == 0 ? "bg-green-400" : "bg-slate-300"} flex flex-row justify-center    rounded p-2 `}>
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
                <div className={` flex flex-row justify-center  items-center gap-4 rounded p-2 `}>

                    <div className="bg-slate-200  max-w-[400px] rounded-full">
                        {getProfilePicture(player)}
                    </div>

                    <div className='flex flex-col justify-start items-start '>
                        <div className='font-medium'>Number - {player.playerNumber}</div>
                        <div className='font-medium'>Name - {player.name}</div>
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
        return (<div className='flex flex-col justify-center items-center text-6xl min-w-[200px] min-h-[200px] capitalize'>{sn}</div>)
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

    return (
        <>
            <div className='flex flex-col w-full h-full text-sx gap-4 p-2'>
                <div className='header flex flex-row justify-start gap-2 font-medium capitalize'>
                    <div onClick={() => { navigate("/t/auction/" + auctionId) }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >Auction Home</div>
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
                        <div className={`flex flex-row w-full h-full items-center pt-2 overflow-auto ${currentPlayer && Object.keys(currentPlayer).length > 0 ? "justify-between" : "justify-center"} mx-auto`} >
                            {(currentPlayer && Object.keys(currentPlayer).length > 0) ? <> <div className='PlayerProfile flex flex-col w-[50%]'>
                                {getPlayerCard(currentPlayer)}
                            </div>
                                <div className='PlayerProfile flex flex-col w-[50%] max-h-full overflow-auto'>
                                    {(currentPlayer.bidding && currentPlayer.bidding.length > 0) ? <div className='flex max-w-[400px] flex-col gap-[1px] overflow-auto'>
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
                        <div className='flex flex-col h-auto h-full rounded gap-2 overflow-auto'>
                            <div className='flex flex-row justify-center p-2 bg-slate-500 font-bold uppercase'>
                                {currentTeamPlayerMap && <div onClick={() => { displayTeamBoard() }} className='absolute left-5 cursor-pointer'>
                                    {backArrowIcon}
                                </div>}
                                {currentTeamPlayerMap ? getTeamName(currentTeamPlayerMap.team) : "Teams"}
                            </div>

                            {!currentTeamPlayerMap && <div className='flex flex-row gap-2 w-full h-auto max-h-full flex-wrap mx-auto'>
                                {(teamPlayerMap && teamPlayerMap.length) > 0 ? teamPlayerMap.map((map, index) => {
                                    return (<div onClick={() => { setCurrentTeamPlayerMap(map) }} key={"team_" + index}
                                        className={`flex lg:w-[32.7%] md:w-[49%] sm:w-[100%]  gap-4 p-4 flex-row items-start bg-gray-200 cursor-pointer rounded-lg  ${currentTeamPlayerMap && currentTeamPlayerMap.team == map.team ? "bg-gray-400" : "bg-gray-200"}`}>
                                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-dark">
                                            {/* <img
                                                    src="user-image-url.jpg"
                                                    alt="User Image"
                                                    className="w-full h-full rounded-full object-cover hidden"
                                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                                /> */}
                                            <span className="flex ">
                                                {getTeamLogo(map.team)}
                                            </span>
                                        </div>
                                        <div className='flex flex-col gap-2 flex-grow flex-start'>
                                            <div className='text-lg font-bold text-center'>{getTeamName(map.team)}</div>
                                            <div className='text-xs font-medium text-center'>Total player - {map.players.length}</div>
                                            <div className='text-xs font-medium text-center'>Remaining Budgert - {getTeamBudgetForView(map.remainingBudget)}</div>
                                        </div>
                                    </div>)
                                }) : <>
                                    <div className='normal-case font-medium'>
                                        No team added in the auction
                                    </div>
                                </>}
                            </div>}
                            {currentTeamPlayerMap && <div className='flex flex-row flex-wrap gap-2 w-full h-full overflow-auto'>
                                <div className='PlayerPannel flex flex-col gap-2 lg:w-[30%] sm:w-[100%] md:w-[30%] h-full overflow-auto'>
                                    <div key={"player_" + "title"} className='flex flex-col items-start bg-slate-400 p-2 rounded'>
                                        <div className='font-bold '>Player List</div>
                                    </div>
                                    <div className='flex flex-col gap-2 overflow-auto'>
                                        {(currentTeamPlayerMap.players.length) > 0 ? currentTeamPlayerMap.players.map((player, index) => {
                                            return (
                                                <div onClick={() => { setSelectedPlayer(player) }} key={"player_" + index} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                                                    <div className='font-medium '>{player.name}</div>
                                                    <div className='text-xs'>Role - {player.role}  </div>
                                                    <div className='text-xs'>Sold - {getTeamBudgetForView(player.soldPrice)}  </div>
                                                </div>)
                                        }) : <div className='flex flex-col w-full mt-5 justify-center normal-case font-medium gap-2 w-[50%]'>
                                            Team has no player
                                        </div>}
                                    </div>
                                </div>
                                <div className='PlayerPannel flex flex-col gap-2 lg:w-[69%] sm:w-[100%] md:w-[68%]  h-full overflow-auto'>
                                    <div key={"player_" + "title"} className='flex flex-col items-start bg-slate-400 p-2 rounded'>
                                        <div className='font-bold '>Player Details</div>
                                    </div>
                                    {selectedPlayer ? <div className='flex flex-row flex-wrap h-full gap-1 justify-center overflow-auto'>
                                        <div className='PlayerProfile flex flex-col lg:w-[80%] lgxl:w-[50%] sm:w-[100%] md:w-[100%]'>
                                            {getPlayerCard(selectedPlayer)}
                                        </div>
                                        <div className='PlayerProfile flex flex-col lg:w-[50%] sm:w-[100%] md:w-[100%] h-full flex-grow max-w-[400px] gap-[1px] overflow-auto'>
                                            {(selectedPlayer.bidding && selectedPlayer.bidding.length > 0) && getBiddingView(selectedPlayer)}
                                        </div>
                                    </div> : <div className='flex flex-col w-full mt-5 justify-center normal-case font-medium gap-2 w-[50%]'>
                                        Select player to view bidding history
                                    </div>}
                                </div>
                            </div>}
                        </div>
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
                                                return (<th scope="col" className="px-4 py-1"><div className='flex flex-row items-center gap-2'><div>{key}</div><div className='cursor-pointer' onClick={() => { }}> {downArrowIcon}</div></div></th>)
                                            })}
                                        </tr>

                                        {/* filters */}
                                        <tr className='pb-2' >
                                            {requiredPlayerColumnForDisplay.map(key => {
                                                if (filterFields.includes(key)) {
                                                    return (<th scope="col" className="px-1 py-1 w-full">
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
                                                                className=" min-w-48 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                                            >
                                                                <option className='min-w-48 text-black' value={""}>-</option>

                                                                {playerListFilters && playerListFilters[key] && playerListFilters[key].length > 0 && playerListFilters[key].map((opt, _index) => {
                                                                    return (
                                                                        <option className='flex items-center min-w-48 text-black' key={key + "_filter_select_element_option_" + _index} value={opt.value} >
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
                                                    return (<th scope="col" className="px-4 py-1"></th>)
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
        </>
    )
}
