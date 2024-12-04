import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import "./auction.css";
//auctionStatus : idle, bidding, sold, unsold
const tabName = ["Marquee", "AR1", "AR2", "AR3", "BA1", "BA2", "BA3", "WK1", "WK2",]
const requiredSetColumnForDisplay = ["name"];
export default function AuctionBidding(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [sets, setSets] = useState([]);
    const [setPlayerMap, setSetPlayerMap] = useState([]);
    const [view, setView] = useState({ set: false });
    const [player, setPlayer] = useState({});
    const [currentSet, setCurrentSet] = useState({});
    const [auctionDetails, setAuctionDetails] = useState({});

    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
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
                console.log(data);
                setSetPlayerMap(data);
            }
        }).catch((error) => {
            console.log(error);
            toast.error(error);
        });

    }
    useEffect(() => {
        console.log(setPlayerMap, sets)

        if (sets && sets.length > 0 && setPlayerMap && setPlayerMap.length > 0) {
            updateAuctionDetails();
        }
    }, [sets, setPlayerMap]);

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
                AuctionService.updateAuctionSet({ set: { _id: runningSet._id, state: "completed" } }).then((res) => {
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
        if (lastPrice < 20000000) {
            return lastPrice + 1000000;
        } else if ((lastPrice >= 20000000) && (lastPrice < 50000000)) {
            return lastPrice + 2000000;
        } else {
            return lastPrice + 2500000;
        }
    }

    const handleTeamClick = (team) => {
        console.log(team);
        // baseprice , bidding = [ { team, price}]
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
                console.log(err);
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
                            {getTeamName(b.team)} -  {getTeamBudgetForView(b.price)} L
                        </div>
                        {index == 0 && <div onClick={() => { handleBidUndo(player) }} className={`bg-red-400 px-2 rounded ml-auto button cursor-pointer `}>
                            Undo
                        </div>}
                    </div>
                )
            })
        }
    }

    const handlePlayerSold = () => {
        if (player) {
            if (player.bidding.length == 0) {
                player.auctionStatus = "unsold"; // ned to change
                AuctionService.updateAuctionPlayer({ players: [{ _id: player._id, auctionStatus: "unsold" }] }).then((res) => {
                    toast.success("Player - " + player.name + " is unsold")
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
                    toast.success("Player - " + player.name + " is sold to team - " + biddingState[biddingState.length - 1].price);
                    setPlayer({});
                }).catch((err) => {
                    toast.error(err);
                    console.log(err);
                }).finally(() => {
                    getAuctionData();
                });
            }

            // setSetPlayerMap((old) => {
            //     old = structuredClone(old);
            //     var currentMap = old.find((o) => { return o.set == currentSet._id });

            // })
        }
    }

    const handleSelectNextSet = (set, t) => {
        AuctionService.updateAuctionSet({ set: { _id: set._id, state: "running" } }).then((res) => {
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
                    Select Next Set
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label htmlFor="newTitle" className="text-gray-700">
                        Select Player set to assign
                    </label>
                    {selectableSet && selectableSet.length > 0 && selectableSet.map((set, index) => {
                        return (<div>
                            <button className='button bg-slate-300 rounded p-2' onClick={() => { handleSelectNextSet(set, t) }}> {set.name}</button>
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
        return number / 100000;
    }

    return (
        <>
            <div className='flex flex-col w-full h-full p-1 text-sx gap-2'>
                <div className='header flex flex-row justify-end gap-2 bg-gray-50'>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { navigate("/t/auction/" + auctionId) }}>Auction Home</div>
                </div>

                <div className='flex flex-col gap-2 h-full max-h-full overflow-auto bg-gray-100'>
                    <div className={`${"SetPannel-1"} flex  flex-row gap-2 w-full overflow-auto `}>
                        <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full  overflow-auto">
                            <div className="px-4 mx-auto max-w-screen-2xl lg:px-12 p-1">
                                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                        <div className="flex items-center flex-1 space-x-4">
                                            <h5>
                                                <span className="text-gray-500">All Sets:</span>
                                                <span className="dark:text-white">{sets.length}</span>
                                            </h5>
                                        </div>
                                        <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                                            {/* <button onClick={() => { }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                Add Set
                                            </button> */}
                                            <button onClick={() => {
                                                setView((old) => {
                                                    old = structuredClone(old);
                                                    old.set = !old.set
                                                    return old;
                                                })
                                            }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                hide/show
                                            </button>
                                        </div>
                                    </div>
                                    {view.set && <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    {sets && sets.length > 0 && Object.keys(sets[0]).map((key) => {
                                                        // Only render columns that are in requiredColumns
                                                        if (requiredSetColumnForDisplay.includes(key)) {
                                                            return <th scope="col" className="px-4 py-3" key={key}>{key}</th>;
                                                        }
                                                        return null;  // Skip the unwanted columns
                                                    })}
                                                    <th scope="col" className="p-4">
                                                        <div className="flex items-center">
                                                            <label htmlFor="checkbox-all" className="sr-only bg-red-700">Remove</label>
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className='h-full overflow-auto'>
                                                {sets && sets.length > 0 && sets.map((set, rowIndex) => {
                                                    return (
                                                        <tr key={"sets-" + rowIndex} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            {Object.keys(set).map((key, colIndex) => {
                                                                if (requiredSetColumnForDisplay.includes(key)) {
                                                                    return (
                                                                        <td key={"sets-" + rowIndex + "-" + colIndex} className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{set[key]}</td>
                                                                    )
                                                                }
                                                                return null;
                                                            })}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>}
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className={`${"PlayerPannel-1"}   flex flex-col gap-2 w-full overflow-auto `}>
                        <div className='bg-gray-300 py-3 flex  flex-row justify-between px-3 '>
                            <div>{(auctionDetails && auctionDetails.currentSet && Object.keys(auctionDetails.currentSet).length > 0 && auctionDetails.currentSet.name) ? (`Current set -  ${auctionDetails.currentSet.name} ${auctionDetails.remainingPlayerInCurrentSet && (" Remaining player - " + auctionDetails.remainingPlayerInCurrentSet)}`) : ("Please select next set to continue")} </div>
                            {auctionDetails && auctionDetails.selectSet && <div onClick={() => { selectNextSet() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                Select Next set
                            </div>}
                            {auctionDetails && auctionDetails.shouldNext && <div onClick={() => { pickUpRandomPlayer() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                Pick Up Random Player
                            </div>}

                            {player && Object.keys(player).length > 0 && <div onClick={() => { handlePlayerSold() }} className='button cursor-pointer rounded bg-gray-400 px-2 p-1'>
                                {player.bidding.length == 0 ? "Un Sold" : "Make Sold"}
                            </div>}
                        </div>
                        <div className='flex-1 flex flex-row w-full items-center overflow-auto'>
                            <div className='PlayerProfile flex flex-col w-[50%]'>
                                <div>{player.name}</div>
                                <div>{player.basePrice}</div>
                                <div>photo</div>
                            </div>
                            <div className='PlayerProfile flex flex-col w-[50%] max-h-full overflow-auto'>
                                {(player.bidding && player.bidding.length > 0) ? <div className='flex max-w-[400px] flex-col gap-[1px] overflow-auto'>
                                    {getBiddingView()}
                                </div> : <div className=''>
                                    Start bidding
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className={`${"TeamPannel-1"}TeamPannel-1  flex flex-col gap-2 w-full overflow-auto py-3`}>
                        <div className='flex flex-row justify-center bg-gray-200 gap-2 p-2'>
                            {teams && teams.length && teams.map((team, index) => {
                                return (<div onClick={() => { handleTeamClick(team) }} className='bg-blue-200 rounded p-3 cursor-pointer'>
                                    <div>
                                        {team.name}
                                    </div>
                                    <div>
                                        Remaining - {getTeamBudgetForView(team.remainingBudget)} L
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
