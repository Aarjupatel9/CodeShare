import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { defaultTeamLogo, downArrowIcon } from '../assets/svgs';
import { generatePDF } from './generatePdf';
import { getTeamBudgetForView, getTeamName } from './Utility';

const requiredPlayerColumnForDisplay = ["playerNumber", "name", "team", "auctionStatus", "basePrice", "soldPrice", "auctionSet", "role", "bowlingHand", "bowlingType", "battingHand", "battingPossition", "battingType", "commnets"];
const filterFields = ["auctionSet", "team", "auctionStatus"];
const requiredSetColumnForDisplay = ["name", "state"];
const requiredTeamColumnForDisplay = ["name", "budget", "remainingBudget"];

export default function AuctionDetailsManage(props) {
    const [auction, setAuction] = useState({});
    const [auctionEditable, setAuctionEditable] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [sets, setSets] = useState([]);
    const [view, setView] = useState({ player: false, team: false, set: false, auctionDetails: false, exportTeamList: false });
    const [playersCopy, setPlayersCopy] = useState([]);
    const [setPlayerMap, setSetPlayerMap] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [auctionData, setAuctionData] = useState({});

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

    const getAuctionData = () => {
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
            console.debug("getAuctionDetails", res);
            setAuctionData(res);
        }).catch((error) => {
            console.error(error);
            if (error == "TokenExpiredError") {
                navigate("/auth/login")
            }
            toast.error(error);
        });
    }

    const handleImageUpload = async (event, team) => {
        event.preventDefault();
        if (!team) {
            return;
        }

        const file = event.target.files[0];
        if (file.size > 4e6) {
            toast.error("Please upload a file smaller than 2 MB");
            return false;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileSize", file.size * 8);
        formData.append("team", team._id);
        const toastId = toast.loading("Uploading team logo...");
        AuctionService.saveTeamLogo(formData).then((res) => {
            toast.success(res.message, {
                id: toastId,
            });
            getAuctionData();
        }).catch((error) => {
            console.error(error);
            toast.error(error, {
                id: toastId,
            });
        });
    };

    useEffect(() => {
        // console.debug("playerListFilters", playerListFilters);
    }, [playerListFilters])

    useEffect(() => {
        var auctionStatus = selectedPlayerListFilters.auctionStatus
        var team = selectedPlayerListFilters.team
        var auctionSet = selectedPlayerListFilters.auctionSet

        if (auctionData.players && auctionData.players.length > 0) {

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

    useEffect(() => {
        if (auctionData.auction) {
            setAuction(auctionData.auction);
            setAuctionEditable(auctionData.auction);
        }
        if (auctionData.teams) {
            setTeams(auctionData.teams);
        } if (auctionData.sets) {
            setSets(auctionData.sets);
        }
        if (auctionData.players && auctionData.players.length > 0) {
            var statusUniqueValues = new Set();

            const updatedPlayers = auctionData.players.map(element => {
                statusUniqueValues.add(element.auctionStatus);
                element.isSelected = false;
                return element;
            });
            const auctionStatus = [];
            statusUniqueValues.forEach((t) => {
                auctionStatus.push({ value: t, displayValue: t });
            });
            const team = auctionData.teams.map((t) => { return { value: t._id, displayValue: t.name } });
            const auctionSet = auctionData.sets.map((t) => { return { value: t._id, displayValue: t.name } });

            setPlayerListFilters({
                auctionStatus: auctionStatus ? auctionStatus : [],
                auctionSet: auctionSet ? auctionSet : [],
                team: team ? team : []
            })

            updatedPlayers.sort((p1, p2) => p1.playerNumber - p2.playerNumber);
            setPlayers(updatedPlayers);
            setPlayersCopy(updatedPlayers);
        }
        if (auctionData.sets && auctionData.players) {
            var data = [];
            var map = {};
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
            var data = [];
            var map = {};
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
                    map[key] = map[key].sort((a, b) => a.soldNumber - b.soldNumber);
                    var rb = map[key].reduce((total, p) => {
                        return total + parseInt(p.soldPrice);
                    }, 0);

                    rb = getTeamBudget(key, auctionData.teams) - rb;
                    data.push({ team: key, players: map[key], remainingBudget: rb });
                }
            })
            setTeamPlayerMap(data);
        }
        //setting default filter values
        setSelectedPlayerListFilters({
            auctionStatus: null,
            team: null,
            auctionSet: null
        })
    }, [auctionData])

    const getTeamBudget = (teamId, teams) => {
        var team = teams.find((t) => { return t._id == teamId });
        if (team) {
            return parseInt(team.budget);
        } else {
            return "null";
        }
    }
    const getSetName = (setId) => {
        var s = sets.find((s) => { return s._id == setId });
        if (s) {
            return s.name;
        } else {
            return "undefiend set";
        }
    }

    const handlePlayerSelectChange = (_id, isSelected) => {
        if (_id == null) {
            setPlayers((old) => {
                const updatedPlayers = old.map(element => {
                    return { ...element, isSelected };
                });
                return updatedPlayers; // Return the new array
            })
        } else {
            setPlayers((old) => {
                const updatedPlayers = old.map(element => {
                    if (element._id === _id) {
                        // Create a new object for the player to avoid mutation
                        return { ...element, isSelected };
                    }
                    return element;
                });
                return updatedPlayers; // Return the new array
            })
        }
    }
    const handleSetAssign = (players, set) => {
        var data = [];
        players.forEach(element => {
            data.push({ _id: element._id, auctionSet: set._id });
        });
        if (data.length > 0) {
            AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
                toast.success(res.message, { duration: 3000 });
            }).catch((error) => {
                console.error(error);
                toast.error(error)
            }).finally(() => {
                getAuctionData();
            })
        }
    }


    const handlePlayerSetAssign = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length <= 0) {
            toast.error("please select atleast 1 player", { duration: 2000 })
            return;
        }
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Select Set to Assign
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label htmlFor="newTitle" className="text-gray-700">
                        Select Player set to assign
                    </label>
                    <div className='flex flex-row flex-wrap max-w-400px overflow-auto gap-3'>
                        {sets && sets.length > 0 && sets.map((set, index) => {
                            return (<div key={"new_Set_name" + set.name}>
                                <button className='button bg-slate-300 rounded p-2' onClick={() => { handleSetAssign(selectedPlayers, set) }}> {set.name}</button>
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
        ));
    }

    const handlePlayerTeamAssign = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length != 1) {
            toast.error("please select only 1 player", { duration: 2000 })
            return;
        }
        let player = selectedPlayers[0];
        let newSoldPrice = "";
        let newTeam = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Assign Team to {player.name}
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <select
                        id="newTeam"
                        type="number"
                        placeholder="Set team"
                        defaultValue={"-"}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (newTeam = e.target.value)}
                    >
                        <option value={"-"}>-</option>
                        {teams.map((t, _index) => {
                            return <option key={"neteam_menu_" + t.name} value={t._id}>{t.name}</option>
                        })}
                    </select>
                    <input
                        id="newSoldPrice"
                        type="number"
                        placeholder="Set sold price"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (newSoldPrice = e.target.value)}
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
                        onClick={(e) => {
                            e.preventDefault()
                            if (newTeam == "-" || newTeam == "") {
                                toast.error("please select team", { duration: 2000 });
                                return;
                            }
                            if (newSoldPrice == "" || newSoldPrice < player.basePrice) {
                                toast.error("please select sold price atlest of base price", { duration: 2000 });
                                return;
                            }
                            var data = [{ _id: player._id, soldPrice: newSoldPrice, team: newTeam, bidding: [{ team: newTeam, price: newSoldPrice }], auctionStatus: "sold", }];
                            if (data.length > 0) {
                                AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
                                    toast.success("Player " + player.name + " is assign to for price " + getTeamBudgetForView(newSoldPrice), { duration: 3000 })
                                }).catch((e) => {
                                    console.error(e);
                                    toast.success("Error in assigning player " + player.name + " to team - " + e.toString(), { duration: 3000 })
                                }).finally(() => {
                                    toast.dismiss(t.id)
                                    getAuctionData();
                                })
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }


    const handlePlayerPermenentRemove = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length <= 0) {
            toast.error("please select atleast 1 player", { duration: 2000 })
            return;
        }
        let confirmText = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Confirm delete
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label htmlFor="newTitle" className="text-gray-700">
                        Enter 'remove' to Remove
                    </label>
                    <input
                        id="newTitle"
                        type="text"
                        placeholder=""
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
                                if (confirmText == "remove") {
                                    AuctionService.removeAuctionPlayer({ players: selectedPlayers }).then((res) => {
                                        toast.success(res.message, { duration: 3000 });
                                    }).catch((error) => {
                                        toast.error(error)
                                        console.error(error);
                                    }).finally(() => {
                                        toast.dismiss(t.id);
                                        getAuctionData();
                                    })
                                }
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Remove
                    </button>
                </div>
            </div>
        ));
    }
    const handleTeamPermenentRemove = (team) => {
        let confirmText = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Confirm Remove
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label htmlFor="newTitle" className="text-gray-700">
                        Enter 'remove' to Remove
                    </label>
                    <input
                        id="newTitle"
                        type="text"
                        placeholder=""
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
                                if (confirmText == "remove") {
                                    AuctionService.removeAuctionTeam({ team: team }).then((res) => {
                                        toast.success(res.message, { duration: 2000 });
                                    }).catch((error) => {
                                        toast.error(error, { duration: 2000 })
                                        console.error(error);
                                    }).finally(() => {
                                        toast.dismiss(t.id);
                                        getAuctionData();
                                    })
                                }
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Remove
                    </button>
                </div>
            </div>
        ));
    }

    const handleSetPermenentRemove = (set) => {
        let confirmText = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Confirm Remove
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label htmlFor="newTitle" className="text-gray-700">
                        Enter 'remove' to Remove
                    </label>
                    <input
                        id="newTitle"
                        type="text"
                        placeholder=""
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
                                if (confirmText == "remove") {
                                    AuctionService.removeAuctionSet({ set: set }).then((res) => {
                                        toast.success(res.message, { duration: 3000 });
                                    }).catch((error) => {
                                        toast.error(error)
                                        console.error(error);
                                    }).finally(() => {
                                        toast.dismiss(t.id);
                                        getAuctionData();
                                    })
                                }
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Remove
                    </button>
                </div>
            </div>
        ));
    }

    const addNewSet = (data) => {
        AuctionService.createAuctionSet(data).then((res) => {
            toast.success(res.message, { duration: 3000 });
        }).catch((error) => {
            toast.error(error)
            console.error(error);
        }).finally(() => {
            getAuctionData();
        });
    }

    const createNewAuctionSet = () => {
        let newSetName = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Auction
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <input
                        id="newSetName"
                        type="text"
                        placeholder="Set name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (newSetName = e.target.value)}
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
                            var data = {
                                name: newSetName.trim(),
                                auction: auction
                            }
                            if (data.name && data.name.length > 2) {
                                addNewSet(data);
                                toast.dismiss(t.id);
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Add
                    </button>
                </div>
            </div>
        ));
    }

    const addTeam = () => {
        let newTeamName = "";
        let newTeamOwner = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Auction
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <input
                        id="newTeamName"
                        type="text"
                        placeholder="Team name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (newTeamName = e.target.value)}
                    />
                    <input
                        id="newTeamOwner"
                        type="text"
                        placeholder="Team Owner"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (newTeamOwner = e.target.value)}
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
                            var data = {
                                name: newTeamName.trim(),
                                owner: newTeamOwner.trim(),
                                auction: auction
                            }
                            if (validateNewTeamData(data)) {
                                addNewTeam(data);
                                toast.dismiss(t.id);
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Add
                    </button>
                </div>
            </div>
        ));
    }

    const validateNewTeamData = (data) => {
        if (!data.name || data.name.length < 2) {
            toast.error("Name must be atleast 3 charactor");
            return false;
        }
        if (!data.owner || data.owner.length < 2) {
            toast.error("Owner must be atleast 3 charactor");
            return false;
        }
        return true;
    }

    const addNewTeam = (data) => {
        AuctionService.createAuctionTeam(data).then((res) => {
            toast.success(res.message, { duration: 3000 });
        }).catch((error) => {
            toast.error(error)
            console.error(error);
        }).finally(() => {
            getAuctionData();
        });
    }

    const handleAuctionDataSetup = (playerData) => {
        var importpromise = AuctionService.auctionDataImports({ playerData: playerData, auction: auction }).then((res) => {
            toast.success(res.message, { duration: 3000 });
        }).catch((error) => {
            toast.error(error)
            console.error(error);
        }).finally(() => {
            getAuctionData();
        });
        toast.promise(importpromise, {
            loading: "Importing Auction details",
            success: "Details successfully added",
            error: "Something went wrong"
        })
    }

    const getMSExelForPlayerAdd = () => {
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center shadow-md">
                <div className="text-gray-800 text-lg font-semibold ">
                    Player add via MS Exel file
                </div>
                <div className="flex flex-row gap-4 p-4 justify-center w-full">

                    <label className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md' htmlFor="upload">Upload Exel File</label>
                    <input
                        className='bg-blue-600 hover:bg-blue-700 text-white rounded-md'
                        type="file"
                        name="upload"
                        id="upload"
                        accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        onChange={(e) => { readUploadFile(e, t) }}
                    />

                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                </div>
            </div >
        ), { duration: 4000000, });
    }

    const readUploadFile = (e, t) => {
        const tabName = ["main"];
        toast.dismiss(t.id);
        e.preventDefault();
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = xlsx.read(data, { type: "array" });
                console.debug("workbook", workbook)
                // const sheetName = workbook.SheetNames[0];
                // const worksheet = workbook.Sheets[sheetName];
                var tabsData = {};
                tabName.forEach((tab) => {
                    var tabData = xlsx.utils.sheet_to_json(workbook.Sheets[tab]);
                    tabsData[tab] = tabData;
                })
                if (tabsData) {
                    console.debug("tabsData", tabsData);
                    handleAuctionDataSetup(tabsData);
                }
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    }
    const handlePlayerAdd = (players) => {
        let newPlayer = players.map((p, index) => {
            return {
                name: p["PLAYER NAME AS PER HRMS"],
                playerNumber: p["PLAYER NO"],
                contactNumber: p["CONTACT NO"],
                shift: p["SHIFT"],
                role: p["ROLE"],
                bowlingHand: p["BOWLING HAND"],
                bowlingType: p["BOWLING TYPE"],
                battingHand: p["BATTING HAND"],
                battingPossition: p["BATTING POSSITION"],
                battingType: p["BATTING TYPE"],
            }
        })
        AuctionService.createAuctionPlayer({ players: newPlayer, auction: auction }).then((res) => {
            toast.success(res.message, { duration: 3000 });
        }).catch((error) => {
            toast.error(error, { duration: 3000 })
            console.error(error);
        }).finally(() => {
            getAuctionData();
        });
    }

    const getFilterFieldDisplayText = (key) => {
        return "Select filter";
    }

    const handleSortOrderChange = (key) => {

    }

    const handlePlayerEditBasePrice = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length != 1) {
            toast.error("please select only 1 player", { duration: 2000 })
            return;
        }
        let player = selectedPlayers[0];
        let newBasePrice = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Edit Base Price for {player.name}
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <input
                        id="newBasePrice"
                        type="number"
                        placeholder="Set Base Price"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (newBasePrice = e.target.value)}
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
                        onClick={(e) => {
                            e.preventDefault()
                            var data = [{ _id: player._id, basePrice: newBasePrice }];
                            if (data.length > 0) {
                                AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
                                    toast.success("Base price of " + player.name + " is updated to " + newBasePrice, { duration: 3000 })
                                }).catch((e) => {
                                    console.error(e);
                                    toast.success("Error in updating base price of " + player.name + ",  error: " + e.toString(), { duration: 3000 })
                                }).finally(() => {
                                    getAuctionData();
                                })
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div >
        ));
    }
    const exportFinalTeamList = (id) => {
        generatePDF(id);
    }

    return (
        <>
            <div className='flex flex-col w-full max-w-full h-full overflow-x-hidden overflow-y-auto p-1 text-sx gap-2'>
                <div className='header flex flex-row justify-center gap-2'>
                    <button onClick={() => { navigate("/p/t/auction/" + auctionId) }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >Auction Home</button>
                    <button onClick={() => {
                        setView((old) => {
                            old = structuredClone(old);
                            old.exportTeamList = !old.exportTeamList;
                            return old;
                        })
                    }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >Export Teams List</button>
                    <button onClick={() => {
                        setView((old) => {
                            old = structuredClone(old);
                            old.auctionDetails = !old.auctionDetails;
                            return old;
                        })
                    }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >
                        Update Auction</button>
                    <button onClick={() => { getMSExelForPlayerAdd() }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                        Import Auction Details
                    </button>

                    {/* <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { }}>Add Player</div> */}
                </div>
                {!view.auctionDetails && !view.exportTeamList && <div className='flex-grow flex flex-col gap-2'>

                    {/* player */}
                    <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full h-auto max-h-[100vh] px-4 mx-auto max-w-[100vw] lg:px-12 p-1 overflow-auto">
                        {/* <div className="px-4 mx-auto max-w-screen-2xl h-full lg:px-12 p-1"> */}
                        <div className="flex flex-col h-full mx-h-full mx-w-full bg-white shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                            <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                <div className="flex items-center flex-1 space-x-4">
                                    <h5>
                                        <span className="text-gray-900">{`Players: ${playersCopy.length} || Selected players: ${players.length}`}</span>
                                    </h5>
                                </div>
                                <div className="flex flex-col flex-wrap space-x-2 space-y-2 md:flex-row md:items-center sm:justify-end md:space-y-0 md:space-x-3">
                                    <button onClick={() => { handlePlayerTeamAssign() }} type="button" className="px-2 py-1 md:px-3 md:py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                        Add to Team
                                    </button>
                                    <button onClick={() => { handlePlayerEditBasePrice() }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                        Edit Base Price
                                    </button>
                                    <button onClick={() => { handlePlayerSetAssign() }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                        Add to Set
                                    </button>
                                    <button onClick={() => { handlePlayerPermenentRemove() }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                        Remove from auction
                                    </button>

                                    <button onClick={() => {
                                        setView((old) => {
                                            old = structuredClone(old);
                                            old.player = !old.player
                                            return old;
                                        })
                                    }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                        Hide / Show
                                    </button>
                                </div>
                            </div>
                            {view.player && players &&
                                <div className="relative w-full h-full overflow-auto">
                                    <table className="w-full max-w-full text-sm text-left h-full overflow-auto text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-4 py-1">
                                                    <div className="flex items-center">
                                                        <input onChange={(e) => { handlePlayerSelectChange(null, e.target.checked) }} id="checkbox-all" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                    </div>
                                                </th>
                                                {requiredPlayerColumnForDisplay.map(key => {
                                                    return (<th key={"requiredTeamColumnForDisplay_player_header_" + key} scope="col" className="px-4 py-1"><div className='flex flex-row items-center gap-2'><div>{key}</div><div className='cursor-pointer' onClick={() => { handleSortOrderChange(key) }}> {downArrowIcon}</div></div></th>)
                                                })}
                                            </tr>

                                            {/* filters */}
                                            <tr className='pb-2' >
                                                <th scope="col" className="px-4 py-1">
                                                    <div className="flex items-center bg-green-400 p-1 rounded cursor-pointer" onClick={() => {
                                                        setSelectedPlayerListFilters({})
                                                    }}> Clear
                                                    </div>
                                                </th>
                                                {requiredPlayerColumnForDisplay.map(key => {
                                                    if (filterFields.includes(key)) {
                                                        return (<th key={"requiredTeamColumnForDisplay_player_filter_val_" + key} scope="col" className="px-1 py-1 w-full">
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
                                                                    value={selectedPlayerListFilters[key]}
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
                                                        return (<th key={"requiredTeamColumnForDisplay_player_filter_val_" + key} scope="col" className="px-4 py-1"></th>)
                                                    }
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody className='overflow-auto'>
                                            {players.length > 0 && players.map((player, rowIndex) => {
                                                return (
                                                    <tr key={"player-" + rowIndex} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <td key={"player-" + rowIndex + "-checkbox"} className="w-4 px-4 py-3">
                                                            <div className="flex items-center">
                                                                <input onChange={(e) => { handlePlayerSelectChange(player._id, e.target.checked) }} checked={player.isSelected} id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                                <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                                                            </div>
                                                        </td>
                                                        {requiredPlayerColumnForDisplay.map((key, colIndex) => {
                                                            if (player.hasOwnProperty(key)) {
                                                                var value = "";
                                                                if (key == "auctionSet") { value = getSetName(player[key]) }
                                                                else if (key == "team") { if (player[key]) { value = getTeamName(player[key], teams); } else { value = "-"; } }
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
                            }
                        </div>
                        {/* </div> */}
                    </section>

                    {/* set */}
                    <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full h-auto max-h-[100vh] overflow-auto">
                        <div className="px-4 mx-auto max-w-screen-2xl h-full lg:px-12 p-1">
                            <div className="relative overflow-hidden h-full bg-white shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                                <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                    <div className="flex items-center flex-1 space-x-4">
                                        <h5>
                                            <span className="text-gray-500">All Sets:</span>
                                            <span className="dark:text-white">{sets.length}</span>
                                        </h5>
                                    </div>
                                    <div className="flex flex-col flex-wrap space-x-2 space-y-2 md:flex-row md:items-center sm:justify-end md:space-y-0 md:space-x-3">
                                        <button onClick={() => { createNewAuctionSet() }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                            Add Set
                                        </button>
                                        <button onClick={() => {
                                            setView((old) => {
                                                old = structuredClone(old);
                                                old.set = !old.set
                                                return old;
                                            })
                                        }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                            Hide / Show
                                        </button>
                                    </div>
                                </div>
                                {view.set && <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className=" text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                {sets && sets.length > 0 && Object.keys(sets[0]).map(key => {
                                                    if (requiredSetColumnForDisplay.includes(key)) {
                                                        return (<th key={"requiredTeamColumnForDisplay_sets_val_" + key} scope="col" className="px-4 py-3">{key}</th>)
                                                    }
                                                    return null;
                                                    // return (<th scope="col" className="px-4 py-3">{key}</th>)
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
                                                                var value = set[key];
                                                                return (
                                                                    <td key={"player-" + rowIndex + "-" + colIndex} className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{value}</td>
                                                                )
                                                            }
                                                            return null;
                                                        })}
                                                        <td key={"sets-" + rowIndex + "remove"} className="w-4 px-4 py-3">
                                                            <div onClick={() => { handleSetPermenentRemove(set) }} className="flex items-center cursor-pointer bg-red-500 rounded px-2 p-1 text-black ">
                                                                Remove
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>}
                            </div>
                        </div>
                    </section>

                    {/* team */}
                    <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full h-auto max-h-[100vh] overflow-auto">
                        <div className="px-4 mx-auto max-w-screen-2xl lg:px-12 p-1 h-full">
                            <div className="relative overflow-hidden bg-white h-full shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                                <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                    <div className="flex items-center flex-1 space-x-4">
                                        <h5>
                                            <span className="text-gray-500">All Team:</span>
                                            <span className="dark:text-white">{teams.length}</span>
                                        </h5>
                                    </div>
                                    <div className="flex flex-col flex-wrap space-x-2 space-y-2 md:flex-row md:items-center sm:justify-end md:space-y-0 md:space-x-3">
                                        <button onClick={() => { addTeam() }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                            Add Team
                                        </button>
                                        <button onClick={() => {
                                            setView((old) => {
                                                old = structuredClone(old);
                                                old.team = !old.team
                                                return old;
                                            })
                                        }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                            Hide / Show
                                        </button>
                                    </div>
                                </div>
                                {view.team && <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className=" text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="p-4">
                                                    <div className="flex items-center">
                                                        <label htmlFor="checkbox-all" className="sr-only bg-red-700">Logo</label>
                                                    </div>
                                                </th>
                                                {teams && teams.length > 0 && Object.keys(teams[0]).map(key => {
                                                    if (requiredTeamColumnForDisplay.includes(key)) {
                                                        return (<th key={"requiredTeamColumnForDisplay_team_val_" + key} scope="col" className="px-4 py-3">{key}</th>)
                                                    }
                                                    return null;
                                                })}
                                                <th scope="col" className="p-4">
                                                    <div className="flex items-center">
                                                        <label htmlFor="checkbox-all" className="sr-only bg-red-700">Remove</label>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='h-full overflow-auto'>
                                            {teams && teams.length > 0 && teams.map((team, rowIndex) => {
                                                return (
                                                    <tr key={"teams-" + rowIndex} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <td key={"teams-" + rowIndex + "-checkbox1"} className="w-4 px-4 py-3">
                                                            <div className="relative flex flex-col items-center">
                                                                <label className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer">
                                                                    {team.logo && team.logo.url ? (
                                                                        <div
                                                                            className="w-full h-full bg-cover bg-center"
                                                                            style={{ backgroundImage: `url(${team.logo.url})` }}
                                                                        >\
                                                                            {defaultTeamLogo}

                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                            {defaultTeamLogo}
                                                                        </div>
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                        onChange={(e) => { handleImageUpload(e, team) }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </td>
                                                        {Object.keys(team).map((key, colIndex) => {
                                                            if (requiredTeamColumnForDisplay.includes(key)) {
                                                                var value = team[key];
                                                                if (key == "budget" || key == "remainingBudget") {
                                                                    value = getTeamBudgetForView(value);
                                                                }
                                                                return (
                                                                    <td key={"player-" + rowIndex + "-" + colIndex} className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{value}</td>
                                                                )
                                                            }
                                                            return null;
                                                        })}
                                                        <td key={"teams-" + rowIndex + "-checkbox"} className="w-4 px-4 py-3">
                                                            <div onClick={() => { handleTeamPermenentRemove(team) }} className="flex items-center cursor-pointer bg-red-500 rounded px-2 p-1 text-black ">
                                                                Remove
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>}
                            </div>
                        </div>
                    </section>

                </div>}
                {view.auctionDetails && <div className='flex-grow flex flex-col gap-2'>
                    <div
                        className={`text-gray-800 text-lg font-semibold}`}
                    >
                        Edit Auction Details
                    </div>
                    <div className="flex flex-col justify-center items-center w-full space-x-2 space-y-2">
                        <div className="flex flex-row justify-start items-center w-full space-x-2 space-y-2 px-2">
                            <label htmlFor="budgetPerTeam">
                                Budget per Team :
                            </label>
                            <input
                                id="budgetPerTeam"
                                type="number"
                                placeholder="Set Team Budget"
                                value={auctionEditable.budgetPerTeam}
                                className="w-auto min-w-200px px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    setAuctionEditable((old) => {
                                        old = structuredClone(old);
                                        old.budgetPerTeam = e.target.value;
                                        return old;
                                    })
                                }}
                            />
                        </div><div className="flex flex-row justify-start items-center w-full space-x-2 space-y-2 px-2">
                            <label htmlFor="maxTeamMember">
                                Maximum member per team :
                            </label>
                            <input
                                id="maxTeamMember"
                                type="number"
                                placeholder="Maximum member per team"
                                value={auctionEditable.maxTeamMember}
                                className="w-auto min-w-200px px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    setAuctionEditable((old) => {
                                        old = structuredClone(old);
                                        old.maxTeamMember = e.target.value;
                                        return old;
                                    })
                                }}
                            />
                        </div>
                        <div className="flex flex-row justify-start items-center w-full space-x-2 space-y-2 px-2">
                            <label htmlFor="minTeamMember">
                                Minimum member per team :
                            </label>
                            <input
                                id="minTeamMember"
                                type="number"
                                placeholder="Minimum member per team"
                                value={auctionEditable.minTeamMember}
                                className="w-auto min-w-200px px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    setAuctionEditable((old) => {
                                        old = structuredClone(old);
                                        old.minTeamMember = e.target.value;
                                        return old;
                                    })
                                }}
                            />
                        </div>
                        <div className="flex flex-row justify-start items-center w-full space-x-2 space-y-2 px-2">
                            <label htmlFor="auctionLiveEnabled">
                                Live Link Enabled :
                            </label>
                            <input
                                id="auctionLiveEnabled"
                                type="checkbox"
                                checked={auctionEditable.auctionLiveEnabled}
                                className="w-auto min-w-200px px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    setAuctionEditable((old) => {
                                        old = structuredClone(old);
                                        old.auctionLiveEnabled = e.target.checked;
                                        return old;
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row gap-4 justify-center w-full">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                var payload = {
                                    _id: auction._id,
                                    maxTeamMember: auctionEditable.maxTeamMember,
                                    minTeamMember: auctionEditable.minTeamMember,
                                    budgetPerTeam: auctionEditable.budgetPerTeam,
                                    auctionLiveEnabled: auctionEditable.auctionLiveEnabled
                                }
                                if (isNaN(payload.budgetPerTeam) || isNaN(payload.minTeamMember) || isNaN(payload.minTeamMember)) {
                                    toast.error("Please enter valid numbers", { duration: 3000 });
                                    return;
                                }
                                AuctionService.updateAuction({ auction: payload }).then((res) => {
                                    toast.success("Auction details updated successfully", { duration: 3000 })
                                }).catch((e) => {
                                    console.error(e);
                                    toast.success("Error while updating auction details - " + e.toString(), { duration: 3000 })
                                }).finally(() => {
                                    getAuctionData();
                                })
                            }
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Update
                        </button>
                    </div>
                </div>}
                {view.exportTeamList &&
                    <div className='flex flex-col gap-4 w-full'>
                        <div className='flex flex-row justify-end px-4 gap-4'>
                            <button onClick={() => { exportFinalTeamList("finalTeamListView") }} type="button" className=" px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" >Export as pdf</button>
                        </div>
                        <div className='border rounded-lg border-gray-600'>
                            <div id="finalTeamListView" className='flex flex-col gap-6 w-full'>
                                <div className="text-gray-900 text-2xl font-bold">
                                    {auction.name}
                                </div>
                                <div className="text-gray-900 text-xl font-bold">
                                    Final Team List
                                </div>

                                <div className="flex flex-row flex-wrap  gap-4 justify-center w-full">
                                    {teamPlayerMap && teamPlayerMap.map((map, _mapIndex) => {
                                        return (<div key={"exportTeamList_teamPlayerMap_" + _mapIndex} className='flex min-w-[23%] pb-1 mb-2 flex-col shadow rounded bg-gray-100 justify-start items-center gap-4'>
                                            <div className='flex flex-col justify-center font-bold text-lg'>
                                                {getTeamName(map.team, teams)}
                                            </div>
                                            <div className='flex flex-col justify-center'>
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className=" text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                                                        <tr className='border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'>
                                                            <th className='px-4 py-2 text-md font-bold text-gray-900 whitespace-nowrap dark:text-white'>N0.</th>
                                                            <th className='px-4 py-2 text-md font-bold text-gray-900 whitespace-nowrap dark:text-white'>Name</th>
                                                            <th className='px-4 py-2 text-md font-bold text-gray-900 whitespace-nowrap dark:text-white'>Sold Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='h-full'>
                                                        {map.players && map.players.map((p, _playerIndex) => {
                                                            return (
                                                                <tr key={"row-" + _mapIndex + "-" + _playerIndex} className="[&:not(:last-child)]:border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                    <td className='px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                                                                        {p.playerNumber}
                                                                    </td><td className='px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                                                                        {p.name}
                                                                    </td>
                                                                    <td className='px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                                                                        {getTeamBudgetForView(p.soldPrice)}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>)
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>}
            </div>
        </>
    )
}
