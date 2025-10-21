import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import auctionApi from '../services/api/auctionApi';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import { getTeamLogoUrl } from './utils/assetUtils';
import { getBackendSocketUrl } from '../hooks/useConfig';

export default function AuctionLiveView() {
    const [auction, setAuction] = useState({});
    const [sets, setSets] = useState([]);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState({});
    const [isLinkValid, setIsLinkValid] = useState(false);
    const [socket, setSocket] = useState(null);
    
    // Live stats
    const [viewerCount, setViewerCount] = useState(0);
    const [recentSoldPlayers, setRecentSoldPlayers] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [auctionsStats, setAuctionsStats] = useState([]);

    // Collapsible states
    const [expandedStats, setExpandedStats] = useState({
        leaderboard: false,
        recent: false
    });
    const [expandedTeams, setExpandedTeams] = useState({});
    const [showAllPlayers, setShowAllPlayers] = useState({}); // Track which teams show all players
    
    // Player search states
    const [allPlayers, setAllPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [teamFilter, setTeamFilter] = useState('all');
    const [filteredPlayers, setFilteredPlayers] = useState([]);

    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllLiveData();
    }, [])
    
    // Filter players based on search and filters
    useEffect(() => {
        let filtered = allPlayers;
        
        // Search by name or player number
        if (searchQuery) {
            filtered = filtered.filter(player => 
                player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                player.playerNumber.toString().includes(searchQuery)
            );
        }
        
        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(player => player.auctionStatus === statusFilter);
        }
        
        // Filter by team
        if (teamFilter !== 'all') {
            filtered = filtered.filter(player => {
                const playerTeamId = player.team;
                return playerTeamId?.toString() === teamFilter;
            });
        }
        
        setFilteredPlayers(filtered);
    }, [searchQuery, statusFilter, teamFilter, allPlayers])

    useEffect(() => {
        var stats = {
            soldPlayers: players.filter(p => p.auctionStatus === 'sold').length,
            unsoldPlayers: players.filter(p => p.auctionStatus === 'unsold').length,
            pendingPlayers: players.filter(p => p.auctionStatus === 'idle').length,
        };
        setAuctionsStats(stats)
    }, [players])

    const fetchAllLiveData = async () => {
        try {
            const res = await auctionApi.getLiveViewData(auctionId);
            
            if (res.success) {
                const { auction, teams } = res.data;
                let { players: allPlayersData } = res.data;
                
                // Set basic data
                setAuction(auction);
                setTeams(teams);
                allPlayersData = allPlayersData.map((p)=>{
                    return {
                        ...p,
                        teamName: getTeamName(p.team, teams)
                    }
                })
                setAllPlayers(allPlayersData);
                
                // Filter sold players for processing
                const soldPlayers = allPlayersData.filter(p => p.auctionStatus === 'sold');
                setPlayers(soldPlayers);

                // Process data on client side (saves server resources)

                // 1. Build leaderboard (group by team, calculate totals, sort)
                const teamStats = {};
                soldPlayers.forEach(player => {
                    const teamId = player.team;
                    if (!teamId) return;

                    if (!teamStats[teamId]) {
                        teamStats[teamId] = {
                            playerCount: 0,
                            budgetSpent: 0,
                            teamName: getTeamName(player.team, teams)
                        };
                    }
                    teamStats[teamId].playerCount++;
                    teamStats[teamId].budgetSpent += parseInt(player.soldPrice || 0);
                });

                const leaderboard = Object.keys(teamStats).map(teamId => {
                    const team = teams.find(t => t._id.toString() === teamId.toString());
                    return {
                        teamId: teamId,
                        teamName: teamStats[teamId].teamName,
                        logoUrl: team?.logoUrl,
                        playerCount: teamStats[teamId].playerCount,
                        budgetSpent: teamStats[teamId].budgetSpent,
                        remainingBudget: team ? (team.budget - teamStats[teamId].budgetSpent) : 0
                    };
                }).sort((a, b) => b.budgetSpent - a.budgetSpent);

                setLeaderboardData(leaderboard);

                // 2. Recent sales (already sorted by soldNumber DESC, just take first 10)
                const recentSales = soldPlayers.slice(0, 10).map(player => ({
                    playerId: player._id,
                    playerName: player.name,
                    playerNumber: player.playerNumber,
                    teamId: player.team,
                    teamName: getTeamName(player.team, teams),
                    soldPrice: player.soldPrice,
                    soldNumber: player.soldNumber
                }));

                setRecentSoldPlayers(recentSales);

                // 3. Build team-player mapping
                const teamPlayersMap = {};
                teams.forEach(team => {
                    teamPlayersMap[team._id] = [];
                });

                soldPlayers.forEach(player => {
                    const teamId = player.team;
                    if (teamId && teamPlayersMap[teamId]) {
                        teamPlayersMap[teamId].push({
                            _id: player._id,
                            name: player.name,
                            playerNumber: player.playerNumber,
                            role: player.role,
                            soldPrice: player.soldPrice
                        });
                    }
                });

                // 4. Build teamPlayerMap for UI
                const teamMap = teams.map(team => {
                    const teamPlayerList = teamPlayersMap[team._id] || [];
                    const stats = teamStats[team._id];

                    return {
                        team: team,
                        players: teamPlayerList,
                        totalSpent: stats?.budgetSpent || 0,
                        remainingBudget: team.budget - (stats?.budgetSpent || 0),
                        avgPrice: teamPlayerList.length > 0
                            ? (stats?.budgetSpent || 0) / teamPlayerList.length
                            : 0
                    };
                });

                setTeamPlayerMap(teamMap);
                setIsLinkValid(true);
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
            toast.error("Failed to load auction data");
            setIsLinkValid(false);
        }
    };

    useEffect(() => {
        if (isLinkValid) {
            createAuctionSocket();
        } else {
            socket && socket.disconnect();
        }
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isLinkValid]);

    function createAuctionSocket() {
        const SOCKET_ADDRESS = getBackendSocketUrl();
        const socket = new io(SOCKET_ADDRESS, {
            query: { slug: "auction-" + auctionId },
            path: "/auction/",
        });

        socket.on("playerBiddingUpdate", (player) => {
            setCurrentPlayer(player);
        });

        socket.on("playerSoldUpdate", (message) => {
            toast.success(message);
            fetchAllLiveData(); // Refresh all data with single API call
        });

        // Listen for viewer count updates (real-time)
        socket.on("viewerCountUpdate", (count) => {
            setViewerCount(count);
        });

        setSocket(socket);
    }


    const getTeamName = (teamId, teams) => {
        const team = teams.find((t) => t._id === teamId);
        return team ? team.name : "Unknown";
    }

    const getTeamBudgetForView = (number) => {
        number = parseInt(number);
        return (number / 100000).toFixed(2) + " L";
    }
    // Get player profile initials
    const getPlayerInitials = (name) => {
        if (!name) return "??";
        const parts = name.split(" ");
        let initials = parts[0][0];
        if (parts[1]) initials += parts[1][0];
        return initials.toUpperCase();
    }

    // Get team logo/initials
    const getTeamInitials = (team) => {
        if (!team || !team.name) return "??";
        const name = team.name.split(" ");
        if (name.length >= 2) {
            return (name[0][0] + name[1][0]).toUpperCase();
        }
        return (name[0][0] + (name[0][1] || "")).toUpperCase();
    }

    // Toggle stats sections (mobile only)
    const toggleStats = (section) => {
        setExpandedStats(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Toggle team expansion
    const toggleTeam = (teamId) => {
        setExpandedTeams(prev => ({
            ...prev,
            [teamId]: !prev[teamId]
        }));
        // Reset show all players when collapsing
        if (expandedTeams[teamId]) {
            setShowAllPlayers(prev => ({
                ...prev,
                [teamId]: false
            }));
        }
    };

    // Toggle show all players for a team
    const toggleShowAllPlayers = (teamId) => {
        setShowAllPlayers(prev => ({
            ...prev,
            [teamId]: !prev[teamId]
        }));
    };

    // Get team gradient color
    const getTeamGradient = (index) => {
        const gradients = [
            'from-blue-600 to-blue-800',
            'from-yellow-500 to-yellow-700',
            'from-red-600 to-red-800',
            'from-purple-600 to-purple-800',
            'from-green-600 to-green-800',
            'from-pink-600 to-pink-800',
            'from-indigo-600 to-indigo-800',
            'from-orange-600 to-orange-800',
            'from-teal-600 to-teal-800',
            'from-cyan-600 to-cyan-800',
        ];
        return gradients[index % gradients.length];
    };

    // Render Current Bidding Card
    const renderCurrentBidding = () => {
        if (!currentPlayer || Object.keys(currentPlayer).length === 0) {
                return (
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⏳</div>
                        <h3 className="text-2xl font-bold mb-2">Waiting for Next Player</h3>
                        <p className="text-gray-300">Bidding will resume shortly...</p>
                    </div>
                </div>
            );
        }

        const latestBid = currentPlayer.bidding && currentPlayer.bidding.length > 0
            ? currentPlayer.bidding[currentPlayer.bidding.length - 1]
            : null;

            return (
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-black bg-opacity-30 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span>🎯</span>
                        <span>Current Bidding</span>
                    </h2>
                    <span className="px-4 py-2 bg-red-600 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        LIVE
                    </span>
                </div>

                {/* Player Info */}
                <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Left: Player Card */}
                    <div className="flex-1">
                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                                    {getPlayerInitials(currentPlayer.name)}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-blue-200 mb-1">Player #{currentPlayer.playerNumber}</div>
                                    <h3 className="text-2xl font-bold mb-1">{currentPlayer.name}</h3>
                                    <div className="text-sm text-blue-200">{currentPlayer.role}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {currentPlayer.bowlingHand && (
                                    <div className="bg-white bg-opacity-10 rounded-lg p-2">
                                        <div className="text-blue-200 text-xs mb-1">Bowling</div>
                                        <div className="font-semibold">{currentPlayer.bowlingHand} - {currentPlayer.bowlingType}</div>
                                    </div>
                                )}
                                {currentPlayer.battingHand && (
                                    <div className="bg-white bg-opacity-10 rounded-lg p-2">
                                        <div className="text-blue-200 text-xs mb-1">Batting</div>
                                        <div className="font-semibold">{currentPlayer.battingHand} - {currentPlayer.battingType}</div>
                                    </div>
                                )}
                                <div className="bg-white bg-opacity-10 rounded-lg p-2">
                                    <div className="text-blue-200 text-xs mb-1">Base Price</div>
                                    <div className="font-bold text-lg">₹{getTeamBudgetForView(currentPlayer.basePrice)}</div>
                                </div>
                                {latestBid && (
                                    <div className="bg-green-500 bg-opacity-30 rounded-lg p-2 border border-green-400">
                                        <div className="text-green-200 text-xs mb-1">Current Bid</div>
                                        <div className="font-bold text-lg text-green-100">₹{getTeamBudgetForView(latestBid.price)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Bidding History */}
                    <div className="flex-1">
                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span>📊</span>
                                <span>Bidding History</span>
                            </h4>
                            {currentPlayer.bidding && currentPlayer.bidding.length > 0 ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {[...currentPlayer.bidding].reverse().map((bid, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg text-left ${index === 0
                                                    ? 'bg-green-500 bg-opacity-40 border border-green-400'
                                                    : 'bg-white bg-opacity-10'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <span className="text-lg">👑</span>}
                                                    <span className="font-semibold">{getTeamName(bid.team, teams)}</span>
                                                </div>
                                                <span className="font-bold text-lg">₹{getTeamBudgetForView(bid.price)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-gray-300">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">⏰</div>
                                        <p>Bidding not started yet</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='flex flex-col w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white'>
            {/* Modern Header - Compact */}
            <div className="bg-black bg-opacity-50 backdrop-blur-md px-3 md:px-6 lg:px-12 py-2 md:py-3 shadow-2xl sticky top-0 z-50">
                <div className="flex flex-col gap-2">
                    {/* Top Row: Title and Viewer Count */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg md:text-2xl font-bold truncate">{auction?.name || 'Auction'}</h1>
                            <span className="px-2 md:px-3 py-1 bg-red-600 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                LIVE
                            </span>
                        </div>
                        <span className="px-2 md:px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex items-center gap-1 text-xs md:text-sm flex-shrink-0">
                                <span>👥</span>
                            <span className="font-semibold">{viewerCount}</span>
                            </span>
                    </div>
                    
                    {/* Stats Row - Compact */}
                    <div className="grid grid-cols-5 gap-1 md:gap-2">
                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-md px-2 py-1 text-center">
                            <div className="text-sm md:text-xl font-bold">{allPlayers.length}</div>
                            <div className="text-[10px] md:text-xs text-gray-300 hidden md:block">Total</div>
                            <div className="text-[10px] text-gray-300 md:hidden">Total</div>
                        </div>
                        <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-md px-2 py-1 text-center border border-green-400">
                            <div className="text-sm md:text-xl font-bold text-green-200">{auctionsStats.soldPlayers}</div>
                            <div className="text-[10px] md:text-xs text-green-300 hidden md:block">Sold</div>
                            <div className="text-[10px] text-green-300 md:hidden">Sold</div>
                        </div>
                        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-md px-2 py-1 text-center">
                            <div className="text-sm md:text-xl font-bold text-gray-300">{auctionsStats.unsoldPlayers}</div>
                            <div className="text-[10px] md:text-xs text-gray-400 hidden md:block">Unsold</div>
                            <div className="text-[10px] text-gray-400 md:hidden">Unsold</div>
                        </div>
                        <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-sm rounded-md px-2 py-1 text-center border border-yellow-400">
                            <div className="text-sm md:text-xl font-bold text-yellow-200">{auctionsStats.pendingPlayers}</div>
                            <div className="text-[10px] md:text-xs text-yellow-300 hidden md:block">Pending</div>
                            <div className="text-[10px] text-yellow-300 md:hidden">Pend</div>
                        </div>
                        <div className="bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-md px-2 py-1 text-center border border-blue-400">
                            <div className="text-sm md:text-xl font-bold text-blue-200">{teams.length}</div>
                            <div className="text-[10px] md:text-xs text-blue-300 hidden md:block">Teams</div>
                            <div className="text-[10px] text-blue-300 md:hidden">Teams</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='px-2 md:px-6 lg:px-12 xl:px-20 py-6 space-y-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white'>

                {/* Current Bidding */}
                {renderCurrentBidding()}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Team Leaderboard */}
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl overflow-hidden">
                        <button
                            onClick={() => toggleStats('leaderboard')}
                            className="w-full bg-black bg-opacity-30 px-6 py-4 hover:bg-opacity-40 transition md:cursor-default"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span>🏆</span>
                                    <span>Team Leaderboard</span>
                                </h3>
                                <svg
                                    className={`w-6 h-6 transition-transform md:hidden ${expandedStats.leaderboard ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </button>
                        <div className={`p-6 max-h-96 overflow-y-auto ${expandedStats.leaderboard ? 'block' : 'hidden md:block'}`}>
                            {leaderboardData.length > 0 ? (
                                <div className="space-y-3">
                                    {leaderboardData.map((team, index) => {
                                        const teamObj = teams.find(t => t._id.toString() === team.teamId.toString());
                                        return (
                                            <div
                                                key={team.teamId}
                                                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 text-left"
                                            >
                                                <div className={`text-2xl font-bold w-8 ${index === 0 ? 'text-yellow-300' :
                                                        index === 1 ? 'text-gray-300' :
                                                            index === 2 ? 'text-orange-300' :
                                                                'text-white'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold overflow-hidden">
                                                    {team.logoUrl ? (
                                                        <img src={getTeamLogoUrl(teamObj)} alt={team.teamName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{getTeamInitials(teamObj)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold">{team.teamName}</div>
                                                    <div className="text-sm text-yellow-100">{team.playerCount} players</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">₹{getTeamBudgetForView(team.budgetSpent)}</div>
                                                    <div className="text-sm text-yellow-100">spent</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-white text-opacity-80">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p>No data yet</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-2xl overflow-hidden">
                        <button
                            onClick={() => toggleStats('recent')}
                            className="w-full bg-black bg-opacity-30 px-6 py-4 hover:bg-opacity-40 transition md:cursor-default"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span>✅</span>
                                    <span>Recent Sales</span>
                                </h3>
                                <svg
                                    className={`w-6 h-6 transition-transform md:hidden ${expandedStats.recent ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </button>
                        <div className={`p-6 max-h-96 overflow-y-auto ${expandedStats.recent ? 'block' : 'hidden md:block'}`}>
                            {recentSoldPlayers.length > 0 ? (
                                <div className="space-y-3">
                                    {recentSoldPlayers.map((player, index) => (
                                        <div
                                            key={player.playerId || index}
                                            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold">{player.playerName}</div>
                                                <div className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded">
                                                    #{player.playerNumber}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="text-green-100">{player.teamName || 'Unknown Team'}</div>
                                                <div className="font-bold text-lg">₹{getTeamBudgetForView(player.soldPrice)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-white text-opacity-80">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🎯</div>
                                        <p>No sales yet</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Teams & Players Section */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-black bg-opacity-30 px-6 py-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span>👥</span>
                            <span>Teams & Players</span>
                        </h2>
                        <p className="text-sm text-gray-300 mt-1">Click on any team to view their squad</p>
                    </div>

                    <div className="p-2 md:p-6">
                        <div className="text-left grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                            {teamPlayerMap.map((teamData, index) => {
                                const isExpanded = expandedTeams[teamData.team._id];
                                const showAll = showAllPlayers[teamData.team._id];
                                const teamColor = getTeamGradient(index);
                                const displayPlayers = showAll ? teamData.players : teamData.players.slice(0, 5);

                                return (
                                    <div key={teamData.team._id} className={`bg-gradient-to-br ${teamColor} rounded-xl shadow-lg overflow-hidden self-start`}>
                                        <button
                                            onClick={() => toggleTeam(teamData.team._id)}
                                            className="w-full text-left p-4 hover:bg-black hover:bg-opacity-20 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden">
                                                        {teamData.team.logoUrl ? (
                                                            <img src={getTeamLogoUrl(teamData.team)} alt={teamData.team.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getTeamInitials(teamData.team)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">{teamData.team.name}</div>
                                                        <div className="text-sm opacity-90">{teamData.players.length} players • ₹{getTeamBudgetForView(teamData.totalSpent)} spent</div>
                                </div>
                            </div>
                                                <svg
                                                    className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Player List */}
                                        {isExpanded && (
                                            <div className="bg-black bg-opacity-20">
                                                <div className="px-4 py-3">
                                                    <div className="text-xs opacity-90 uppercase font-semibold mb-2">Squad ({teamData.players.length})</div>

                                                    {teamData.players.length > 0 ? (
                                                        <>
                                                            <div className={`space-y-2 ${showAll ? 'max-h-96 overflow-y-auto' : ''}`}>
                                                                {displayPlayers.map((player) => (
                                                                    <div key={player._id} className="bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
                                                                                    {getPlayerInitials(player.name)}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-semibold">{player.name}</div>
                                                                                    <div className="text-xs opacity-90">{player.role} • #{player.playerNumber}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="font-bold">₹{getTeamBudgetForView(player.soldPrice)}</div>
                                                                                <div className="text-xs text-green-300">✅ Sold</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {teamData.players.length > 5 && (
                                                                <div className="text-center py-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleShowAllPlayers(teamData.team._id);
                                                                        }}
                                                                        className="text-sm opacity-90 hover:opacity-100 hover:underline transition"
                                                                    >
                                                                        {showAll
                                                                            ? '- Show less'
                                                                            : `+ ${teamData.players.length - 5} more players`
                                                                        }
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="py-4 opacity-80">
                                                            <div className="text-center">
                                                                <div className="text-3xl mb-2">👥</div>
                                                                <p className="text-sm">No players yet</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Team Summary */}
                                                <div className="border-t border-white border-opacity-20 px-4 py-3">
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <div className="opacity-90 text-xs">Remaining Budget</div>
                                                            <div className="font-bold">₹{getTeamBudgetForView(teamData.remainingBudget)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="opacity-90 text-xs">Avg Price/Player</div>
                                                            <div className="font-bold">₹{getTeamBudgetForView(teamData.avgPrice)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* All Players Search Section */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-black bg-opacity-30 px-6 py-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span>🔍</span>
                            <span>All Players</span>
                        </h2>
                        <p className="text-sm text-gray-300 mt-1">Search and filter all players in the auction</p>
                            </div>

                    <div className="p-6 space-y-4">
                        {/* Search & Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search by name or number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-opacity-30"
                            />
                            
                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="all" className="bg-gray-800">All Status</option>
                                <option value="sold" className="bg-gray-800">Sold ✅</option>
                                <option value="unsold" className="bg-gray-800">Unsold ❌</option>
                                <option value="idle" className="bg-gray-800">Pending ⏳</option>
                            </select>
                            
                            {/* Team Filter */}
                            <select
                                value={teamFilter}
                                onChange={(e) => setTeamFilter(e.target.value)}
                                className="px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="all" className="bg-gray-800">All Teams</option>
                                {teams.map(team => (
                                    <option key={team._id} value={team._id} className="bg-gray-800">{team.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Results Count */}
                        <div className="text-sm text-gray-300">
                            Showing {filteredPlayers.length} of {allPlayers.length} players
                        </div>
                        
                        {/* Player List */}
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {filteredPlayers.length > 0 ? (
                                filteredPlayers.map(player => (
                                    <div key={player._id} className="bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition text-left">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {getPlayerInitials(player.name)}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{player.name}</div>
                                                    <div className="text-sm text-gray-300">
                                                        {player.role} • #{player.playerNumber}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {player.auctionStatus === 'sold' ? (
                                                    <>
                                                        <div className="font-bold">₹{getTeamBudgetForView(player.soldPrice)}</div>
                                                        <div className="text-xs text-green-300">{player.teamName || 'Unknown'}</div>
                                                    </>
                                                ) : player.auctionStatus === 'unsold' ? (
                                                    <div className="text-sm text-gray-400">Unsold</div>
                                                ) : (
                                                    <div className="text-sm text-yellow-400">Pending</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-400">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p>No players found matching your search</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
