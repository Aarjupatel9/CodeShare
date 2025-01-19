import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { io } from "socket.io-client";

var SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;

export default function AuctionLiveUpdate(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState({});
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [currentTeamPlayerMap, setCurrentTeamPlayerMap] = useState(null);
    const [socket, setSocket] = useState(null);
    const [view, setView] = useState({ liveBidding: true, team: true });


    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        var localAuction = JSON.parse(localStorage.getItem("CurrentAuction"));
        getAuctionData();
        createAuctionSocket();
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [])

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
                setPlayers(res.players);
            }

            if (res.teams && res.players) {
                var data = [];
                var map = {};
                res.players.forEach(element => {
                    if (!map[element.team]) {
                        map[element.team] = [];
                    }
                    map[element.team].push(element);
                });
                console.log("map", map)
                Object.keys(map).map((key) => {
                    if (key != "null") {
                        var rb = map[key].reduce((total, p) => {
                            return total + parseInt(p.soldPrice);
                        }, 0);
                        rb = getTeamBudget(key, res.teams) - rb;
                        data.push({ team: key, players: map[key], remainingBudget: rb });
                    }
                })
                console.log("setTeamPlayerMap", data);
                setTeamPlayerMap(data);
            }

        }).catch((error) => {
            console.log(error);
            if (error == "TokenExpiredError") {
                navigate("/auth/login")
            }
            toast.error(error);
        });
    }

    useEffect(() => {
        console.log("auction changed ", teamPlayerMap);
    }, [teamPlayerMap])

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

    return (
        <>
            <div className='flex flex-col w-full h-full text-sx gap-4 p-2'>
                <div className='header flex flex-row justify-start gap-2 font-medium capitalize'>
                    <div onClick={() => { navigate("/t/auction/" + auctionId) }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >Auction Home</div>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { }}>Bidding history</div>
                </div>
                <div className='flex flex-col w-full h-full justify-between overflow-auto'>

                    <div className='flex flex-col w-full min-w-full h-full min-h-[300px] items-center  overflow-auto'>
                        <div className="flex bg-slate-300 w-full flex-col px-4 py-1 space-y-1 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                            <div className="flex items-center flex-1 space-x-4 p-2 font-bold uppercase">
                                Live Bidding Updates
                            </div>
                            <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                                <button onClick={() => {
                                    setView((old) => {
                                        old = structuredClone(old);
                                        old.liveBidding = !old.liveBidding
                                        return old;
                                    })
                                }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                    hide/show
                                </button>
                            </div>
                        </div>
                        {view.liveBidding && <div className={`flex flex-row w-full h-full items-center pt-2 overflow-auto ${currentPlayer && Object.keys(currentPlayer).length > 0 ? "justify-between" : "justify-center"} mx-auto`} >
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
                        </div>}
                    </div>

                    <div className='flex flex-col overflow-auto rounded gap-2'>
                        <div className="flex bg-slate-500 flex-col px-4 py-1 space-y-1 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                            <div className="flex items-center flex-1 space-x-4 p-2 bg-slate-500 font-bold uppercase">
                                Team Details
                            </div>
                            <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                                <button onClick={() => {
                                    setView((old) => {
                                        old = structuredClone(old);
                                        old.team = !old.team
                                        return old;
                                    })
                                }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                    hide/show
                                </button>
                            </div>
                        </div>

                        {view.team && <>
                            <div className='flex flex-row gap-2 w-full h-full max-h-full overflow-auto'>
                                <div className='TeamPannel flex flex-col gap-2 w-[50%] overflow-auto'>
                                    <div key={"team_" + "title"} className='flex flex-col items-start bg-slate-400 p-2 rounded'>
                                        <div className='font-bold '>Team List</div>
                                    </div>
                                    {(teamPlayerMap && teamPlayerMap.length) > 0 ? teamPlayerMap.map((map, index) => {
                                        return (<div onClick={() => { setCurrentTeamPlayerMap(map) }} key={"team_" + index} className={`flex flex-col items-start ${currentTeamPlayerMap && currentTeamPlayerMap.team == map.team ? "bg-gray-400" : "bg-gray-200"} bg-gray-200 cursor-pointer p-2 rounded`}>
                                            <div className='text-lg font-bold'>{getTeamName(map.team)}</div>
                                            <div className='text-xs'>Total player - {map.players.length}</div>
                                            <div className='text-xs'>Remaining Budgert - {getTeamBudgetForView(map.remainingBudget)}</div>
                                        </div>)
                                    }) : <>
                                        <div className='normal-case font-medium'>
                                            No team added for the auction
                                        </div>
                                    </>}
                                </div>
                                <div className='PlayerPannel flex flex-col gap-2 w-[50%] overflow-auto '>
                                    <div key={"player_" + "title"} className='flex flex-col items-start bg-slate-400 p-2 rounded'>
                                        <div className='font-bold '>Player List</div>
                                    </div>
                                    {(currentTeamPlayerMap && currentTeamPlayerMap.players.length) > 0 ? currentTeamPlayerMap.players.map((player, index) => {
                                        return (<>
                                            <div key={"player_" + index} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                                                <div className='font-medium '>{player.name}</div>
                                                <div className='text-xs'>Role - {player.role}  </div>
                                                <div className='text-xs'>Sold - {getTeamBudgetForView(player.soldPrice)}  </div>
                                                {/* <div className='text-xs'>Type - {player.role=="BATTER"&& player.battingHand}  </div> */}
                                            </div>
                                        </>
                                        )
                                    }) : <>
                                        <div className='flex flex-col w-full mt-5 justify-center normal-case font-medium gap-2 w-[50%]'>
                                            Please Select Team To View Player
                                        </div>
                                    </>}
                                </div>
                            </div> </>}
                    </div>
                </div>


            </div>
        </>
    )
}
