import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import "./auction.css";
import { undoIcons } from "../assets/svgs"
import { io } from "socket.io-client";
import { backArrowIcon, defaultTeamLogo } from "../assets/svgs";
import { getTeamName, getTeamBudgetForView } from "./Utility";
import heartBeatSound from "../assets/heart-beat-sound.mp3";
import { UserContext } from '../context/UserContext';
import AuctionModal from './components/AuctionModal';
const SOCKET_ADDRESS = process.env.REACT_APP_SOCKET_ADDRESS;
//auctionStatus : idle, bidding, sold, unsold

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
    const [allowMusic, setAllowMusic] = useState(false);

    // NEW: UI State Management
    const [biddingState, setBiddingState] = useState('LOADING'); // LOADING, NO_SET, IDLE, BIDDING, SOLD, SET_COMPLETE, UNSOLD_SET_CREATED, AUCTION_COMPLETE
    const [showSetSelectionModal, setShowSetSelectionModal] = useState(false);
    const [selectedSetName, setSelectedSetName] = useState('');

    const { auctionId } = useParams();
    const navigate = useNavigate();
    const { currUser } = useContext(UserContext);

    useEffect(() => {
        getAuctionData();
        createAuctionSocket();
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [])

    const audioRef = useRef(new Audio(heartBeatSound));

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true; // Enable looping
        console.log("playing stating ")
        if (allowMusic) {
            if (player.bidding && player.bidding.length > 0) {
                audio.play().then(() => { console.log("playing music") }).catch((error) => console.error("Audio play error:", error));
            } else {
                audio.pause();
                audio.currentTime = 0; // Reset audio position
            }
        } else {
            audio.pause();
            audio.currentTime = 0; // Reset audio position
        }

        return () => {
            audio.pause();
        };
    }, [allowMusic, player]);

    const getAuctionData = () => {
        setIsAPICallInProgress(true);
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
          processAuctionData(res);
        }).catch((error) => {
            console.error(error);
            if (error == "TokenExpiredError" || error.toString().includes("TokenExpiredError") || error.toString().includes("token expired")) {
                toast.error("Your session has expired. Please login again to continue.");
                navigate("/auth/login");
            } else {
                toast.error(error.toString(), { duration: 3000 });
            }
        }).finally(() => {
            setIsAPICallInProgress(false);
        });
    }

    // Unified handler to apply full auction data payload (from enhanced update API)
    const processAuctionData = (auctionData) => {
        console.info("getAuctionData", auctionData);
        if (auctionData.auction) {
            setAuction(auctionData.auction);
        }
        if (auctionData.teams) {
            setTeams(auctionData.teams);
        } if (auctionData.sets) {
            let orderedSet = auctionData.sets.sort((s1, s2) => { return s1.order - s2.order });
                setSets(orderedSet);
            }
        if (auctionData.players && auctionData.players.length > 0) {
            setPlayers(auctionData.players);
            }
        if (auctionData.sets && auctionData.players) {
                let data = [];
                let map = {};
            auctionData.players.forEach(element => {
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
        if (auctionData.teams && auctionData.players) {
                let data = [];
                let map = {};
            auctionData.teams && auctionData.teams.forEach((t) => {
                    map[t._id] = [];
                })
            auctionData.players.forEach(element => {
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
                    rb = getTeamBudget(key, auctionData.teams) - rb;
                        data.push({ team: key, players: map[key], remainingBudget: rb });
                    }
                })
                setTeamPlayerMap(data);
            }
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
                    if (res && res.auctionData) {
                        processAuctionData(res.auctionData);
                    }
                    toast.success("Set is complete, select next set to continue.", { duration: 3000 });
                }).catch((err) => {
                    toast.error(err, { duration: 3000 });
                    console.error(err);
                }).finally(() => {
                    setIsAPICallInProgress(false);
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
            if (res && res.auctionData) {
                processAuctionData(res.auctionData);
            }
            toast.success("Start bidding for player " + randomPlayer.name + " at base price " + getTeamBudgetForView(randomPlayer.basePrice), { duration: 3000 })
        }).catch((err) => {
            toast.error(err);
            console.error(err);
        }).finally(() => {
            setIsAPICallInProgress(false);
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
                if (res && res.auctionData) {
                    processAuctionData(res.auctionData);
                }
                toast.success("Current bid at " + getTeamBudgetForView(nextBid) + " of team " + team.name, { duration: 3000 });
            }).catch((err) => {
                toast.error(err.toString(), { duration: 3000 });
                console.error(err);
            }).finally(() => {
                setIsAPICallInProgress(false);
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
            if (res && res.auctionData) {
                processAuctionData(res.auctionData);
            }
                toast.success("Undo last bid from team " + getTeamName(popedBid.team), { duration: 3000 });
            }).catch((err) => {
                toast.error(err, { duration: 3000 });
                console.error(err);
            }).finally(() => {
                setIsAPICallInProgress(false);
            });
        }
    }

    const getBiddingView = () => {
        if (player && Object.keys(player).length > 0 && player.bidding.length > 0) {
            let x = structuredClone(player.bidding);
            x.reverse();
            return x.map((b, index) => {
                return (
                    <div key={"bidding-updates-" + player.name + "-" + index} className={`${index == 0 ? "bg-green-400" : "bg-slate-300"} flex flex-row justify-center w-full  rounded p-2 `}>
                        <div className='min-w-[50%] capitalize'>
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
                <div className={`flex max-w-100 flex-row justify-center items-center sm:gap-1 md:gap-1 lg:gap-2  rounded sm:p-1 md:p-2 `}>

                    <div className="bg-slate-200 sm:max-w-[200px] md:max-w-[300px] lg:max-w-[300px] rounded-full">
                        {getProfilePicture(player)}
                    </div>

                    <div className='flex flex-col sm:text-xs md:text-sm lg:text-lg text-start justify-start items-start capitalize'>
                        <div className='font-medium '>Player No. - {player.playerNumber}</div>
                        <div className='font-bold'>Name - {player.name}</div>
                        <div className='font-medium capitalize'>Role - {player.role}</div>
                        {player.bowlingHand && <div className='font-medium '>Bowl  -<span className='lowercase'> {player.bowlingHand} Arm - {player.bowlingType} </span></div>}
                        {player.battingHand && <div className='font-medium '>Bat - <span className='lowercase'> {player.battingHand} Arm - {player.battingPossition} order {player.battingType}</span> </div>}
                        <div className='font-medium'>Base Price - {getTeamBudgetForView(player.basePrice)}</div>
                        {player.commnets && <div title={player.commnets} className='text-red-600 max-w-60 font-medium text-xs truncate cursor-pointer'>Note - {player.commnets}</div>}
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
                    if (res && res.auctionData) {
                        processAuctionData(res.auctionData);
                    }
                    toast.success("Player - " + player.name + " is unsold", { duration: 3000 })
                    socket.emit("playerSoldUpdate", "Player - " + player.name + " is unsold");
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err, { duration: 3000 });
                    console.error(err);
                }).finally(() => {
                    setIsAPICallInProgress(false);
                });
            } else {
                let biddingState = structuredClone(player.bidding);
                biddingState.sort((b1, b2) => { return b1.price - b2.price });
                let team = biddingState[biddingState.length - 1].team;
                let soldPrice = biddingState[biddingState.length - 1].price;
                setIsAPICallInProgress(true);
                AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, auctionStatus: "sold", bidding: biddingState, team: team, soldPrice: soldPrice }] }).then((res) => {
                    if (res && res.auctionData) {
                        processAuctionData(res.auctionData);
                    }
                    let message = "" + player.name + " is sold to team - " + getTeamName(biddingState[biddingState.length - 1].team) + " at price " + getTeamBudgetForView(biddingState[biddingState.length - 1].price);
                    toast.success(message, { duration: 5000 });
                    socket.emit("playerSoldUpdate", message);
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err, { duration: 3000 });
                    console.error(err);
                }).finally(() => {
                    setIsAPICallInProgress(false);
                });
            }
        }
    }


    const selectNextSet = () => {
        setShowSetSelectionModal(true);
    }

    const handleSetSelection = (set) => {
        if (isAPICallInProgress) return; // Prevent double clicks
        
        // Close modal immediately and set loading state
        setShowSetSelectionModal(false);
        setSelectedSetName(set.name);
        setIsAPICallInProgress(true);
        
        AuctionService.updateAuctionSet({ set: { _id: set._id, state: "running" }, auction: auction }).then((res) => {
            if (res && res.auctionData) {
                processAuctionData(res.auctionData);
            }
            toast.success("Set '" + set.name + "' is now active. Pick a player to start bidding!", { duration: 3000 });
        }).catch((err) => {
            toast.error(err, { duration: 3000 });
            console.error(err);
        }).finally(() => {
            setIsAPICallInProgress(false);
            setSelectedSetName('');
        });
    }

    const getTeamLogo = (team) => {

        try {
            const url = new URL(team.logo.url);
            const originalHostname = url.hostname; // e.g., codeshare.public-images.s3.ap-south-1.amazonaws.com
            // Remove the bucket name from the hostname
            const correctedHostname = originalHostname.replace(`${team.logo.bucket}.`, ""); // Removes "codeshare.public-images."
            // Construct the new URL
            return `https://${correctedHostname}/${team.logo.bucket}/${team.logo.key}`;

        } catch (error) {
            console.error("Error processing logo URL:", error);
            return null;
        }
    }

    // ============================================
    // NEW: Helper Functions for UI State & Calculations
    // ============================================

    // Calculate set progress
    const calculateSetProgress = (set) => {
        if (!set || !set._id || !players || players.length === 0) {
            return { total: 0, processed: 0, remaining: 0, sold: 0, unsold: 0 };
        }
        
        const playersInSet = players.filter(p => p.auctionSet?.toString() === set._id.toString());
        const sold = playersInSet.filter(p => p.auctionStatus === "sold").length;
        const unsold = playersInSet.filter(p => p.auctionStatus === "unsold").length;
        const processed = sold + unsold;
        const remaining = playersInSet.filter(p => p.auctionStatus === "idle").length;
        
        return {
            total: playersInSet.length,
            processed,
            remaining,
            sold,
            unsold
        };
    };

    // Detect unsold set created
    const detectUnsoldSetCreated = () => {
        if (!sets || sets.length === 0) return false;
        
        const unsoldSet = sets.find(s => s.name === "unsold" && s.state === "idle");
        const mainSets = sets.filter(s => s.name !== "unsold");
        const allMainSetsCompleted = mainSets.length > 0 && mainSets.every(s => s.state === "completed");
        
        return unsoldSet && allMainSetsCompleted;
    };

    // Check if auction is fully complete
    const isAuctionComplete = () => {
        if (!sets || sets.length === 0) return false;
        
        const allSetsCompleted = sets.every(s => s.state === "completed");
        const unsoldSet = sets.find(s => s.name === "unsold");
        
        // Auction complete if: all sets done OR (all main sets done AND unsold set completed)
        return allSetsCompleted || (unsoldSet && unsoldSet.state === "completed");
    };

    // Get team initials for logo fallback
    const getTeamInitials = (teamName) => {
        if (!teamName) return "T";
        return teamName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3);
    };

    // Determine UI state based on current data
    useEffect(() => {
        // Show loading if API call in progress OR if essential data not loaded yet
        if (isAPICallInProgress || !auction || !auction._id || !teams || !players || !sets) {
            setBiddingState('LOADING');
            return;
        }
        
        // Check auction complete first
        if (isAuctionComplete()) {
            setBiddingState('AUCTION_COMPLETE');
            return;
        }
        
        // Check unsold set created
        if (detectUnsoldSetCreated()) {
            setBiddingState('UNSOLD_SET_CREATED');
            return;
        }
        
        // Check if no sets exist or all idle
        if (sets.length === 0 || sets.every(s => s.state === "idle")) {
            setBiddingState('NO_SET');
            return;
        }
        
        // Check if a set is running
        const runningSet = sets.find(s => s.state === "running");
        
        if (!runningSet) {
            // No running set, check if all completed
            if (sets.every(s => s.state === "completed" || s.name === "unsold")) {
                setBiddingState('SET_COMPLETE');
            } else {
                setBiddingState('NO_SET');
            }
            return;
        }
        
        // Set is running, check player status
        if (player && Object.keys(player).length > 0) {
            if (player.auctionStatus === "bidding") {
                setBiddingState('BIDDING');
            } else if (player.auctionStatus === "sold" || player.auctionStatus === "unsold") {
                setBiddingState('SOLD');
            } else {
                setBiddingState('IDLE');
            }
        } else {
            // No active player
            if (auctionDetails && auctionDetails.shouldNext) {
                setBiddingState('IDLE');
            } else if (auctionDetails && auctionDetails.selectSet) {
                const setProgress = calculateSetProgress(runningSet);
                if (setProgress.processed === setProgress.total && setProgress.total > 0) {
                    setBiddingState('SET_COMPLETE');
                } else {
                    setBiddingState('IDLE');
                }
            } else {
                setBiddingState('IDLE');
            }
        }
    }, [player, currentSet, sets, auctionDetails, isAPICallInProgress]);

    // ============================================
    // NEW: Layout Structure - Top Section (State-Dependent)
    // ============================================
    
    const renderTopSection = () => {
        // Fixed height container to prevent UI jumping
        const topSectionContent = (() => {
            switch (biddingState) {
                case 'LOADING':
                    return renderLoadingState();
                case 'NO_SET':
                    return renderNoSetSelected();
                case 'IDLE':
                    return renderReadyToStart();
                case 'BIDDING':
                    return renderActiveBiddingTop();
                case 'SOLD':
                    return renderPlayerSold();
                case 'SET_COMPLETE':
                    return renderSetCompleted();
                case 'UNSOLD_SET_CREATED':
                    return renderUnsoldSetCreated();
                case 'AUCTION_COMPLETE':
                    return renderAuctionCompleted();
                default:
                    return renderLoadingState();
            }
        })();

        return (
            <div className="h-96 w-full flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                    {topSectionContent}
                </div>
            </div>
        );
    };

    // ============================================
    // NEW: Layout Structure - Bottom Section (Always Visible)
    // ============================================
    
    const renderBottomSection = () => {
        const isInteractable = biddingState === 'BIDDING' && !isAPICallInProgress;
        
        return (
            <div className="space-y-6">
                {/* Team Cards - Always visible */}
                <div className={`${!isInteractable ? 'opacity-50 pointer-events-none' : ''}`}>
                    {renderTeamCards()}
                </div>
                
                {/* Control Panel - Conditional based on state */}
                {renderControlPanel()}
                
                {/* Current Set Widget - Always visible */}
                {renderCurrentSetWidget()}
            </div>
        );
    };

    // ============================================
    // NEW: Bottom Section Components
    // ============================================
    
    const renderTeamCards = () => {
        if (!teams || teams.length === 0) return null;
        
        return (
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Click Team to Bid (Auto Increment)</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                    {teams.map((team, index) => {
                        const canBid = canTeamBid(team._id);
                        const teamPlayers = teamPlayerMap.find(tm => tm.team === team._id);
                        const playerCount = teamPlayers ? teamPlayers.players.length : 0;
                        
                        return (
                            <div 
                                key={index}
                                onClick={() => canBid && handleTeamClick(team)}
                                className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 transition border-2 
                                    ${canBid ? 'cursor-pointer hover:bg-opacity-20 border-transparent hover:border-blue-400' : 'cursor-not-allowed opacity-50 border-transparent'}`}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2"
                                    style={{backgroundColor: team.color || '#6b7280'}}>
                                    {team.logo && team.logo.url ? (
                                        <img src={getTeamLogo(team)} alt={team.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        getTeamInitials(team.name)
                                    )}
                </div>
                                <h3 className="text-center font-bold text-xs mb-1 truncate">{team.name}</h3>
                                <p className="text-center text-xs text-blue-200">{getTeamBudgetForView(team.remainingBudget)}</p>
                                <p className="text-center text-xs text-green-300">{playerCount}/{auction.maxTeamMember || 11}</p>
                            </div>
                        );
                    })}
                    
                    {/* Unsold Option */}
                    <div 
                        onClick={() => handlePlayerSold()}
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 cursor-pointer hover:bg-opacity-20 transition border-2 border-transparent hover:border-gray-400"
                    >
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                            ❌
                    </div>
                        <h3 className="text-center font-bold text-xs mb-1">Unsold</h3>
                        <p className="text-center text-xs text-blue-200">No bid</p>
                </div>
                </div>
            </div>
        );
    };

    const renderControlPanel = () => {
        // Only show control panel during bidding state
        if (biddingState !== 'BIDDING') return null;
        
        return (
            <div className="grid md:grid-cols-2 gap-4">
                    <button
                    onClick={() => handlePlayerSold()}
                    className="px-8 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl font-bold text-2xl shadow-2xl transition transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    <span>✅</span>
                    <span>SOLD</span>
                </button>
                <button 
                    onClick={() => handleBidUndo(player)}
                    disabled={!player.bidding || player.bidding.length === 0}
                    className={`px-8 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-2xl font-bold text-2xl shadow-2xl transition transform hover:scale-105 flex items-center justify-center gap-3 text-black ${(!player.bidding || player.bidding.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>↩️</span>
                    <span>UNDO</span>
                    </button>
                </div>
        );
    };

    const renderCurrentSetWidget = () => {
        return (
            <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-sm text-blue-200">Current Set</p>
                        <p className="text-xl font-bold">{currentSet?.name || 'Set'}</p>
            </div>
                </div>
                <div className="mt-3">
                    {currentSet && currentSet._id && (
                        <>
                            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                                <div 
                                    className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                                    style={{width: `${(calculateSetProgress(currentSet).processed / calculateSetProgress(currentSet).total) * 100}%`}}
                                ></div>
                            </div>
                            <p className="text-sm text-blue-200 mt-2">
                                {calculateSetProgress(currentSet).processed}/{calculateSetProgress(currentSet).total} players processed
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // ============================================
    // NEW: Main Content Renderer (Updated Structure)
    // ============================================
    
    const renderMainContent = () => {
        return (
            <div className="space-y-6">
                {/* TOP SECTION - Changes based on state */}
                {renderTopSection()}
                
                {/* BOTTOM SECTION - Always visible */}
                {renderBottomSection()}
            </div>
        );
    };

    // Loading State with Skeleton
    const renderLoadingState = () => {
        // If selecting a set, show custom loading message
        if (selectedSetName) {
    return (
                <div className="w-full">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-12 text-center">
                        <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 animate-spin">
                            ⚙️
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Setting up auction...</h2>
                        <p className="text-xl text-blue-100 mb-2">
                            Activating set: <span className="font-bold text-yellow-300">"{selectedSetName}"</span>
                        </p>
                        <p className="text-lg text-blue-200">Please wait while we prepare the bidding environment</p>
                        
                        {/* Loading dots animation */}
                        <div className="flex justify-center gap-2 mt-8">
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default skeleton loading
    return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl shadow-2xl p-8 animate-pulse w-full  min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Skeleton Icon */}
                        <div className="w-40 h-40 bg-white bg-opacity-10 rounded-full flex-shrink-0"></div>
                        
                        {/* Skeleton Info */}
                        <div className="flex-1 w-full">
                            <div className="h-12 bg-white bg-opacity-10 rounded-lg mb-4 w-3/4"></div>
                            <div className="h-6 bg-white bg-opacity-10 rounded-lg mb-6 w-1/2"></div>
                            
                            <div className="grid grid-cols-3 gap-4 max-w-md">
                                <div className="bg-white bg-opacity-10 rounded-xl p-4 h-24"></div>
                                <div className="bg-white bg-opacity-10 rounded-xl p-4 h-24"></div>
                                <div className="bg-white bg-opacity-10 rounded-xl p-4 h-24"></div>
                            </div>
                        </div>

                        {/* Skeleton Action */}
                        <div className="flex-shrink-0 w-full md:w-64">
                            <div className="h-16 bg-white bg-opacity-10 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 1: No Set Selected
    const renderNoSetSelected = () => {
        const totalSets = sets ? sets.filter(s => s.name !== "unsold").length : 0;
        const totalPlayers = players ? players.length : 0;
        const totalTeams = teams ? teams.length : 0;

        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl shadow-2xl p-8 w-full min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Icon Section */}
                        <div className="w-40 h-40 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl flex-shrink-0">
                            📋
                        </div>
                        
                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-bold mb-2">No Set Selected</h1>
                            <p className="text-xl text-gray-300 mb-4">Please select a set to start the bidding process</p>
                            
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-gray-300 mb-1">Total Sets</p>
                                    <p className="text-2xl font-bold">{totalSets}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-gray-300 mb-1">Total Players</p>
                                    <p className="text-2xl font-bold">{totalPlayers}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-gray-300 mb-1">Total Teams</p>
                                    <p className="text-2xl font-bold">{totalTeams}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex-shrink-0 w-full md:w-64">
                            <button 
                                onClick={() => selectNextSet()}
                                className="w-full px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl font-bold text-xl shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
                            >
                                <span>📂</span>
                                <span>Select Set to Begin</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 2: Ready to Start (Idle)
    const renderReadyToStart = () => {
        const progress = currentSet && currentSet._id ? calculateSetProgress(currentSet) : { total: 0, processed: 0, remaining: 0 };
        
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-indigo-700 to-blue-800 rounded-3xl shadow-2xl p-8 w-full  min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Icon Section */}
                        <div className="w-40 h-40 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl flex-shrink-0 animate-pulse">
                            🎯
                        </div>
                        
                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-bold mb-2">Ready to Start Bidding</h1>
                            <p className="text-xl text-blue-100 mb-1">Current Set: <span className="font-bold">{currentSet?.name || 'Set'}</span></p>
                            <p className="text-lg text-blue-200 mb-4">{progress.remaining} players remaining in this set</p>
                            
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-blue-100 mb-1">Total in Set</p>
                                    <p className="text-2xl font-bold">{progress.total}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-blue-100 mb-1">Remaining</p>
                                    <p className="text-2xl font-bold text-yellow-300">{progress.remaining}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-blue-100 mb-1">Processed</p>
                                    <p className="text-2xl font-bold text-green-300">{progress.processed}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex-shrink-0 w-full md:w-64 space-y-3">
                            <button 
                                onClick={() => pickUpRandomPlayer()}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <span>🎲</span>
                                <span>Pick Random Player</span>
                            </button>
                            <button 
                                onClick={() => selectNextSet()}
                                className="w-full px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2"
                            >
                                <span>📂</span>
                                <span>Change Set</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 4: Player Sold Confirmation
    const renderPlayerSold = () => {
        if (!player || !player._id) return renderLoadingState();

        const soldTeam = player.team ? teams.find(t => t._id === player.team) : null;
        const progress = currentSet && currentSet._id ? calculateSetProgress(currentSet) : { total: 0, processed: 0 };
        const finalPrice = player.soldPrice || (player.bidding && player.bidding.length > 0 ? player.bidding[player.bidding.length - 1].price : player.basePrice);

        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 w-full min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Icon Section */}
                        <div className="flex-shrink-0 text-center md:text-left">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-5xl mx-auto md:mx-0 mb-3">
                                ✅
                            </div>
                            <h2 className="text-4xl font-bold">SOLD!</h2>
                        </div>

                        {/* Player Summary */}
                        <div className="flex-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-green-600 flex-shrink-0">
                                    #{player.jerseyNumber || '?'}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-2xl font-bold">{player.name}</h3>
                                    <p className="text-sm text-green-100">{player.role || 'Player'}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                    <p className="text-xs text-green-100 mb-1">Sold To</p>
                                    <div className="flex items-center gap-2">
                                        {soldTeam && (
                                            <>
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                    style={{backgroundColor: soldTeam.color || '#f59e0b', color: 'white'}}>
                                                    {getTeamInitials(soldTeam.name)}
                                                </div>
                                                <p className="text-lg font-bold">{soldTeam.name}</p>
                                            </>
                                        )}
                                        {!soldTeam && <p className="text-lg font-bold text-red-300">Unsold</p>}
                                    </div>
                                </div>
                                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                    <p className="text-xs text-green-100 mb-1">Final Price</p>
                                    <p className="text-xl font-bold text-yellow-300">{getTeamBudgetForView(finalPrice)}</p>
                                </div>
                            </div>
                </div>

                        {/* Action & Progress */}
                        <div className="flex-shrink-0 w-full md:w-64">
                            <button 
                                onClick={() => pickUpRandomPlayer()}
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2 mb-4"
                            >
                                <span>▶️</span>
                                <span>Pick Next Player</span>
                            </button>

                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3">
                                <p className="text-xs text-green-100 mb-2">{currentSet?.name || 'Set'}</p>
                                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
                                    <div className="bg-yellow-400 h-2 rounded-full" 
                                        style={{width: `${(progress.processed / progress.total) * 100}%`}}></div>
                                </div>
                                <p className="text-xs text-green-200">{progress.processed}/{progress.total} processed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 5: Set Completed
    const renderSetCompleted = () => {
        const completedSet = sets && sets.find(s => s.state === "completed" && s.name !== "unsold");
        const progress = completedSet ? calculateSetProgress(completedSet) : { total: 0, sold: 0, unsold: 0 };

        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl shadow-2xl p-8 w-full  min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Icon Section */}
                        <div className="w-40 h-40 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl flex-shrink-0">
                            🎉
                        </div>
                        
                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-bold mb-2">Set Completed!</h1>
                            <p className="text-xl text-green-100 mb-1">Set: <span className="font-bold">{completedSet?.name || 'Set'}</span></p>
                            <p className="text-lg text-green-200 mb-4">All players in this set have been processed</p>
                            
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-green-100 mb-1">Total Players</p>
                                    <p className="text-2xl font-bold">{progress.total}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-green-100 mb-1">Sold</p>
                                    <p className="text-2xl font-bold text-yellow-300">{progress.sold}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-green-100 mb-1">Unsold</p>
                                    <p className="text-2xl font-bold text-red-300">{progress.unsold}</p>
                        </div>
                    </div>
                                                    </div>

                        {/* Action Section */}
                        <div className="flex-shrink-0 w-full md:w-64 space-y-3">
                            <button 
                                onClick={() => selectNextSet()}
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <span>➡️</span>
                                <span>Next Set</span>
                            </button>
                            <button 
                                onClick={() => selectNextSet()}
                                className="w-full px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2"
                            >
                                <span>📂</span>
                                <span>Change Set</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 6: Unsold Set Created
    const renderUnsoldSetCreated = () => {
        const unsoldSet = sets && sets.find(s => s.name === "unsold");
        const unsoldPlayers = unsoldSet ? players.filter(p => p.auctionSet === unsoldSet._id && p.auctionStatus === "idle") : [];
        const mainSetsCompleted = sets ? sets.filter(s => s.state === "completed" && s.name !== "unsold").length : 0;
        const totalSold = players ? players.filter(p => p.auctionStatus === "sold").length : 0;

        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-orange-600 to-amber-700 rounded-3xl shadow-2xl p-8 w-full  min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Icon Section */}
                        <div className="w-40 h-40 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl flex-shrink-0 animate-pulse">
                            🔄
                        </div>
                        
                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-bold mb-2">Unsold Set Created!</h1>
                            <p className="text-xl text-orange-100 mb-1">All main sets completed</p>
                            <p className="text-lg text-orange-200 mb-4">Unsold players have been moved to a new set for re-bidding</p>
                            
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-orange-100 mb-1">Unsold Players</p>
                                    <p className="text-2xl font-bold text-yellow-300">{unsoldPlayers.length}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-orange-100 mb-1">Sets Completed</p>
                                    <p className="text-2xl font-bold">{mainSetsCompleted}/{mainSetsCompleted}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-orange-100 mb-1">Already Sold</p>
                                    <p className="text-2xl font-bold text-green-300">{totalSold}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex-shrink-0 w-full md:w-64 space-y-3">
                            <button 
                                onClick={() => {
                                    if (unsoldSet) {
                                        handleSetSelection(unsoldSet);
                                    }
                                }}
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <span>🎲</span>
                                <span>Start Unsold Set</span>
                            </button>
                            <button 
                                className="w-full px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2"
                                onClick={() => setBiddingState('AUCTION_COMPLETE')}
                            >
                                <span>✅</span>
                                <span>Finish Auction</span>
                            </button>
                                    </div>
                                        </div>
                                        </div>
                                        </div>
        );
    };

    // STATE 7: Auction Completed
    const renderAuctionCompleted = () => {
        const totalPlayers = players ? players.length : 0;
        const totalSold = players ? players.filter(p => p.auctionStatus === "sold").length : 0;
        const totalUnsold = players ? players.filter(p => p.auctionStatus === "unsold").length : 0;

        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 w-full min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Icon Section */}
                        <div className="w-40 h-40 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl flex-shrink-0">
                            🏆
                                    </div>
                        
                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-5xl font-bold mb-2">Auction Completed!</h1>
                            <p className="text-xl text-purple-100 mb-1">All sets have been processed successfully</p>
                            <p className="text-lg text-purple-200 mb-4">Congratulations on completing the auction!</p>
                            
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-purple-100 mb-1">Total Players</p>
                                    <p className="text-2xl font-bold">{totalPlayers}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-purple-100 mb-1">Sold</p>
                                    <p className="text-2xl font-bold text-green-300">{totalSold}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-purple-100 mb-1">Unsold</p>
                                    <p className="text-2xl font-bold text-red-300">{totalUnsold}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex-shrink-0 w-full md:w-64 space-y-3">
                            <button 
                                onClick={() => navigate(`/p/${currUser._id}/t/auction/${auctionId}`)}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <span>📊</span>
                                <span>View Results</span>
                            </button>
                            <button 
                                onClick={() => navigate(`/p/${currUser._id}/t/auction/${auctionId}`)}
                                className="w-full px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2"
                            >
                                <span>🏠</span>
                                <span>Go to Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 3: Active Bidding - Top Section Only
    const renderActiveBiddingTop = () => {
        if (!player || !player._id) return renderLoadingState();

        const currentBid = player.bidding && player.bidding.length > 0 
            ? player.bidding[player.bidding.length - 1] 
            : null;
        const currentBidTeam = currentBid ? teams.find(t => t._id === currentBid.team) : null;

        return (
            <div className="w-full h-full flex items-center justify-center">
                {/* Current Player Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 w-full min-h-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Player Image/Number */}
                        <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-6xl font-bold text-blue-600 shadow-xl flex-shrink-0">
                            #{player.jerseyNumber || '?'}
                        </div>
                        
                        {/* Player Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-5xl font-bold">{player.name}</h1>
                                <span className="px-4 py-2 bg-white bg-opacity-20 rounded-xl text-lg font-semibold">
                                    {player.role || 'Player'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0 mt-4">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-blue-100 mb-1">Base Price</p>
                                    <p className="text-3xl font-bold">{getTeamBudgetForView(player.basePrice)}</p>
                                </div>
                                <div className="bg-yellow-500 rounded-xl p-4 text-black">
                                    <p className="text-sm text-yellow-900 mb-1">Current Bid</p>
                                    <p className="text-3xl font-bold">
                                        {currentBid ? getTeamBudgetForView(currentBid.price) : getTeamBudgetForView(player.basePrice)}
                                    </p>
                                    {currentBidTeam && (
                                        <p className="text-sm text-yellow-900 font-semibold mt-1 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" 
                                                style={{backgroundColor: currentBidTeam.color || '#f59e0b'}}>
                                                {getTeamInitials(currentBidTeam.name)}
                                            </span>
                                            {currentBidTeam.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bidding History Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 max-h-80 overflow-y-auto">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span>📊</span>
                                    <span>Bidding History</span>
                                </h3>
                                <div className="space-y-2">
                                    {player.bidding && player.bidding.length > 0 ? (
                                        player.bidding.slice().reverse().map((bid, index) => {
                                            const bidTeam = teams.find(t => t._id === bid.team);
                                            const isLatest = index === 0;
                                            return (
                                                <div 
                                                    key={index}
                                                    className={`rounded-lg p-2 ${isLatest ? 'bg-yellow-500 bg-opacity-20 border-2 border-yellow-500' : 'bg-white bg-opacity-5'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                                style={{backgroundColor: bidTeam?.color || '#6b7280', color: 'white'}}>
                                                                {getTeamInitials(bidTeam?.name || 'T')}
                                                            </div>
                                                            <span className={`text-sm ${isLatest ? 'font-semibold' : ''}`}>
                                                                {bidTeam?.name || 'Team'}
                                                            </span>
                                                        </div>
                                                        <span className={`${isLatest ? 'font-bold text-yellow-300' : 'text-blue-200'}`}>
                                                            {getTeamBudgetForView(bid.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-blue-200 text-sm py-4">
                                            No bids yet. Start bidding!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // STATE 3: Active Bidding (Original - Now Bottom Section)
    const renderActiveBidding = () => {
        if (!player || !player._id) return renderLoadingState();

        const currentBid = player.bidding && player.bidding.length > 0 
            ? player.bidding[player.bidding.length - 1] 
            : null;
        const currentBidTeam = currentBid ? teams.find(t => t._id === currentBid.team) : null;

        return (
            <div className="w-full space-y-6">
                {/* Current Player Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Player Image/Number */}
                        <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-6xl font-bold text-blue-600 shadow-xl flex-shrink-0">
                            #{player.jerseyNumber || '?'}
                        </div>
                        
                        {/* Player Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-5xl font-bold">{player.name}</h1>
                                <span className="px-4 py-2 bg-white bg-opacity-20 rounded-xl text-lg font-semibold">
                                    {player.role || 'Player'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0 mt-4">
                                <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                    <p className="text-sm text-blue-100 mb-1">Base Price</p>
                                    <p className="text-3xl font-bold">{getTeamBudgetForView(player.basePrice)}</p>
                                </div>
                                <div className="bg-yellow-500 rounded-xl p-4 text-black">
                                    <p className="text-sm text-yellow-900 mb-1">Current Bid</p>
                                    <p className="text-3xl font-bold">
                                        {currentBid ? getTeamBudgetForView(currentBid.price) : getTeamBudgetForView(player.basePrice)}
                                    </p>
                                    {currentBidTeam && (
                                        <p className="text-sm text-yellow-900 font-semibold mt-1 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" 
                                                style={{backgroundColor: currentBidTeam.color || '#f59e0b'}}>
                                                {getTeamInitials(currentBidTeam.name)}
                                            </span>
                                            {currentBidTeam.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bidding History Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 max-h-80 overflow-y-auto">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <span>📊</span>
                                    <span>Bidding History</span>
                                </h3>
                                <div className="space-y-2">
                                    {player.bidding && player.bidding.length > 0 ? (
                                        player.bidding.slice().reverse().map((bid, index) => {
                                            const bidTeam = teams.find(t => t._id === bid.team);
                                            const isLatest = index === 0;
                                            return (
                                                <div 
                                                    key={index}
                                                    className={`rounded-lg p-2 ${isLatest ? 'bg-yellow-500 bg-opacity-20 border-2 border-yellow-500' : 'bg-white bg-opacity-5'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                                style={{backgroundColor: bidTeam?.color || '#6b7280', color: 'white'}}>
                                                                {getTeamInitials(bidTeam?.name || 'T')}
                                                            </div>
                                                            <span className={`text-sm ${isLatest ? 'font-semibold' : ''}`}>
                                                                {bidTeam?.name || 'Team'}
                                                            </span>
                                                        </div>
                                                        <span className={`${isLatest ? 'font-bold text-yellow-300' : 'text-blue-200'}`}>
                                                            {getTeamBudgetForView(bid.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-blue-200 text-sm py-4">
                                            No bids yet. Start bidding!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Selection Grid */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">Click Team to Bid (Auto Increment)</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                        {teams && teams.map((team, index) => {
                            const canBid = canTeamBid(team._id);
                            const teamPlayers = teamPlayerMap.find(tm => tm.team === team._id);
                            const playerCount = teamPlayers ? teamPlayers.players.length : 0;
                            
                            return (
                                <div 
                                    key={index}
                                    onClick={() => canBid && handleTeamClick(team)}
                                    className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 transition border-2 
                                        ${canBid ? 'cursor-pointer hover:bg-opacity-20 border-transparent hover:border-blue-400' : 'cursor-not-allowed opacity-50 border-transparent'}`}
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2"
                                        style={{backgroundColor: team.color || '#6b7280'}}>
                                        {team.logo && team.logo.url ? (
                                            <img src={getTeamLogo(team)} alt={team.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            getTeamInitials(team.name)
                                        )}
                                    </div>
                                    <h3 className="text-center font-bold text-xs mb-1 truncate">{team.name}</h3>
                                    <p className="text-center text-xs text-blue-200">{getTeamBudgetForView(team.remainingBudget)}</p>
                                    <p className="text-center text-xs text-green-300">{playerCount}/{auction.maxTeamMember || 11}</p>
                                </div>
                            );
                        })}
                        
                        {/* Unsold Option */}
                        <div 
                            onClick={() => handlePlayerSold()}
                            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 cursor-pointer hover:bg-opacity-20 transition border-2 border-transparent hover:border-gray-400"
                        >
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                ❌
                        </div>
                            <h3 className="text-center font-bold text-xs mb-1">Unsold</h3>
                            <p className="text-center text-xs text-blue-200">No bid</p>
                    </div>
                </div>
            </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => handlePlayerSold()}
                        className="px-8 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl font-bold text-2xl shadow-2xl transition transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <span>✅</span>
                        <span>SOLD</span>
                    </button>
                    <button 
                        onClick={() => handleBidUndo(player)}
                        disabled={!player.bidding || player.bidding.length === 0}
                        className={`px-8 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-2xl font-bold text-2xl shadow-2xl transition transform hover:scale-105 flex items-center justify-center gap-3 text-black ${(!player.bidding || player.bidding.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span>↩️</span>
                        <span>UNDO</span>
                    </button>
                </div>

                {/* Set Progress (Bottom) */}
                <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-sm text-blue-200">Current Set</p>
                            <p className="text-xl font-bold">{currentSet?.name || 'Set'}</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        {currentSet && currentSet._id && (
                            <>
                                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                                    <div 
                                        className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                                        style={{width: `${(calculateSetProgress(currentSet).processed / calculateSetProgress(currentSet).total) * 100}%`}}
                                    ></div>
                                </div>
                                <p className="text-sm text-blue-200 mt-2">
                                    {calculateSetProgress(currentSet).processed}/{calculateSetProgress(currentSet).total} players processed
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white'>
            {/* Top Bar */}
            <div className="bg-black bg-opacity-40 backdrop-blur-sm px-4 sm:px-6 lg:px-12 xl:px-12 py-3 shadow-lg flex-shrink-0">
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <h2 className="font-bold text-xl">{auction?.name || 'Auction'}</h2>
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => { setAllowMusic(!allowMusic); }}
                            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <span>{allowMusic ? '🔊' : '🔇'}</span>
                            <span className="hidden md:inline">Sound: {allowMusic ? 'ON' : 'OFF'}</span>
                        </button>
                        <button 
                            onClick={() => handleBidUndo(player)}
                            disabled={!player || !player.bidding || player.bidding.length === 0}
                            className={`px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold transition flex items-center gap-2 ${(!player || !player.bidding || player.bidding.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span>⏪</span>
                            <span className="hidden md:inline">Undo</span>
                        </button>
                        <button 
                            onClick={() => { navigate(`/p/${currUser._id}/t/auction/${auctionId}`) }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center gap-2"
                        >
                            <span>🚪</span>
                            <span className="hidden md:inline">Exit</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className='flex-1 flex flex-col px-4 sm:px-6 lg:px-12 xl:px-12 py-6 overflow-auto relative'>
                {renderMainContent()}
                {isAPICallInProgress && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
                        <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center shadow-2xl">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-lg font-semibold">Processing...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Set Selection Modal */}
            <AuctionModal
                isOpen={showSetSelectionModal}
                onClose={() => setShowSetSelectionModal(false)}
                title="Select Set"
                icon="📂"
                size="lg"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 text-center mb-6">
                        Choose a set to start or continue bidding
                    </p>

                    {/* Available Sets Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1">
                        {sets && sets.filter(s => s.state === "idle").map((set, index) => {
                            const setProgress = calculateSetProgress(set);
                            const progressPercent = setProgress.total > 0 
                                ? ((setProgress.processed / setProgress.total) * 100).toFixed(0) 
                                : 0;
                            const isDisabled = isAPICallInProgress;

                            return (
                                <div
                                    key={index}
                                    onClick={() => !isDisabled && handleSetSelection(set)}
                                    className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 transition-all shadow-md 
                                        ${isDisabled 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:from-blue-100 hover:to-indigo-100 hover:border-blue-500 cursor-pointer hover:shadow-xl'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{set.name}</h3>
                                            <p className="text-sm text-gray-600">Order: {set.order || index + 1}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <div className="bg-white rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="text-lg font-bold text-gray-800">{setProgress.total}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500">Remaining</p>
                                            <p className="text-lg font-bold text-blue-600">{setProgress.remaining}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500">Processed</p>
                                            <p className="text-lg font-bold text-green-600">{setProgress.processed}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {setProgress.total > 0 && (
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300" 
                                                style={{width: `${progressPercent}%`}}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold text-blue-600">Click to Start →</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {sets && sets.filter(s => s.state === "idle").length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Sets Available</h3>
                            <p className="text-gray-600">All sets have been started or completed.</p>
                        </div>
                    )}

                    {/* Cancel Button */}
                    <div className="flex justify-center pt-4 border-t">
                        <button
                            onClick={() => setShowSetSelectionModal(false)}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </AuctionModal>
        </div>
    )
}
