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
    
    // Collapsible states
    const [expandedStats, setExpandedStats] = useState({
        leaderboard: false,
        recent: false,
        stats: false
    });
    const [expandedTeams, setExpandedTeams] = useState({});
    const [showAllPlayers, setShowAllPlayers] = useState({}); // Track which teams show all players

    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getAuctionData();
        fetchLiveData();
    }, [])
    
    const fetchLiveData = async () => {
        try {
            const recentRes = await auctionApi.getRecentSoldPlayers(auctionId, 10);
            if (recentRes.success) {
                setRecentSoldPlayers(recentRes.data);
            }
            
            const leaderRes = await auctionApi.getAuctionLeaderboard(auctionId);
            if (leaderRes.success) {
                setLeaderboardData(leaderRes.data);
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
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
            fetchLiveData();
            getAuctionData(); // Refresh team data
        });
        
        // Mock viewer count
        setViewerCount(Math.floor(Math.random() * 150) + 20);
        setSocket(socket);
    }

    const getAuctionData = () => {
        AuctionService.getPublicAuctionDetails({ auctionId: auctionId }, true).then((res) => {
            if (res.auction) setAuction(res.auction);
            if (res.teams) setTeams(res.teams);
            if (res.players) {
                const sortedPlayers = res.players.sort((p1, p2) => p1.playerNumber - p2.playerNumber);
                setPlayers(sortedPlayers);
            }
            if (res.sets) setSets(res.sets);

            // Build team-player map
            if (res.teams && res.players) {
                const map = {};
                res.teams.forEach((t) => {
                    map[t._id] = [];
                });
                res.players.forEach(player => {
                    if (player.team && map[player.team]) {
                        map[player.team].push(player);
                    }
                });

                const teamData = [];
                Object.keys(map).forEach((teamId) => {
                    const team = res.teams.find(t => t._id === teamId);
                    if (team) {
                        const teamPlayers = map[teamId].sort((a, b) => a.soldNumber - b.soldNumber);
                        const totalSpent = teamPlayers.reduce((sum, p) => sum + parseInt(p.soldPrice || 0), 0);
                        const remainingBudget = parseInt(team.budget) - totalSpent;
                        teamData.push({
                            team: team,
                            players: teamPlayers,
                            totalSpent,
                            remainingBudget,
                            avgPrice: teamPlayers.length > 0 ? totalSpent / teamPlayers.length : 0
                        });
                    }
                });

                setTeamPlayerMap(teamData);
            }

            setIsLinkValid(true);
        }).catch((error) => {
            console.error(error);
            toast.error("Failed to load auction data");
            setIsLinkValid(false);
        });
    }

    const getTeamName = (teamId) => {
        console.log(teamId);
        const team = teams.find((t) => t._id === teamId);
        return team ? team.name : "Unknown";
    }

    const getTeamBudgetForView = (number) => {
        number = parseInt(number);
        return (number / 100000).toFixed(2) + " L";
    }

    const soldPlayers = players.filter(p => p.auctionStatus === 'sold');
    const unsoldPlayers = players.filter(p => p.auctionStatus === 'unsold');
    const pendingPlayers = players.filter(p => p.auctionStatus === 'pending');

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
                                            className={`p-3 rounded-lg text-left ${
                                                index === 0 
                                                    ? 'bg-green-500 bg-opacity-40 border border-green-400' 
                                                    : 'bg-white bg-opacity-10'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <span className="text-lg">👑</span>}
                                                    <span className="font-semibold">{getTeamName(bid.team)}</span>
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
            {/* Modern Header */}
            <div className="bg-black bg-opacity-50 backdrop-blur-md px-4 sm:px-6 lg:px-12 xl:px-20 py-4 shadow-2xl sticky top-0 z-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold">{auction?.name || 'Auction'}</h1>
                        <span className="px-4 py-2 bg-red-600 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                            <span className="w-3 h-3 bg-white rounded-full"></span>
                            LIVE
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-wrap ">
                        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex items-center gap-2">
                            <span>👥</span>
                            <span className="font-semibold">{viewerCount} watching</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='px-2 md:px-6 lg:px-12 xl:px-20 py-6 space-y-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white'>
                
                {/* Current Bidding */}
                {renderCurrentBidding()}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
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
                                        const teamObj = teams.find(t => t._id === team._id);
                                        return (
                                            <div 
                                                key={team._id}
                                                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 text-left"
                                            >
                                                <div className={`text-2xl font-bold w-8 ${
                                                    index === 0 ? 'text-yellow-300' : 
                                                    index === 1 ? 'text-gray-300' : 
                                                    index === 2 ? 'text-orange-300' : 
                                                    'text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold overflow-hidden">
                                                    {teamObj?.logoUrl ? (
                                                        <img src={getTeamLogoUrl(teamObj)} alt={team.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{getTeamInitials(teamObj)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold">{team.name}</div>
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
                                            key={player._id || index}
                                            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold">{player.name}</div>
                                                <div className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded">
                                                    #{player.playerNumber}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="text-green-100">{getTeamName(player.team) || 'Unknown Team'}</div>
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

                    {/* Auction Stats */}
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
                        <button 
                            onClick={() => toggleStats('stats')} 
                            className="w-full bg-black bg-opacity-30 px-6 py-4 hover:bg-opacity-40 transition md:cursor-default"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span>📊</span>
                                    <span>Auction Stats</span>
                                </h3>
                                <svg 
                                    className={`w-6 h-6 transition-transform md:hidden ${expandedStats.stats ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </button>
                        <div className={`p-6 space-y-4 ${expandedStats.stats ? 'block' : 'hidden md:block'}`}>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-purple-100 text-sm mb-1">Total Players</div>
                                <div className="text-3xl font-bold">{players.length}</div>
                            </div>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-green-100 text-sm mb-1">Sold</div>
                                <div className="text-3xl font-bold text-green-200">{soldPlayers.length}</div>
                            </div>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-gray-200 text-sm mb-1">Unsold</div>
                                <div className="text-3xl font-bold text-gray-300">{unsoldPlayers.length}</div>
                            </div>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-yellow-100 text-sm mb-1">Pending</div>
                                <div className="text-3xl font-bold text-yellow-200">{pendingPlayers.length}</div>
                            </div>
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-blue-100 text-sm mb-1">Teams</div>
                                <div className="text-3xl font-bold text-blue-200">{teams.length}</div>
                            </div>
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
            </div>
        </div>
    );
}
