import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import "./auction.css";
import { undoIcons } from "../assets/svgs"
import { io } from "socket.io-client";
var SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;

//auctionStatus : idle, bidding, sold, unsold
const tabName = ["Marquee", "AR1", "AR2", "AR3", "BA1", "BA2", "BA3", "WK1", "WK2",]
const requiredSetColumnForDisplay = ["name"];
export default function AuctionBidding(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [sets, setSets] = useState([]);
    const [setPlayerMap, setSetPlayerMap] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [view, setView] = useState({ set: false });
    const [player, setPlayer] = useState({});
    const [currentSet, setCurrentSet] = useState({});
    const [auctionDetails, setAuctionDetails] = useState({});
    const [socket, setSocket] = useState(null);


    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getAuctionData();
        createAuctionSocket();
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [])

    const getAuctionData = () => {
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
            console.log("getAuctionData", res);
            if (res.auction) {
                setAuction(res.auction);
            }
            if (res.teams) {
                setTeams(res.teams);
            } if (res.sets) {
                var orderedSet = res.sets.sort((s1, s2) => { return s1.order - s2.order });
                setSets(orderedSet);
            }
            if (res.players && res.players.length > 0) {
                setPlayers(res.players);
            }
            if (res.sets && res.players) {
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
                console.log("setSetPlayerMap", data);
                setSetPlayerMap(data);
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
                Object.keys(map).map((key) => {
                    if (key != "null") {
                        var rb = map[key].reduce((total, p) => {
                            return total + parseInt(p.soldPrice);
                        }, 0);
                        rb = getTeamBudget(key, res.teams) - rb;
                        data.push({ team: key, players: map[key], remainingBudget: rb });
                    }
                })
                setTeamPlayerMap(data);
            }
        }).catch((error) => {
            console.error(error);
            if (error == "TokenExpiredError") {
                navigate("/auth/login")
            }
            toast.error(error);
        });
    }

    function createAuctionSocket() {
        const socket = new io(SOCKET_ADDRESS, {
            query: { slug: "auction-" + auctionId },
            path: "/auction/", // Custom path for Socket.IO
        });
        socket.emit("newPlayerBiddingUpdate", player);
        socket.on("getPlayerBiddingUpdate", () => {
            socket.emit("newPlayerBiddingUpdate", player);
        });
        setSocket(socket);
    }
    useEffect(() => {
        console.log(setPlayerMap, sets)
        if (sets && sets.length > 0 && setPlayerMap && setPlayerMap.length > 0) {
            updateAuctionDetails();
        }
    }, [sets, setPlayerMap]);

    useEffect(() => {
        if (teamPlayerMap && teamPlayerMap.length > 0) {
            var isAuctionOver = true;
            for (var i = 0; i < teamPlayerMap.length; i++) {
                var m = teamPlayerMap[i];
                if (m.players.length < 13) {
                    isAuctionOver = false;
                }
            }
            if (isAuctionOver) {
                toast.success("Auction is completed, no team can bid now, thank you!!")
            } else {
                console.log("auction is running");
            }
        }
    }, [teamPlayerMap]);

    const getIdlePlayer = (set) => {
        var mapping = setPlayerMap.find((m) => { return m.set == set._id });

        var playerArray = mapping ? mapping.players : undefined;
        if (!playerArray) { return; }
        var biddingPlayers = playerArray.filter((p) => {
            return p.auctionStatus == "bidding"
        })
        var idlePlayers = playerArray.filter((p) => {
            return p.auctionStatus == "idle"
        })

        return { biddingPlayers, idlePlayers }
    }

    function getRunningSet(sets) {
        return sets.find((s) => { return s.state == "running" });
    }

    function checkSetComplete(runningSet, setPlayerMap) {
        console.log("checkSetComplete", runningSet, setPlayerMap)
        var mapping = setPlayerMap.find((m) => { return m.set == runningSet._id });
        var players = mapping ? mapping.players : [];
        var px = players.find((p) => { return (p.auctionStatus == "bidding" || p.auctionStatus == "idle") });
        return px ? false : true;
    }

    const updateAuctionDetails = () => {

        console.log("updateAuctionDetails start");

        const runningSet = getRunningSet(sets);
        console.log("updateAuctionDetails runningSet ", runningSet);

        if (runningSet) {
            setCurrentSet(runningSet);

            var data = getIdlePlayer(runningSet);
            var remainingPlayers;
            if (data && data.idlePlayers && data.idlePlayers.length > 0) {
                remainingPlayers = data.idlePlayers.length;
            }

            setAuctionDetails((old) => {
                old = structuredClone(old);
                old.selectSet = false;
                old.currentSet = runningSet
                if (remainingPlayers) {
                    old.remainingPlayerInCurrentSet = remainingPlayers
                }
                return old;
            })
        } else {
            setCurrentSet({});
            setAuctionDetails((old) => {
                old = structuredClone(old);
                old.selectSet = true;
                old.shouldNext = false;
                old.currentSet = {};
                return old;
            })
        }
        if (runningSet) {

            const isCompleted = checkSetComplete(runningSet, setPlayerMap);
            console.log("updateAuctionDetails isCompleted ", isCompleted);

            if (isCompleted) {
                AuctionService.updateAuctionSet({ set: { _id: runningSet._id, state: "completed" }, auction: auction }).then((res) => {
                    toast.success("Set is completed, please select next set for bidding");
                }).catch((err) => {
                    toast.error(err);
                    console.log(err);
                }).finally(() => {
                    getAuctionData();
                });

                setCurrentSet({});
                setAuctionDetails((old) => {
                    old = structuredClone(old);
                    old.selectSet = true;
                    delete old.remainingPlayerInCurrentSet
                    return old;
                })
            }


            var setDetails = getIdlePlayer(runningSet);
            if (setDetails.biddingPlayers && setDetails.biddingPlayers.length > 0) {
                setPlayer(setDetails.biddingPlayers[0]);
                setAuctionDetails((old) => {
                    old = structuredClone(old);
                    old.shouldNext = false;
                    return old;
                })
            } else {
                setPlayer({});
                setAuctionDetails((old) => {
                    old = structuredClone(old);
                    old.shouldNext = true;
                    return old;
                })
            }
        }
    }

    useEffect(() => {
        console.log("player details changed ", player);
        if (socket) {
            socket.emit("newPlayerBiddingUpdate", player);
        }
    }, [player])
    useEffect(() => {
        // console.log("auctionDetails.state  changed ",auctionDetails.state );
        // if (auctionDetails.state == "ended") {
        //     toast.success("Bidding for all player is completed");
        // }
    }, [auctionDetails.state])

    const pickUpRandomPlayer = () => {
        console.log("Idelpayer List " + JSON.stringify(auctionDetails));
        var playerArray = setPlayerMap.find((m) => { return m.set == auctionDetails.currentSet._id }).players;
        const idlePlayer = playerArray.filter((p) => {
            if (p.auctionStatus == "idle") {
                return p;
            }
        })
        if (idlePlayer.length == 0) {
            toast.error("idlePlayer undefined bug in pickup randome player");
            return;
        }
        console.log("idlePlayer", idlePlayer)
        var randomPlayer = idlePlayer[getRandomNumber(0, idlePlayer.length - 1)];
        console.log("randomPlayer", randomPlayer);
        AuctionService.updateAuctionPlayer({ players: [{ _id: randomPlayer._id, auctionStatus: "bidding" }] }).then((res) => {
            toast.success("start bidding for player " + randomPlayer.name + " at base price " + randomPlayer.basePrice)
        }).catch((err) => {
            toast.error(err);
            console.log(err);
        }).finally(() => {
            getAuctionData();
        });

    }
    function getRandomNumber(min, max) {
        console.log(min, max)
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    function getNextPrice(lastPrice) {
        lastPrice = parseInt(lastPrice);
        if (lastPrice < 10000000) {
            return lastPrice + 500000;
        } else if ((lastPrice >= 10000000) && (lastPrice < 20000000)) {
            return lastPrice + 1000000;
        } else if ((lastPrice >= 20000000) && (lastPrice < 50000000)) {
            return lastPrice + 2000000;
        } else {
            return lastPrice + 2500000;
        }
    }
    function canTeamBid(teamId) {
        console.log("teamPlayerMap", teamPlayerMap);
        for (var i = 0; i < teamPlayerMap.length; i++) {
            var m = teamPlayerMap[i];
            if (m.team == teamId && m.players.length < 13) {
                return true;
            }
        }
        return false;
    }

    const handleTeamClick = (team) => {
        console.log(team);
        if (!canTeamBid(team._id)) {
            // toast.error("Team have maximum players");
            return;
        }
        if (player && Object.keys(player).length > 0 && player.auctionStatus == "bidding") {

            const newBiddingState = structuredClone(player.bidding);
            if (newBiddingState.length > 0 && newBiddingState[newBiddingState.length - 1].team == team._id) {
                toast.error("Can not bid repeatativelly");
                return;
            }

            var nextBid;
            if (newBiddingState.length > 0) {
                const lastBid = newBiddingState[newBiddingState.length - 1].price;
                nextBid = getNextPrice(lastBid)
            } else {
                nextBid = player.basePrice;
            }
            if (nextBid > team.remainingBudget) {
                toast.error("Not enough purse to bid the player");
                return;
            }

            newBiddingState.push({ team: team._id, price: nextBid })
            setPlayer((old) => {
                old = structuredClone(old);
                old.bidding.push({ team: team._id, price: nextBid });
                return old;
            })

            newBiddingState.sort((b1, b2) => { return b1.price - b2.price });
            AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, bidding: newBiddingState }] }).then((res) => {
                toast.success("Current bid at " + nextBid + " of team " + team.name);
            }).catch((err) => {
                toast.error(err);
                console.error(err);
            }).finally(() => {
                // getAuctionData();
            });
        }
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
    const getTeamPlayerCount = (team) => {
        for (var i = 0; i < teamPlayerMap.length; i++) {
            var m = teamPlayerMap[i];
            if (m.team == team._id) {
                return m.players.length;
            }
        }
        return "Something went wrong";
    }

    const handleBidUndo = (player) => {
        if (player && Object.keys(player).length > 0 && player.auctionStatus == "bidding") {

            const newBiddingState = structuredClone(player.bidding);
            if (newBiddingState.length == 0) {
                toast.error("Can not undo for unbidded player");
                return;
            }


            const popedBid = newBiddingState.pop();
            setPlayer((old) => {
                old = structuredClone(old);
                old.bidding.pop();
                return old;
            })

            newBiddingState.sort((b1, b2) => { return b1.price - b2.price });
            AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, bidding: newBiddingState }] }).then((res) => {
                toast.success("Undo last bid from team " + getTeamName(popedBid.team));
            }).catch((err) => {
                toast.error(err);
                console.log(err);
            }).finally(() => {
                getAuctionData();
            });
        }
    }

    const getBiddingView = () => {
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
                        {index == 0 && <div onClick={() => { handleBidUndo(player) }} className={`bg-gray-200 px-2 rounded ml-auto button cursor-pointer `}>
                            {undoIcons}
                        </div>}
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
        return (<div className='flex flex-col justify-center items-center text-6xl min-w-[200px] min-h-[200px] capitalize'>{sn}</div>)
    }
    const getPlayerCard = (player) => {
        if (player && Object.keys(player).length > 0) {
            return (
                <div className={` flex flex-row justify-center  items-center gap-4 rounded p-2 `}>

                    <div className="bg-slate-200  max-w-[400px] rounded-full">
                        {getProfilePicture(player)}
                    </div>

                    <div className='flex flex-col justify-start items-start '>
                        <div className='font-medium'>Player No. - {player.playerNumber}</div>
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

    const confirmPlayerSoldUnsold = () => {
        let confirmText = '';
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Confirm Player SOLD / UN SOLD
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <div>Please type 'confirm'</div>
                    <input
                        id="newTitle"
                        type="text"
                        placeholder="Auction title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (confirmText = e.target.value)}
                    />
                </div>
                <div className="flex flex-row gap-4 justify-center w-full">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (confirmText.trim()) {
                                console.log(`confirmText action ${confirmText}`);
                                if (confirmText == "confirm") {
                                    handlePlayerSold();
                                    toast.dismiss(t.id);
                                } else {
                                    toast.error("please enter 'confirm' for continue")
                                }
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                        Continue
                    </button>
                </div>
            </div>
        ), { duration: 4000000, });
    }

    const handlePlayerSold = () => {
        if (player) {
            if (player.bidding.length == 0) {
                AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, auctionStatus: "unsold" }] }).then((res) => {
                    toast.success("Player - " + player.name + " is unsold")
                    socket.emit("playerSoldUpdate", "Player - " + player.name + " is unsold");
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err);
                    console.log(err);
                }).finally(() => {
                    getAuctionData();
                });
            } else {
                var biddingState = structuredClone(player.bidding);
                biddingState.sort((b1, b2) => { return b1.price - b2.price });
                var team = biddingState[biddingState.length - 1].team;
                var soldPrice = biddingState[biddingState.length - 1].price;
                AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, auctionStatus: "sold", bidding: biddingState, team: team, soldPrice: soldPrice }] }).then((res) => {
                    let message = "Player - " + player.name + " is sold to team - " + getTeamName(biddingState[biddingState.length - 1].team) + " at price" + getTeamBudgetForView(biddingState[biddingState.length - 1].price);
                    toast.success(message);
                    socket.emit("playerSoldUpdate", message);
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err);
                    console.log(err);
                }).finally(() => {
                    getAuctionData();
                });
            }
        }
    }

    const handleSelectNextSet = (set, t) => {
        AuctionService.updateAuctionSet({ set: { _id: set._id, state: "running" }, auction: auction }).then((res) => {
            toast.success("Please start bidding for set - " + set.name);
        }).catch((err) => {
            toast.error(err);
            console.log(err);
        }).finally(() => {
            toast.dismiss(t.id);
            getAuctionData();
        });
    }

    const selectNextSet = () => {
        var selectableSet = sets.filter((s) => { return s.state == "idle" });
        if (!selectableSet) {
            console.log("selectableSet", selectableSet);
            return;
        }
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Select next set
                </div>
                <div className="flex flex-col items-center items-start w-full space-y-4">
                    <label htmlFor="newTitle" className="text-gray-700">
                        Select Player set to continue
                    </label>
                    {selectableSet && selectableSet.length > 0 && selectableSet.map((set, index) => {
                        return (<div>
                            <button className='button bg-slate-300 cursor-pointer rounded p-2' onClick={() => { handleSelectNextSet(set, t) }}> {set.name}</button>
                        </div>)
                    })}
                </div>
                <div className="flex flex-row gap-4 justify-center w-full">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ));
    }

    const getTeamBudgetForView = (number) => {
        number = parseInt(number);
        return (number / 100000) + " L";
    }

    return (
        <>
            <div className='flex flex-col w-full h-full p-1 text-sx gap-2'>
                <div className='header flex flex-row justify-start gap-2 bg-gray-50'>
                    <div onClick={() => { navigate("/t/auction/" + auctionId) }} className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer">Auction Home</div>
                </div>

                <div className='flex flex-col gap-2 h-full max-h-full overflow-auto bg-gray-100 rounded-lg'>

                    <div className={`${"PlayerPannel-1"}   flex flex-col gap-2 w-full overflow-auto `}>
                        <div className='bg-gray-300 py-3 flex  flex-row justify-between items-center font-medium px-3 normal-case '>
                            <div className='font-medium'>{(auctionDetails && auctionDetails.currentSet && Object.keys(auctionDetails.currentSet).length > 0 && auctionDetails.currentSet.name) ? (`Current set -  ${auctionDetails.currentSet.name} ${auctionDetails.remainingPlayerInCurrentSet && (", Remaining player - " + auctionDetails.remainingPlayerInCurrentSet)}`) : ("Please select next set to continue")} </div>
                            {auctionDetails && auctionDetails.selectSet && <div onClick={() => { selectNextSet() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                Select next set
                            </div>}
                            {auctionDetails && auctionDetails.shouldNext && <div onClick={() => { pickUpRandomPlayer() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                Pick up random player
                            </div>}

                            {player && Object.keys(player).length > 0 && <div onClick={() => { confirmPlayerSoldUnsold() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                {player.bidding.length == 0 ? "Un Sold" : "Make Sold"}
                            </div>}
                        </div>
                        <div className='flex-1 flex flex-row w-full justify-center items-center overflow-auto'>
                            {!auctionDetails.shouldNext ? <> <div className='PlayerProfile flex flex-col w-[50%]'>
                                {getPlayerCard(player)}
                            </div>
                                <div className='PlayerProfile flex flex-col w-[50%] max-h-full overflow-auto'>
                                    {(player.bidding && player.bidding.length > 0) ? <div className='flex max-w-[400px] flex-col gap-[1px] overflow-auto'>
                                        {getBiddingView()}
                                    </div> : <div className='normal-case font-medium'>
                                        Start bidding
                                    </div>}
                                </div>
                            </> : <>
                                <div className='flex flex-row normal-case font-medium'>Please select the player</div>
                            </>}
                        </div>
                    </div>
                    <div className={`${"TeamPannel-1"}TeamPannel-1  flex flex-col gap-2 w-full overflow-auto py-3`}>
                        <div className='flex flex-row justify-center bg-gray-200 gap-2 p-2'>
                            {teams && teams.length && teams.map((team, index) => {
                                return (<div onClick={() => { handleTeamClick(team) }} className={`${canTeamBid(team._id) ? "bg-blue-200 cursor-pointer" : "bg-green-500 cursor-not-allowed"} rounded p-3 `}>
                                    <div className='text-md font-medium'>
                                        {team.name}
                                    </div>
                                    <div className='text-xs'>
                                        Remaining - {getTeamBudgetForView(team.remainingBudget)}
                                    </div>
                                    <div className='text-xs'>
                                        Total Players - {getTeamPlayerCount(team)}
                                    </div>

                                </div>)
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
