import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { generatePDF } from './generatePdf';
import { getTeamName } from './Utility';
import { UserContext } from '../context/UserContext';
import AuctionNavbar from './components/AuctionNavbar';
import authService from '../services/authService';
// Import tab components
import TeamsTab from './components/setup/TeamsTab';
import PlayersTab from './components/setup/PlayersTab';
import SetsTab from './components/setup/SetsTab';
import AuctionSettings from './components/setup/AuctionSettings';
import ExportTeamList from './components/setup/ExportTeamList';

export default function AuctionSetup(props) {
    const [auction, setAuction] = useState({});
    const [auctionEditable, setAuctionEditable] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [sets, setSets] = useState([]);
    const [view, setView] = useState({ player: false, team: false, set: false, auctionDetails: false, exportTeamList: false });
    const [playersCopy, setPlayersCopy] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [auctionData, setAuctionData] = useState({});
    
    // Tabbed interface state
    const [activeTab, setActiveTab] = useState('teams');

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
    const { currUser } = useContext(UserContext);

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
        } 
        if (auctionData.sets) {
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
                auctionStatus: auctionStatus,
                team: team,
                auctionSet: auctionSet
            });
            setPlayersCopy(updatedPlayers);
            setPlayers(updatedPlayers);

            // Team player mapping for export
            const teamPlayerMap = [];
            auctionData.teams.forEach((team) => {
                const obj = {
                    team: team._id,
                    players: updatedPlayers.filter((p) => p.team == team._id)
                };
                teamPlayerMap.push(obj);
            });
            setTeamPlayerMap(teamPlayerMap);
        }

        setSelectedPlayerListFilters({
            auctionStatus: null,
            team: null,
            auctionSet: null
        })
    }, [auctionData])

    const handlePlayerSelectChange = (_id, isSelected) => {
        if (_id == null) {
            setPlayers((old) => {
                const updatedPlayers = old.map(element => {
                    return { ...element, isSelected };
                });
                return updatedPlayers;
            })
        } else {
            setPlayers((old) => {
                const updatedPlayers = old.map(element => {
                    if (element._id === _id) {
                        return { ...element, isSelected };
                    }
                    return element;
                });
                return updatedPlayers;
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
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
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
            </div >
        ), { duration: 60000 });
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
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
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
                                    toast.success("Player assigned successfully", { duration: 3000 })
                                }).catch((e) => {
                                    console.error(e);
                                    toast.error("Error in assigning player: " + e.toString(), { duration: 3000 })
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
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
                    Confirm delete
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label htmlFor="confirmText" className="text-gray-700">
                        Type <span className='font-bold'>delete</span> to confirm
                    </label>
                    <input
                        id="confirmText"
                        type="text"
                        placeholder="Type delete"
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
                        onClick={(e) => {
                            e.preventDefault()
                            if (confirmText.toLowerCase() != "delete") {
                                toast.error("Please type 'delete' to confirm");
                                return;
                            }
                            var data = { players: selectedPlayers.map(p => p._id) };
                            AuctionService.deleteAuctionPlayer(data).then((res) => {
                                toast.success(res.message, { duration: 3000 });
                            }).catch((error) => {
                                console.error(error);
                                toast.error(error)
                            }).finally(() => {
                                toast.dismiss(t.id);
                                getAuctionData();
                            })
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                        Delete
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }

    const handleTeamPermenentRemove = (team) => {
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
                    Confirm delete
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label className="text-gray-700">
                        Are you sure you want to delete <span className='font-bold'>{team.name}</span>?
                    </label>
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
                            AuctionService.deleteAuctionTeam({ teams: [team._id] }).then((res) => {
                                toast.success(res.message, { duration: 3000 });
                            }).catch((error) => {
                                console.error(error);
                                toast.error(error)
                            }).finally(() => {
                                toast.dismiss(t.id);
                                getAuctionData();
                            })
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                        Delete
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }

    const handleSetPermenentRemove = (set) => {
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
                    Confirm delete
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <label className="text-gray-700">
                        Are you sure you want to delete <span className='font-bold'>{set.name}</span>?
                    </label>
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
                            AuctionService.deleteAuctionSet({ sets: [set._id] }).then((res) => {
                                toast.success(res.message, { duration: 3000 });
                            }).catch((error) => {
                                console.error(error);
                                toast.error(error)
                            }).finally(() => {
                                toast.dismiss(t.id);
                                getAuctionData();
                            })
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                        Delete
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }

    const addNewSet = (data) => {
        AuctionService.createAuctionSet({ name: data.name, auction: auction._id }).then((res) => {
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
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
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
                        onClick={(e) => {
                            e.preventDefault()
                            if (newSetName.length < 1) {
                                toast.error("Please enter set name", { duration: 2000 });
                                return;
                            }
                            addNewSet({ name: newSetName });
                            toast.dismiss(t.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Create
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }

    const addTeam = () => {
        let teamName = "";
        let teamBudget = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
                    Add New Team
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <input
                        id="teamName"
                        type="text"
                        placeholder="Team name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (teamName = e.target.value)}
                    />
                    <input
                        id="teamBudget"
                        type="number"
                        placeholder="Team budget"
                        defaultValue={auction.budgetPerTeam || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => (teamBudget = e.target.value)}
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
                            if (teamName.length < 1) {
                                toast.error("Please enter team name", { duration: 2000 });
                                return;
                            }
                            if (teamBudget == "") {
                                teamBudget = auction.budgetPerTeam;
                            }
                            addNewTeam({ name: teamName, budget: teamBudget });
                            toast.dismiss(t.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Create
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }

    const addNewTeam = (data) => {
        AuctionService.createAuctionTeam({ 
            name: data.name, 
            auction: auction._id, 
            budget: data.budget, 
            remainingBudget: data.budget 
        }).then((res) => {
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
                    Upload Excel File
                </div>
                <div className="flex flex-col items-center w-full space-y-2 mt-4">
                    <label htmlFor="upload" className="text-gray-700 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                        Choose File
                    </label>
                    <input
                        type="file"
                        name="upload"
                        id="upload"
                        accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        onChange={(e) => { readUploadFile(e, t) }}
                        className="hidden"
                    />
                </div>
                <div className="flex flex-row gap-4 justify-center w-full mt-4">
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
                var tabsData = {};
                tabName.forEach((tab) => {
                    var tabData = xlsx.utils.sheet_to_json(workbook.Sheets[tab]);
                    tabsData[tab] = tabData;
                })
                if (tabsData) {
                    console.debug("tabsData", tabsData);
                    handleAuctionDataSetup(tabsData.main);
                }
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    }

    const handlePlayerEditBasePrice = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length <= 0) {
            toast.error("please select atleast 1 player", { duration: 2000 })
            return;
        }
        let newBasePrice = "";
        toast.custom((t) => (
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"}`}>
                    Edit Base Price
                </div>
                <div className="flex flex-col items-start w-full space-y-2">
                    <input
                        id="newBasePrice"
                        type="number"
                        placeholder="New base price"
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
                            if (newBasePrice == "") {
                                toast.error("Please enter base price", { duration: 2000 });
                                return;
                            }
                            var data = selectedPlayers.map(p => ({ _id: p._id, basePrice: newBasePrice }));
                            AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
                                toast.success(res.message, { duration: 3000 });
                            }).catch((error) => {
                                console.error(error);
                                toast.error(error)
                            }).finally(() => {
                                toast.dismiss(t.id);
                                getAuctionData();
                            })
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Update
                    </button>
                </div>
            </div >
        ), { duration: 60000 });
    }

    const handleLogout = () => {
        authService.logout()
          .then((res) => {
            navigate("/");
          })
          .catch((error) => {
            console.error("Logout error:", error);
            toast.error("Failed to logout");
          });
    };

    const exportFinalTeamList = (divId) => {
        generatePDF(divId, auction.name + "_final_team_list");
    }

    return (
        <div className='flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
            <AuctionNavbar 
                onNavigate={navigate}
                onLogout={handleLogout}
            />
            
            <div className='max-w-7xl mx-auto px-4 py-6 w-full bg-gradient-to-br from-blue-50 to-indigo-50'>
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">Auction Setup</h1>
                            <p className="text-gray-600">Configure teams, players, and auction sets for <span className="font-semibold">{auction?.name || 'your auction'}</span></p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button 
                                onClick={() => {
                                    setView({ player: false, team: false, set: false, auctionDetails: true, exportTeamList: false });
                                }}
                                className={`px-4 py-2 ${view.auctionDetails ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-2`}
                            >
                                <span>⚙️</span>
                                <span className="hidden md:inline">Auction Settings</span>
                            </button>
                            <button 
                                onClick={() => {
                                    setView({ player: false, team: false, set: false, auctionDetails: false, exportTeamList: true });
                                }}
                                className={`px-4 py-2 ${view.exportTeamList ? 'bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'} text-gray-700 rounded-lg font-semibold transition flex items-center gap-2`}
                            >
                                <span>📥</span>
                                <span className="hidden md:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Three Mutually Exclusive Views */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
                    
                    {/* VIEW 1: Tabs (Teams, Players, Sets) */}
                    {!view.auctionDetails && !view.exportTeamList && (
                        <>
                            {/* Tab Headers */}
                            <div className="border-b border-gray-200 px-4 pt-4">
                                <div className="flex gap-2 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('teams')}
                                        className={`px-6 py-3 font-semibold rounded-t-lg transition whitespace-nowrap ${
                                            activeTab === 'teams' 
                                                ? 'bg-blue-600 text-white shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        👥 Teams ({teams.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('players')}
                                        className={`px-6 py-3 font-semibold rounded-t-lg transition whitespace-nowrap ${
                                            activeTab === 'players' 
                                                ? 'bg-blue-600 text-white shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        🎯 Players ({players.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('sets')}
                                        className={`px-6 py-3 font-semibold rounded-t-lg transition whitespace-nowrap ${
                                            activeTab === 'sets' 
                                                ? 'bg-blue-600 text-white shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        📋 Auction Sets ({sets.length})
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className='p-6'>
                                {activeTab === 'teams' && (
                                    <TeamsTab 
                                        teams={teams}
                                        playersCopy={playersCopy}
                                        getMSExelForPlayerAdd={getMSExelForPlayerAdd}
                                        addTeam={addTeam}
                                        handleImageUpload={handleImageUpload}
                                        handleTeamPermenentRemove={handleTeamPermenentRemove}
                                    />
                                )}

                                {activeTab === 'players' && (
                                    <PlayersTab 
                                        players={players}
                                        playersCopy={playersCopy}
                                        teams={teams}
                                        playerListFilters={playerListFilters}
                                        selectedPlayerListFilters={selectedPlayerListFilters}
                                        setSelectedPlayerListFilters={setSelectedPlayerListFilters}
                                        getMSExelForPlayerAdd={getMSExelForPlayerAdd}
                                        handlePlayerSelectChange={handlePlayerSelectChange}
                                        handlePlayerTeamAssign={handlePlayerTeamAssign}
                                        handlePlayerEditBasePrice={handlePlayerEditBasePrice}
                                        handlePlayerSetAssign={handlePlayerSetAssign}
                                        handlePlayerPermenentRemove={handlePlayerPermenentRemove}
                                    />
                                )}

                                {activeTab === 'sets' && (
                                    <SetsTab 
                                        sets={sets}
                                        playersCopy={playersCopy}
                                        createNewAuctionSet={createNewAuctionSet}
                                        handleSetPermenentRemove={handleSetPermenentRemove}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* VIEW 2: Auction Settings */}
                    {view.auctionDetails && (
                        <AuctionSettings 
                            auction={auction}
                            auctionEditable={auctionEditable}
                            setAuctionEditable={setAuctionEditable}
                            setView={setView}
                            getAuctionData={getAuctionData}
                        />
                    )}

                    {/* VIEW 3: Export Team List */}
                    {view.exportTeamList && (
                        <ExportTeamList 
                            auction={auction}
                            teams={teams}
                            teamPlayerMap={teamPlayerMap}
                            setView={setView}
                            exportFinalTeamList={exportFinalTeamList}
                        />
                    )}

                </div>
            </div>
        </div>
    )
}

