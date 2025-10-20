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
import AuctionModal from './components/AuctionModal';
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

    // Modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);
    const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
    const [showEditPriceModal, setShowEditPriceModal] = useState(false);
    const [showAssignSetModal, setShowAssignSetModal] = useState(false);
    const [showDeletePlayersModal, setShowDeletePlayersModal] = useState(false);
    const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
    const [showDeleteSetModal, setShowDeleteSetModal] = useState(false);
    const [showCreateSetModal, setShowCreateSetModal] = useState(false);

    // Modal form data
    const [teamFormData, setTeamFormData] = useState({ name: '', owner: '', budget: '' });
    const [assignFormData, setAssignFormData] = useState({ team: '', soldPrice: '' });
    const [basePriceFormData, setBasePriceFormData] = useState({ basePrice: '' });
    const [setFormData, setSetFormData] = useState({ set: '' });
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [newSetFormData, setNewSetFormData] = useState({ name: '' });
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedTeamToDelete, setSelectedTeamToDelete] = useState(null);
    const [selectedSetToDelete, setSelectedSetToDelete] = useState(null);

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
            if (error == "TokenExpiredError" || error.toString().includes("TokenExpiredError") || error.toString().includes("token expired")) {
                toast.error("Your session has expired. Please login again to continue.");
                navigate("/auth/login");
            } else {
                toast.error(error.toString(), { duration: 3000 });
            }
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
        setShowAssignSetModal(true);
    }

    const handleSetAssignToPlayers = (set) => {
        const selectedPlayers = players.filter(player => player.isSelected);
        handleSetAssign(selectedPlayers, set);
        setShowAssignSetModal(false);
    }

    const handlePlayerTeamAssign = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length != 1) {
            toast.error("please select only 1 player", { duration: 2000 })
            return;
        }
        const player = selectedPlayers[0];
        setSelectedPlayer(player);
        setAssignFormData({ team: '-', soldPrice: '' });
        setShowAssignTeamModal(true);
    }

    const handleAssignTeamSubmit = (e) => {
        e.preventDefault();
        if (assignFormData.team == "-" || assignFormData.team == "") {
            toast.error("please select team", { duration: 2000 });
            return;
        }
        if (assignFormData.soldPrice == "" || parseFloat(assignFormData.soldPrice) < parseFloat(selectedPlayer.basePrice)) {
            toast.error("please select sold price at least of base price", { duration: 2000 });
            return;
        }
        var data = [{ 
            _id: selectedPlayer._id, 
            soldPrice: assignFormData.soldPrice, 
            team: assignFormData.team, 
            bidding: [{ team: assignFormData.team, price: assignFormData.soldPrice }], 
            auctionStatus: "sold", 
        }];
        
        AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
            toast.success("Player assigned successfully", { duration: 3000 })
            setShowAssignTeamModal(false);
        }).catch((e) => {
            console.error(e);
            toast.error("Error in assigning player: " + e.toString(), { duration: 3000 })
        }).finally(() => {
            getAuctionData();
        })
    }

    const handlePlayerPermenentRemove = () => {
        const selectedPlayers = players.filter(player => player.isSelected);
        if (selectedPlayers.length <= 0) {
            toast.error("please select atleast 1 player", { duration: 2000 })
            return;
        }
        setDeleteConfirmText('');
        setShowDeletePlayersModal(true);
    }

    const handleDeletePlayersSubmit = (e) => {
        e.preventDefault();
        if (deleteConfirmText.toLowerCase() != "delete") {
            toast.error("Please type 'delete' to confirm");
            return;
        }
        const selectedPlayers = players.filter(player => player.isSelected);
        // Backend expects array of full player objects
        AuctionService.removeAuctionPlayer({ players: selectedPlayers }).then((res) => {
            toast.success(res.message, { duration: 3000 });
            setShowDeletePlayersModal(false);
            setDeleteConfirmText('');
        }).catch((error) => {
            console.error(error);
            toast.error(error)
        }).finally(() => {
            getAuctionData();
        })
    }

    const handleTeamPermenentRemove = (team) => {
        setSelectedTeamToDelete(team);
        setShowDeleteTeamModal(true);
    }

    const handleDeleteTeamSubmit = () => {
        if (!selectedTeamToDelete) return;
        
        // Backend expects { team: {_id: "id"} } - single object format
        AuctionService.removeAuctionTeam({ team: { _id: selectedTeamToDelete._id } }).then((res) => {
            toast.success(res.message, { duration: 3000 });
            setShowDeleteTeamModal(false);
            setSelectedTeamToDelete(null);
        }).catch((error) => {
            console.error(error);
            toast.error(error)
        }).finally(() => {
            getAuctionData();
        })
    }

    const handleSetPermenentRemove = (set) => {
        setSelectedSetToDelete(set);
        setShowDeleteSetModal(true);
    }

    const handleDeleteSetSubmit = () => {
        if (!selectedSetToDelete) return;
        
        // Backend expects { set: {_id: "id"} } - single object format
        AuctionService.removeAuctionSet({ set: { _id: selectedSetToDelete._id } }).then((res) => {
            toast.success(res.message, { duration: 3000 });
            setShowDeleteSetModal(false);
            setSelectedSetToDelete(null);
        }).catch((error) => {
            console.error(error);
            toast.error(error)
        }).finally(() => {
            getAuctionData();
        })
    }

    const addNewSet = (data) => {
        AuctionService.createAuctionSet({ name: data.name, auction: auctionId }).then((res) => {
            toast.success(res.message, { duration: 3000 });
        }).catch((error) => {
            toast.error(error)
            console.error(error);
        }).finally(() => {
            getAuctionData();
        });
    }

    const createNewAuctionSet = () => {
        setNewSetFormData({ name: '' });
        setShowCreateSetModal(true);
    }

    const handleCreateSetSubmit = (e) => {
        e.preventDefault();
        if (newSetFormData.name.length < 1) {
            toast.error("Please enter set name", { duration: 2000 });
            return;
        }
        addNewSet({ name: newSetFormData.name });
        setShowCreateSetModal(false);
    }

    const addTeam = () => {
        // Auto-populate budget from auction settings
        setTeamFormData({ 
            name: '', 
            owner: '', 
            budget: auction?.budgetPerTeam || '' 
        });
        setShowAddTeamModal(true);
    }

    const handleAddTeamSubmit = (e) => {
        e.preventDefault();
        if (teamFormData.name.length < 1) {
            toast.error("Please enter team name", { duration: 2000 });
            return;
        }
        if (teamFormData.owner.length < 1) {
            toast.error("Please enter team owner name", { duration: 2000 });
            return;
        }
        addNewTeam({ 
            name: teamFormData.name, 
            owner: teamFormData.owner,
            budget: teamFormData.budget || auction.budgetPerTeam 
        });
        setShowAddTeamModal(false);
    }

    const addNewTeam = (data) => {
        AuctionService.createAuctionTeam({ 
            name: data.name,
            owner: data.owner,
            auction: auction, 
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
        setShowUploadModal(true);
    }

    const readUploadFile = (e) => {
        const tabName = ["main"];
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
                    setShowUploadModal(false);
                    toast.success('Data imported successfully!');
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
        setBasePriceFormData({ basePrice: '' });
        setShowEditPriceModal(true);
    }

    const handleEditBasePriceSubmit = (e) => {
        e.preventDefault();
        if (basePriceFormData.basePrice == "") {
            toast.error("Please enter base price", { duration: 2000 });
            return;
        }
        const selectedPlayers = players.filter(player => player.isSelected);
        var data = selectedPlayers.map(p => ({ _id: p._id, basePrice: basePriceFormData.basePrice }));
        AuctionService.updateAuctionPlayer({ players: data }).then((res) => {
            toast.success(res.message, { duration: 3000 });
            setShowEditPriceModal(false);
        }).catch((error) => {
            console.error(error);
            toast.error(error)
        }).finally(() => {
            getAuctionData();
        })
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
            
            <div className='w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-6 bg-gradient-to-br from-blue-50 to-indigo-50'>
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
                                        sets={sets}
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

            {/* Modern Modals */}
            
            {/* Upload Excel Modal */}
            <AuctionModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Upload Excel File"
                icon="📤"
                size="md"
                headerGradient="from-blue-600 to-indigo-600"
            >
                <div className="text-center">
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Upload an Excel file (.xlsx) containing team or player data
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                            <p className="text-sm text-blue-800 font-medium mb-2">📋 Required Format:</p>
                            <p className="text-xs text-blue-700">Sheet Name: <span className="font-semibold">main</span></p>
                            <p className="text-xs text-blue-700 mt-2 font-medium">For Teams:</p>
                            <p className="text-xs text-blue-700 ml-2">
                                <span className="font-mono bg-blue-100 px-1 rounded">name, owner, budget</span>
                            </p>
                            <p className="text-xs text-blue-700 mt-2 font-medium">For Players:</p>
                            <p className="text-xs text-blue-700 ml-2">
                                <span className="font-mono bg-blue-100 px-1 rounded">playerNumber, name, role, basePrice, auctionSet</span>
                            </p>
                        </div>
                    </div>

                    {/* Download Template Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                toast.success('Template info: Use columns as shown above in the required format');
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition"
                        >
                            <span>📥</span>
                            <span>Download Template Info</span>
                        </button>
                    </div>

                    {/* Upload File Button */}
                    <label
                        htmlFor="upload"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold cursor-pointer transition shadow-lg"
                    >
                        <span>📁</span>
                        <span>Choose File to Upload</span>
                    </label>
                    <input
                        type="file"
                        name="upload"
                        id="upload"
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={readUploadFile}
                        className="hidden"
                    />
                    
                    <div className="mt-6">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </AuctionModal>

            {/* Add Team Modal */}
            <AuctionModal
                isOpen={showAddTeamModal}
                onClose={() => setShowAddTeamModal(false)}
                title="Add New Team"
                icon="👥"
                size="md"
                headerGradient="from-blue-600 to-indigo-600"
            >
                <form onSubmit={handleAddTeamSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Team Name *
                        </label>
                        <input
                            type="text"
                            value={teamFormData.name}
                            onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                            placeholder="e.g., Royal Challengers"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Team Owner *
                        </label>
                        <input
                            type="text"
                            value={teamFormData.owner}
                            onChange={(e) => setTeamFormData({ ...teamFormData, owner: e.target.value })}
                            placeholder="e.g., Virat Kohli"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Team Budget
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={teamFormData.budget}
                                // onChange={(e) => setTeamFormData({ ...teamFormData, budget: e.target.value })}
                                placeholder="Auto-populated from auction settings"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                readOnly
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                Auto-filled
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <span>ℹ️</span>
                            <span>Budget is set from auction settings: <span className="font-semibold">{auction.budgetPerTeam || 'Not configured'}</span></span>
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowAddTeamModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Create Team
                        </button>
                    </div>
                </form>
            </AuctionModal>

            {/* Assign Team to Player Modal */}
            <AuctionModal
                isOpen={showAssignTeamModal}
                onClose={() => setShowAssignTeamModal(false)}
                title={`Assign Team to ${selectedPlayer?.name || 'Player'}`}
                icon="🏏"
                size="md"
                headerGradient="from-green-600 to-emerald-600"
            >
                <form onSubmit={handleAssignTeamSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Select Team *
                        </label>
                        <select
                            value={assignFormData.team}
                            onChange={(e) => setAssignFormData({ ...assignFormData, team: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        >
                            <option value="-">Select a team</option>
                            {teams.map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Sold Price *
                        </label>
                        <input
                            type="number"
                            value={assignFormData.soldPrice}
                            onChange={(e) => setAssignFormData({ ...assignFormData, soldPrice: e.target.value })}
                            placeholder={`Minimum: ${selectedPlayer?.basePrice || 0}`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                            min={selectedPlayer?.basePrice || 0}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Base price: {selectedPlayer?.basePrice || 0}
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowAssignTeamModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Assign Player
                        </button>
                    </div>
                </form>
            </AuctionModal>

            {/* Edit Base Price Modal */}
            <AuctionModal
                isOpen={showEditPriceModal}
                onClose={() => setShowEditPriceModal(false)}
                title="Edit Base Price"
                icon="💰"
                size="md"
                headerGradient="from-indigo-600 to-purple-600"
            >
                <form onSubmit={handleEditBasePriceSubmit} className="space-y-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-indigo-800">
                            {players.filter(p => p.isSelected).length} player(s) selected
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            New Base Price *
                        </label>
                        <input
                            type="number"
                            value={basePriceFormData.basePrice}
                            onChange={(e) => setBasePriceFormData({ basePrice: e.target.value })}
                            placeholder="e.g., 500000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowEditPriceModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Update Price
                        </button>
                    </div>
                </form>
            </AuctionModal>

            {/* Assign to Set Modal */}
            <AuctionModal
                isOpen={showAssignSetModal}
                onClose={() => setShowAssignSetModal(false)}
                title="Assign Players to Set"
                icon="📦"
                size="md"
                headerGradient="from-purple-600 to-pink-600"
            >
                <div>
                    {/* Selected Players Info */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-purple-800 font-semibold mb-2">
                            {players.filter(p => p.isSelected).length} player(s) selected
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {players.filter(p => p.isSelected).slice(0, 5).map((player) => {
                                const currentSet = sets?.find(s => s._id === player.auctionSet);
                                return (
                                    <div key={player._id} className="text-xs bg-white px-2 py-1 rounded border border-purple-200">
                                        <span className="font-medium">{player.name}</span>
                                        {currentSet && (
                                            <span className="text-purple-600 ml-1">({currentSet.name})</span>
                                        )}
                                    </div>
                                );
                            })}
                            {players.filter(p => p.isSelected).length > 5 && (
                                <div className="text-xs text-purple-700">
                                    +{players.filter(p => p.isSelected).length - 5} more
                                </div>
                            )}
                        </div>
                    </div>

                    {sets && sets.length > 0 ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-left">
                                Select Set to Assign
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {sets.map((set) => {
                                    const playersInSet = playersCopy.filter(p => p.auctionSet === set._id).length;
                                    return (
                                        <button
                                            key={set._id}
                                            onClick={() => handleSetAssignToPlayers(set)}
                                            className="px-4 py-3 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 hover:border-purple-500 text-purple-900 rounded-lg font-semibold transition text-left"
                                        >
                                            <div className="font-bold">{set.name}</div>
                                            <div className="text-xs text-purple-700 mt-1">{playersInSet} players</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">No sets available</p>
                            <button
                                onClick={() => {
                                    setShowAssignSetModal(false);
                                    createNewAuctionSet();
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                            >
                                Create New Set
                            </button>
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={() => setShowAssignSetModal(false)}
                            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </AuctionModal>

            {/* Create New Set Modal */}
            <AuctionModal
                isOpen={showCreateSetModal}
                onClose={() => setShowCreateSetModal(false)}
                title="Create New Set"
                icon="📦"
                size="md"
                headerGradient="from-purple-600 to-pink-600"
            >
                <form onSubmit={handleCreateSetSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Set Name *
                        </label>
                        <input
                            type="text"
                            value={newSetFormData.name}
                            onChange={(e) => setNewSetFormData({ name: e.target.value })}
                            placeholder="e.g., All Rounders"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowCreateSetModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Create Set
                        </button>
                    </div>
                </form>
            </AuctionModal>

            {/* Delete Players Modal */}
            <AuctionModal
                isOpen={showDeletePlayersModal}
                onClose={() => {
                    setShowDeletePlayersModal(false);
                    setDeleteConfirmText('');
                }}
                title="Delete Players"
                icon="⚠️"
                size="md"
                headerGradient="from-red-600 to-red-700"
            >
                <form onSubmit={handleDeletePlayersSubmit} className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 mb-2">
                            You are about to delete {players.filter(p => p.isSelected).length} player(s)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Type <span className="font-bold text-red-600">delete</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type delete"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setShowDeletePlayersModal(false);
                                setDeleteConfirmText('');
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Delete Players
                        </button>
                    </div>
                </form>
            </AuctionModal>

            {/* Delete Team Modal */}
            <AuctionModal
                isOpen={showDeleteTeamModal}
                onClose={() => {
                    setShowDeleteTeamModal(false);
                    setSelectedTeamToDelete(null);
                }}
                title="Delete Team"
                icon="⚠️"
                size="md"
                headerGradient="from-red-600 to-red-700"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            Are you sure you want to delete <span className="font-bold">{selectedTeamToDelete?.name}</span>?
                        </p>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                setShowDeleteTeamModal(false);
                                setSelectedTeamToDelete(null);
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteTeamSubmit}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Delete Team
                        </button>
                    </div>
                </div>
            </AuctionModal>

            {/* Delete Set Modal */}
            <AuctionModal
                isOpen={showDeleteSetModal}
                onClose={() => {
                    setShowDeleteSetModal(false);
                    setSelectedSetToDelete(null);
                }}
                title="Delete Set"
                icon="⚠️"
                size="md"
                headerGradient="from-red-600 to-red-700"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            Are you sure you want to delete set <span className="font-bold">{selectedSetToDelete?.name}</span>?
                        </p>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                setShowDeleteSetModal(false);
                                setSelectedSetToDelete(null);
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteSetSubmit}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg"
                        >
                            Delete Set
                        </button>
                    </div>
                </div>
            </AuctionModal>

        </div>
    )
}

