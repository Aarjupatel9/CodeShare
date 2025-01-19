import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { backArrowIcon } from '../assets/svgs';

export default function AuctionMain(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [currentTeamPlayerMap, setCurrentTeamPlayerMap] = useState(null);
    const [viewTeam, setViewTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

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
    const openManagementBoard = () => {
        console.log(window.location.pathname);
        navigate(window.location.pathname + "/manage");
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
        navigate("/t/auction/" + auctionId + "/live");
    }
    const getTeamLogo = (team) => {
        console.log(team)
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
    const getProfilePicture = (player) => {
        var name = player.name;
        name = name.split(" ");
        let sn = name[0][0];
        if (name[1]) {
            sn += name[1][0];
        }
        return (<div className='flex flex-col justify-center items-center sm:text-xl md:text-2xl lg:text-4xl sm:min-w-[100px] sm:min-w-[100px] md:min-w-[150px] sm:min-h-[100px] sm:min-h-[100px] lg:min-h-[150px] capitalize'>{sn}</div>)
    }
    const getPlayerCard = (player) => {
        if (player && Object.keys(player).length > 0) {
            return (
                <div className={`flex flex-row justify-center items-center sm:gap-1 md:gap-1 lg:gap-2  rounded sm:p-1 md:p-2 `}>

                    <div className="bg-slate-200  sm:max-w-[200px] md:max-w-[300px] lg:max-w-[300px] rounded-full">
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

    return (<div className='flex flex-col w-full h-full sm:text-xs md:text-lg lg:text-xl sm:gap-2 md:gap-2 lg:gap-4 sm:p-1 md:p-2 lg:p-4'>
        <div className='header flex flex-row justify-center gap-2 font-medium capitalize'>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openBiddingProcess() }}>Continue Bidding process</div>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openManagementBoard() }}>Auction Details</div>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openLiveUpdatePage() }}>Auction Live update</div>
        </div>
        <div className='flex flex-col h-auto h-full rounded gap-2 overflow-auto'>
            <div className='flex flex-row justify-center p-2 bg-slate-500 font-bold uppercase'>
                {currentTeamPlayerMap && <div onClick={() => { displayTeamBoard() }} className='absolute left-5 cursor-pointer'>
                    {backArrowIcon}
                </div>}
                {currentTeamPlayerMap ? getTeamName(currentTeamPlayerMap.team) : "Teams"}
            </div>

            {!currentTeamPlayerMap && <div className='flex flex-row gap-2 w-auto h-auto max-h-full flex-wrap mx-auto'>
                {(teamPlayerMap && teamPlayerMap.length) > 0 ? teamPlayerMap.map((map, index) => {
                    return (<div onClick={() => { setCurrentTeamPlayerMap(map) }} key={"team_" + index}
                        className={`flex lg:w-[32.7%] md:w-[49%] sm:w-[100%]  gap-4 p-4 flex-row items-start bg-gray-200 cursor-pointer rounded-lg  ${currentTeamPlayerMap && currentTeamPlayerMap.team == map.team ? "bg-gray-400" : "bg-gray-200"}`}>
                        <div class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-dark">
                            {/* <img
                                            src="user-image-url.jpg"
                                            alt="User Image"
                                            class="w-full h-full rounded-full object-cover hidden"
                                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                        /> */}
                            <span class="flex ">
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
    </div>)
}
