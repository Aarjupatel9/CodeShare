import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import "./auction.css";
import { undoIcons } from "../assets/svgs"
import { io } from "socket.io-client";
const SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;

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
    const [isAPICallInProgress, setIsAPICallInProgress] = useState(null);

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
        setIsAPICallInProgress(true);
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
            console.error("getAuctionData", res);
            if (res.auction) {
                setAuction(res.auction);
            }
            if (res.teams) {
                setTeams(res.teams);
            } if (res.sets) {
                let orderedSet = res.sets.sort((s1, s2) => { return s1.order - s2.order });
                setSets(orderedSet);
            }
            if (res.players && res.players.length > 0) {
                setPlayers(res.players);
            }
            if (res.sets && res.players) {
                let data = [];
                let map = {};
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
            }
            if (res.teams && res.players) {
                let data = [];
                let map = {};
                res.teams && res.teams.forEach((t) => {
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
                        let rb = map[key].reduce((total, p) => {
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
            toast.error(error, { duration: 3000 });
        }).finally(() => {
            setIsAPICallInProgress(false);
        });
    }

    function createAuctionSocket() {
        if (socket) {
            socket.disconnect();
        }
        const newSocket = new io(SOCKET_ADDRESS, {
            query: { slug: "auction-" + auctionId },
            path: "/auction/", // Custom path for Socket.IO
        });
        newSocket.emit("newPlayerBiddingUpdate", player);
        newSocket.on("getPlayerBiddingUpdate", () => {
            newSocket.emit("newPlayerBiddingUpdate", player);
        });
        setSocket(newSocket);
    }
    useEffect(() => {
        if (sets && sets.length > 0 && setPlayerMap && setPlayerMap.length > 0) {
            updateAuctionDetails();
        }
    }, [sets, setPlayerMap]);

    useEffect(() => {
        if (teamPlayerMap && teamPlayerMap.length > 0) {
            let isAuctionOver = true;
            for (let i = 0; i < teamPlayerMap.length; i++) {
                let m = teamPlayerMap[i];
                if (m.players.length < 13) {
                    isAuctionOver = false;
                }
            }
            if (isAuctionOver) {
                toast.success("Auction is completed, no team can bid now, thank you!!", { duration: 3000 })
            } else {
                console.debug("auction is running");
            }
        }
    }, [teamPlayerMap]);

    const getIdlePlayer = (set) => {
        let mapping = setPlayerMap.find((m) => { return m.set == set._id });

        let playerArray = mapping ? mapping.players : undefined;
        if (!playerArray) { return; }
        let biddingPlayers = playerArray.filter((p) => {
            return p.auctionStatus == "bidding"
        })
        let idlePlayers = playerArray.filter((p) => {
            return p.auctionStatus == "idle"
        })

        return { biddingPlayers, idlePlayers }
    }

    function getRunningSet(sets) {
        return sets.find((s) => { return s.state == "running" });
    }

    function checkSetComplete(runningSet, setPlayerMap) {
        let mapping = setPlayerMap.find((m) => { return m.set == runningSet._id });
        let players = mapping ? mapping.players : [];
        let px = players.find((p) => { return (p.auctionStatus == "bidding" || p.auctionStatus == "idle") });
        return px ? false : true;
    }

    const updateAuctionDetails = () => {
        const runningSet = getRunningSet(sets);
        console.debug("updateAuctionDetails runningSet ", runningSet);

        if (runningSet) {
            setCurrentSet(runningSet);

            let data = getIdlePlayer(runningSet);
            let remainingPlayers;
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
            console.debug("updateAuctionDetails isCompleted ", isCompleted);

            if (isCompleted) {
                setIsAPICallInProgress(true);
                AuctionService.updateAuctionSet({ set: { _id: runningSet._id, state: "completed" }, auction: auction }).then((res) => {
                    toast.success("Set is completed, please select next set for bidding", { duration: 3000 });
                }).catch((err) => {
                    toast.error(err, { duration: 3000 });
                    console.error(err);
                }).finally(() => {
                    setIsAPICallInProgress(false);
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


            let setDetails = getIdlePlayer(runningSet);
            if (setDetails && setDetails.biddingPlayers && setDetails.biddingPlayers.length > 0) {
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
        if (socket) {
            socket.emit("newPlayerBiddingUpdate", player);
        }
    }, [player])
    useEffect(() => {
        // if (auctionDetails.state == "ended") {
        //     toast.success("Bidding for all player is completed", { duration: 3000 });
        // }
    }, [auctionDetails.state])

    const pickUpRandomPlayer = () => {
        console.debug("Idel payers list ", auctionDetails);
        let playerArray = setPlayerMap.find((m) => { return m.set == auctionDetails.currentSet._id }).players;
        const idlePlayer = playerArray.filter((p) => {
            if (p.auctionStatus == "idle") {
                return p;
            }
        })
        if (idlePlayer.length == 0) {
            toast.error("idlePlayer undefined bug in pickup randome player", { duration: 3000 });
            return;
        }
        console.debug("idlePlayer", idlePlayer)
        let randomPlayer = idlePlayer[getRandomNumber(0, idlePlayer.length - 1)];
        console.debug("randomPlayer", randomPlayer);
        setIsAPICallInProgress(true);
        AuctionService.updateAuctionPlayer({ players: [{ _id: randomPlayer._id, auctionStatus: "bidding" }] }).then((res) => {
            toast.success("Start bidding for player " + randomPlayer.name + " at base price " + randomPlayer.basePrice, { duration: 3000 })
        }).catch((err) => {
            toast.error(err);
            console.error(err);
        }).finally(() => {
            setIsAPICallInProgress(false);
            getAuctionData();
        });

    }
    function getRandomNumber(min, max) {
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
        for (let i = 0; i < teamPlayerMap.length; i++) {
            let m = teamPlayerMap[i];
            if (m.team == teamId && m.players.length < auction.maxTeamMember) {
                return true;
            }
        }
        return false;
    }

    const handleTeamClick = (team) => {
        if (!canTeamBid(team._id)) {
            // toast.error("Team have maximum players", { duration: 3000 });
            return;
        }
        if (player && Object.keys(player).length > 0 && player.auctionStatus == "bidding") {

            const newBiddingState = structuredClone(player.bidding);
            if (newBiddingState.length > 0 && newBiddingState[newBiddingState.length - 1].team == team._id) {
                toast.error("Can not bid repeatativelly", { duration: 2000 });
                return;
            }

            let nextBid;
            if (newBiddingState.length > 0) {
                const lastBid = newBiddingState[newBiddingState.length - 1].price;
                nextBid = getNextPrice(lastBid)
            } else {
                nextBid = player.basePrice;
            }
            if (nextBid > team.remainingBudget) {
                toast.error("Not enough purse to bid the player", { duration: 3000 });
                return;
            }

            newBiddingState.push({ team: team._id, price: nextBid })
            setPlayer((old) => {
                old = structuredClone(old);
                old.bidding.push({ team: team._id, price: nextBid });
                return old;
            })

            newBiddingState.sort((b1, b2) => { return b1.price - b2.price });
            setIsAPICallInProgress(true);
            AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, bidding: newBiddingState }] }).then((res) => {
                let toastId = toast.success("Current bid at " + nextBid + " of team " + team.name, { duration: 3000 });
            }).catch((err) => {
                toast.error(err.toString(), { duration: 3000 });
                console.error(err);
            }).finally(() => {
                setIsAPICallInProgress(false);
                // getAuctionData();
            });
        }
    }
    const getTeamName = (teamId) => {
        let team = teams.find((t) => { return t._id == teamId });
        if (team) {
            return team.name;
        } else {
            return "null";
        }
    }
    const getTeamBudget = (teamId, teams) => {
        let team = teams.find((t) => { return t._id == teamId });
        if (team) {
            return parseInt(team.budget);
        } else {
            return "null";
        }
    }
    const getTeamPlayerCount = (team) => {
        for (let i = 0; i < teamPlayerMap.length; i++) {
            let m = teamPlayerMap[i];
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
                toast.error("Can not undo for unbidded player", { duration: 3000 });
                return;
            }


            const popedBid = newBiddingState.pop();
            setPlayer((old) => {
                old = structuredClone(old);
                old.bidding.pop();
                return old;
            })

            newBiddingState.sort((b1, b2) => { return b1.price - b2.price });
            setIsAPICallInProgress(true);
            AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, bidding: newBiddingState }] }).then((res) => {
                toast.success("Undo last bid from team " + getTeamName(popedBid.team), { duration: 3000 });
            }).catch((err) => {
                toast.error(err, { duration: 3000 });
                console.error(err);
            }).finally(() => {
                setIsAPICallInProgress(false);
                getAuctionData();
            });
        }
    }

    const getBiddingView = () => {
        if (player && Object.keys(player).length > 0 && player.bidding.length > 0) {
            let x = structuredClone(player.bidding);
            x.reverse();
            return x.map((b, index) => {
                return (
                    <div className={`${index == 0 ? "bg-green-400" : "bg-slate-300"} flex flex-row justify-center w-full  rounded p-2 `}>
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
        let name = player.name;
        name = name.split(" ");
        let sn = name[0][0];
        if (name[1]) {
            sn += name[1][0];
        }
        return (<div className='flex flex-col justify-center items-center text-6xl  w-[125px] h-[125px] max-w-[125px] max-h-[125px] md:w-[150px] md:h-[150px] md:max-w-[150px] md:max-h-[150px] lg:w-[200px] lg:h-[200px] lg:max-w-[200px] lg:max-h-[200px] capitalize'>{sn}</div>)
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
                                if (confirmText == "confirm") {
                                    handlePlayerSold();
                                    toast.dismiss(t.id);
                                } else {
                                    toast.error("please enter 'confirm' for continue", { duration: 3000 })
                                }
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                        Continue
                    </button>
                </div>
            </div>
        ), { duration: 60000 });
    }

    const handlePlayerSold = () => {
        if (player) {
            if (player.bidding.length == 0) {
                setIsAPICallInProgress(true);
                AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, auctionStatus: "unsold" }] }).then((res) => {
                    toast.success("Player - " + player.name + " is unsold", { duration: 3000 })
                    socket.emit("playerSoldUpdate", "Player - " + player.name + " is unsold");
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err, { duration: 3000 });
                    console.error(err);
                }).finally(() => {
                    setIsAPICallInProgress(false);
                    getAuctionData();
                });
            } else {
                let biddingState = structuredClone(player.bidding);
                biddingState.sort((b1, b2) => { return b1.price - b2.price });
                let team = biddingState[biddingState.length - 1].team;
                let soldPrice = biddingState[biddingState.length - 1].price;
                setIsAPICallInProgress(true);
                AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, auctionStatus: "sold", bidding: biddingState, team: team, soldPrice: soldPrice }] }).then((res) => {
                    let message = "" + player.name + " is sold to team - " + getTeamName(biddingState[biddingState.length - 1].team) + " at price " + getTeamBudgetForView(biddingState[biddingState.length - 1].price);
                    toast.success(message, { duration: 5000 });
                    socket.emit("playerSoldUpdate", message);
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err, { duration: 3000 });
                    console.error(err);
                }).finally(() => {
                    setIsAPICallInProgress(false);
                    getAuctionData();
                });
            }
        }
    }

    const handleSelectNextSet = (set, t) => {
        setIsAPICallInProgress(true);
        AuctionService.updateAuctionSet({ set: { _id: set._id, state: "running" }, auction: auction }).then((res) => {
            toast.success("Please start bidding for set - " + set.name, { duration: 3000 });
        }).catch((err) => {
            toast.error(err, { duration: 3000 });
            console.error(err);
        }).finally(() => {
            setIsAPICallInProgress(false);
            toast.dismiss(t.id);
            getAuctionData();
        });
    }

    const selectNextSet = () => {
        let selectableSet = sets.filter((s) => { return s.state == "idle" });
        if (!selectableSet) {
            console.debug("selectableSet", selectableSet);
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
                    <div className='flex flex-row flex-wrap max-w-400px overflow-auto gap-3'>
                        {selectableSet && selectableSet.length > 0 && selectableSet.map((set, index) => {
                            return (<div className=''>
                                <button className='button bg-slate-300 cursor-pointer rounded p-2' onClick={() => { handleSelectNextSet(set, t) }}> {set.name}</button>
                            </div>)
                        })}
                    </div>
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
        ), { duration: 60000 });
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
                            <div className='font-medium'>{(auctionDetails && auctionDetails.currentSet && Object.keys(auctionDetails.currentSet).length > 0 && auctionDetails.currentSet.name) ? (`Current set -  ${auctionDetails.currentSet.name} , Remaining player - ${auctionDetails.remainingPlayerInCurrentSet ? auctionDetails.remainingPlayerInCurrentSet : "0"}`) : ("Please select next set to continue")} </div>
                            {auctionDetails && auctionDetails.selectSet && <div onClick={() => { selectNextSet() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                Select next set
                            </div>}
                            {auctionDetails && auctionDetails.shouldNext && <div onClick={() => { pickUpRandomPlayer() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                Pick up random player
                            </div>}

                            {player && Object.keys(player).length > 0 && <div onClick={() => { confirmPlayerSoldUnsold() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                {player.bidding.length == 0 ? "Un sold" : "Sold to " + getTeamName(player.bidding[player.bidding.length - 1].team)}
                            </div>}
                        </div>
                        <div className='flex-1 flex flex-col md:flex-row  w-full h-full flex-wrap items-center pt-2 overflow-auto justify-start gap-2 md:justify-center mx-auto'>
                            {!auctionDetails.shouldNext ? <>
                                <div className='PlayerProfile flex flex-col w-[100%] md:w-[49%]'>
                                    {getPlayerCard(player)}
                                </div>
                                <div className='PlayerProfile flex flex-col w-[100%] md:w-[49%] max-h-full items-center overflow-auto'>
                                    {(player.bidding && player.bidding.length > 0) ? <div className='flex max-w-[400px] w-full flex-col gap-[1px] overflow-auto'>
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
                        <div className='flex flex-row justify-center flex-wrap bg-gray-200 gap-2 p-2'>
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
