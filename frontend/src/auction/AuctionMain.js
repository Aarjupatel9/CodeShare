import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';

export default function AuctionMain(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [currentTeamPlayerMap, setCurrentTeamPlayerMap] = useState(null);


    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        var localAuction = JSON.parse(localStorage.getItem("CurrentAuction"));
        getAuctionData()
    }, [])
    const getAuctionData = () => {
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
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

    const canStartAuction = () => {
        console.log("called");
        if (auction || auction.state == "setup") {
            AuctionService.updateAuction({ auction: { _id: auctionId, state: "running" } }).then((res) => {
                navigate(window.location.pathname + "/bidding");
            }).catch((err) => {
                toast.error(err);
                console.log(err);
            })
            return false;
        } else if (auction.state == "running") {
            return true;
        }
        return false;
    }

    const openBiddingProcess = () => {
        if (canStartAuction()) {
            navigate(window.location.pathname + "/bidding");
        }
    }
    const openSetManagementBoard = () => {
        console.log(window.location.pathname);
        navigate(window.location.pathname + "/manageset");
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
    const openLiveUpdatePage = () => {
        navigate("/t/auction/"+auctionId+"/live");
    }

    return (
        <>
            <div className='flex flex-col w-full h-full text-sx gap-4 p-4'>
                <div className='header flex flex-row justify-start gap-2 font-medium capitalize'>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openBiddingProcess() }}>Continue Bidding process</div>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openSetManagementBoard() }}>Auction Details</div>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openLiveUpdatePage() }}>Auction Live update</div>
                </div>
                <div className='flex flex-col h-full max-h-full overflow-auto rounded gap-2'>
                    <div className='p-2 bg-slate-500 font-bold uppercase'>
                        Team Details
                    </div>
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
                    </div>
                </div>

            </div>
        </>
    )
}
