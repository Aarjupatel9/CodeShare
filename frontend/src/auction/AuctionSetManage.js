import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';

const requiredPlayerColumnForDisplay = ["name", "auctionSet", "playerNumber", "role", "bowlingHand", "bowlingType", "battingHand", "battingPossition", "battingType", "team", "auctionStatus", "basePrice", "soldPrice", "commnets"];

export default function AuctionSetManage(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [sets, setSets] = useState([]);
    const [playersCopy, setPlayersCopy] = useState([]);
    const [view, setView] = useState({ player: false, team: false, set: false });


    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getAuctionData();
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
                setSets(res.sets);
            }
            if (res.players && res.players.length > 0) {
                const updatedPlayers = res.players.map(element => {
                    element.isSelected = false;
                    return element;
                });
                updatedPlayers.sort((p1, p2) => p1.playerNumber - p2.playerNumber);
                setPlayers(updatedPlayers);
                setPlayersCopy(updatedPlayers);
            }
        }).catch((error) => {
            console.log(error);
            toast.error(error);
        });
    }

    useEffect(() => {
        // console.log("player changed " + JSON.stringify(players));
    }, [players])

    const getSetName = (setId) => {
        var s = sets.find((s) => { return s._id == setId });
        if (s) {
            return s.name;
        } else {
            return "undefiend set";
        }
    }
    const getTeamName = (teamId) => {
        var s = teams.find((s) => { return s._id == teamId });
        if (s) {
            return s.name;
        } else {
            return "undefiend team";
        }
    }

    const handlePlayerSelectChange = (_id, isSelected) => {
        console.log("called=" + _id + " :" + isSelected)
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
        console.log(`set assign `, data);
        if (data.length > 0) {
            AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
                toast.success(res.message);
                console.log(res);
            }).catch((error) => {
                toast.error(error)
                console.log(error);
            }).finally(() => {
                getAuctionData();
            })
        }
    }
    const handlePlayerSetAssign = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        console.log(selectedPlayers);
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
                    {sets && sets.length > 0 && sets.map((set, index) => {
                        return (<div>
                            <button className='button bg-slate-300 rounded p-2' onClick={() => { handleSetAssign(selectedPlayers, set) }}> {set.name}</button>
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

    const handlePlayerPermenentRemove = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        console.log(selectedPlayers);
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
                                console.log(`Renamed page to: ${confirmText}`);
                                if (confirmText == "remove") {
                                    AuctionService.removeAuctionPlayer({ players: selectedPlayers }).then((res) => {
                                        toast.success(res.message);
                                        console.log(res);
                                    }).catch((error) => {
                                        toast.error(error)
                                        console.log(error);
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
        console.log(team);
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
                                console.log(`Renamed page to: ${confirmText}`);
                                if (confirmText == "remove") {
                                    AuctionService.removeAuctionTeam({ team: team }).then((res) => {
                                        toast.success(res.message);
                                        console.log(res);
                                    }).catch((error) => {
                                        toast.error(error)
                                        console.log(error);
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
        console.log(set);
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
                                console.log(`Renamed page to: ${confirmText}`);
                                if (confirmText == "remove") {
                                    AuctionService.removeAuctionSet({ set: set }).then((res) => {
                                        toast.success(res.message);
                                        console.log(res);
                                    }).catch((error) => {
                                        toast.error(error)
                                        console.log(error);
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
            toast.success(res.message);
            console.log(res);
        }).catch((error) => {
            toast.error(error)
            console.log(error);
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
                            console.log(`Creating set ${JSON.stringify(data)}`);
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
                            console.log(`Creating team ${JSON.stringify(data)}`);
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
            toast.success(res.message);
            console.log(res);
        }).catch((error) => {
            toast.error(error)
            console.log(error);
        }).finally(() => {
            getAuctionData();
        });
    }

    const handleAuctionDataSetup = (tabsData) => {
        var importpromise = AuctionService.auctionDataImports({ tabsData: tabsData, auction: auction }).then((res) => {
            // toast.success(res.message);
            console.log(res);
        }).catch((error) => {
            toast.error(error)
            console.log(error);
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
            <div className="z-[1000] bg-gray-100 border border-gray-200 p-6 rounded w-[350px] h-auto flex flex-col justify-center items-center space-y-4 shadow-md">
                <div
                    className={`text-gray-800 text-lg font-semibold ${t.visible ? "animate-enter" : "animate-leave"
                        }`}
                >
                    Player add via MS Exel
                </div>
                <div className="flex flex-row gap-4 justify-center w-full">
                    <form>
                        <label className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md' htmlFor="upload">Upload Exel File</label>
                        <input
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
                            type="file"
                            name="upload"
                            id="upload"
                            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            onChange={(e) => { readUploadFile(e, t) }}
                        />
                    </form>
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

    const readUploadFile = (e, t) => {
        const tabName = ["TEAM_NAME", "AR1", "AR2", "AR3", "BA1", "BA2", "BA3", "WK1", "WK2", "Marquee"]
        e.preventDefault();
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = xlsx.read(data, { type: "array" });
                console.log("workbook", workbook)
                // const sheetName = workbook.SheetNames[0];
                // const worksheet = workbook.Sheets[sheetName];
                var tabsData = [];
                tabName.forEach((tab) => {
                    var tabData = xlsx.utils.sheet_to_json(workbook.Sheets[tab]);
                    if (tab == "TEAM_NAME") {
                        tabData = ["Midnight Marauders",
                            "Sunrise Sentinels",
                            "Moonlight Mavericks",
                            "Twilight Titans",
                            "Noon Nomads",
                            "Sunset Strikers",
                            "Golden Hour Heroes",
                            "Dawn Defenders"];
                    }
                    tabsData.push({ tab: tab, tabData: tabData });
                })
                if (tabsData) {
                    handleAuctionDataSetup(tabsData);
                    console.log(tabsData);
                }
                toast.dismiss(t.id);
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
        console.log("newPlayer");
        console.log(newPlayer);
        AuctionService.createAuctionPlayer({ players: newPlayer, auction: auction }).then((res) => {
            toast.success(res.message);
            console.log(res);
        }).catch((error) => {
            toast.error(error)
            console.log(error);
        }).finally(() => {
            getAuctionData();
        });
    }

    return (
        <>
            <div className='flex flex-col w-full h-full p-1 text-sx gap-2'>
                <div className='header flex flex-row  gap-2'>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { navigate("/t/auction/" + auctionId) }}>Auction Home</div>
                    <button onClick={() => { getMSExelForPlayerAdd() }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                        Import Auction Details
                    </button>

                    {/* <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { }}>Add Player</div> */}
                </div>
                <div className='flex flex-row gap-2 h-full max-h-full overflow-auto'>
                    <div className='TeamPannel flex flex-col gap-2 w-fll min-w-full h-full max-h-full overflow-auto'>

                        {/* set */}
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
                                            {/* <button onClick={() => { createNewAuctionSet() }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
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
                                                    {sets && sets.length > 0 && Object.keys(sets[0]).map(key => {
                                                        return (<th scope="col" className="px-4 py-3">{key}</th>)
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
                                                                return (
                                                                    <td key={"sets-" + rowIndex + "-" + colIndex} className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{set[key]}</td>
                                                                )
                                                            })}
                                                            <td key={"sets-" + rowIndex + "remove"} className="w-4 px-4 py-3">
                                                                <div onClick={() => { handleSetPermenentRemove(set) }} className="flex items-center cursor-pointer ">
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


                        {/* player */}
                        <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full  overflow-auto">
                            <div className="px-4 mx-auto max-w-screen-2xl lg:px-12 p-1">
                                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                        <div className="flex items-center flex-1 space-x-4">
                                            <h5>
                                                <span className="text-gray-500">All Players:</span>
                                                <span className="dark:text-white">{players.length}</span>
                                            </h5>
                                        </div>
                                        <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                                            {/* <button onClick={() => { getMSExelForPlayerAdd() }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                Add Players
                                            </button>  <button onClick={() => { handlePlayerSetAssign() }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                Add to Set
                                            </button>
                                            <button onClick={() => { handlePlayerPermenentRemove() }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                Remove from auction
                                            </button> */}
                                            <button onClick={() => {
                                                setView((old) => {
                                                    old = structuredClone(old);
                                                    old.player = !old.player
                                                    return old;
                                                })
                                            }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                hide/show
                                            </button>
                                        </div>
                                    </div>
                                    {view.player && <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    <th scope="col" className="p-4">
                                                        <div className="flex items-center">
                                                            <input onChange={(e) => { handlePlayerSelectChange(null, e.target.checked) }} id="checkbox-all" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                        </div>
                                                    </th>
                                                    {players && players.length > 0 && Object.keys(players[0]).map(key => {
                                                        if (requiredPlayerColumnForDisplay.includes(key)) {
                                                            return (<th scope="col" className="px-4 py-3">{key}</th>)
                                                        }
                                                        return null;
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody className='h-full overflow-auto'>
                                                {players && players.length > 0 && players.map((player, rowIndex) => {
                                                    return (
                                                        <tr key={"player-" + rowIndex} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <td key={"player-" + rowIndex + "-checkbox"} className="w-4 px-4 py-3">
                                                                <div className="flex items-center">
                                                                    <input onChange={(e) => { handlePlayerSelectChange(player._id, e.target.checked) }} checked={player.isSelected} id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                                    <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                                                                </div>
                                                            </td>
                                                            {Object.keys(player).map((key, colIndex) => {
                                                                if (requiredPlayerColumnForDisplay.includes(key)) {
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
                                    </div>}
                                </div>
                            </div>
                        </section>

                        {/* team */}
                        <section className="bg-gray-100 dark:bg-gray-900 py-3 sm:py-2 w-full  overflow-auto">
                            <div className="px-4 mx-auto max-w-screen-2xl lg:px-12 p-1">
                                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg px-3">
                                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                        <div className="flex items-center flex-1 space-x-4">
                                            <h5>
                                                <span className="text-gray-500">All Team:</span>
                                                <span className="dark:text-white">{teams.length}</span>
                                            </h5>
                                        </div>
                                        <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                                            {/* <button onClick={() => { addTeam() }} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                Add Team
                                            </button> */}
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
                                    {view.team && <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    {teams && teams.length > 0 && Object.keys(teams[0]).map(key => {
                                                        return (<th scope="col" className="px-4 py-3">{key}</th>)
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
                                                            {Object.keys(team).map((key, colIndex) => {
                                                                return (
                                                                    <td key={"teams-" + rowIndex + "-" + colIndex} className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{team[key]}</td>
                                                                )
                                                            })}
                                                            <td key={"teams-" + rowIndex + "-checkbox"} className="w-4 px-4 py-3">
                                                                <div onClick={() => { handleTeamPermenentRemove(team) }} className="flex items-center cursor-pointer ">
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

                    </div>

                </div>
            </div>
        </>
    )
}
