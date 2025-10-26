import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import auctionApi from '../services/api/auctionApi';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { backArrowIcon } from '../assets/svgs';
import AuctionTeamView from './AuctionTeamView';
import { getTeamBudget, getTeamBudgetForView } from './Utility';
import { UserContext } from '../context/UserContext';
import AuctionNavbar from './components/AuctionNavbar';

export default function AuctionDashboard(props) {
    const { currUser, setCurrUser } = useContext(UserContext);
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [teamPlayerMap, setTeamPlayerMap] = useState([]);
    const [currentTeamPlayerMap, setCurrentTeamPlayerMap] = useState(null);
    const [viewTeam, setViewTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const { auctionId } = useParams();
    const navigate = useNavigate();

    // Real stats from API
    const [auctionStats, setAuctionStats] = useState({
        teamCount: 0,
        playerCount: 0,
        soldCount: 0,
        totalBudget: 0
    });
    
    // Viewer analytics
    const [viewerAnalytics, setViewerAnalytics] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        getAuctionData();
        fetchAuctionSummary();
    }, [])

    const fetchAuctionSummary = async () => {
        try {
            const res = await auctionApi.getAuctionSummary(auctionId);
            
            if (res.success) {
                const { stats } = res.data;
                setAuctionStats({
                    teamCount: stats.teams.total,
                    playerCount: stats.players.total,
                    soldCount: stats.players.sold,
                    totalBudget: stats.teams.totalBudget
                });
            }
        } catch (error) {
            console.error('Error fetching auction summary:', error);
        }
    };
    
    const fetchViewerAnalytics = async () => {
        if (analyticsLoading) return; // Prevent duplicate calls
        
        setAnalyticsLoading(true);
        try {
            const res = await auctionApi.getViewerAnalytics(auctionId, 'all');
            
            if (res.success && res.data.snapshots && res.data.snapshots.length > 0) {
                const snapshots = res.data.snapshots;
                
                // Calculate summary stats on client side
                const summary = {
                    totalSnapshots: snapshots.length,
                    overallPeak: Math.max(...snapshots.map(s => s.peakViewers || s.viewerCount)),
                    overallAvg: Math.round(
                        snapshots.reduce((sum, s) => sum + (s.avgViewers || s.viewerCount), 0) / snapshots.length
                    ),
                    overallMin: Math.min(...snapshots.map(s => s.minViewers || s.viewerCount)),
                    duration: 0
                };
                
                // Calculate duration (first to last snapshot)
                if (snapshots.length > 1) {
                    const firstSnapshot = new Date(snapshots[0].timestamp);
                    const lastSnapshot = new Date(snapshots[snapshots.length - 1].timestamp);
                    summary.duration = Math.round((lastSnapshot - firstSnapshot) / 60000); // minutes
                }
                
                setViewerAnalytics({
                    snapshots,
                    summary
                });
            } else {
                // No analytics data
                setViewerAnalytics(null);
            }
        } catch (error) {
            console.error('Error fetching viewer analytics:', error);
            setViewerAnalytics(null);
        } finally {
            setAnalyticsLoading(false);
        }
    };
    
    const toggleAnalytics = () => {
        const newShowState = !showAnalytics;
        setShowAnalytics(newShowState);
        
        // Fetch analytics only when expanding for the first time
        if (newShowState && !viewerAnalytics && !analyticsLoading) {
            fetchViewerAnalytics();
        }
    };

    const getAuctionData = () => {
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
            if (res.auction) {
                setAuction(res.auction);
            }
            if (res.teams) {
                setTeams(res.teams);
            }
            if (res.players) {
                setPlayers(res.players);
            }

            if (res.teams && res.players) {
                var data = [];
                var map = {};
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
            if (error == "TokenExpiredError" || error.toString().includes("TokenExpiredError") || error.toString().includes("token expired")) {
                toast.error("Your session has expired. Please login again to continue.");
                navigate("/auth/login");
            } else {
                toast.error(error.toString(), { duration: 3000 });
            }
        });
    }

    const canStartAuction = () => {
        if (auction || auction.state == "setup") {
            AuctionService.updateAuction({ auction: { _id: auctionId, state: "running" } }).then((res) => {
                navigate(window.location.pathname + "/bidding");
            }).catch((err) => {
                toast.error(err, { duration: 3000 });
                console.error(err);
            })
            return false;
        } else if (auction.state == "running") {
            return true;
        }
        return false;
    }

    const openBiddingProcess = () => {
        if (canStartAuction()) {
            navigate(window.location.pathname + "/bidding");
        }
    }
    const openManagementBoard = () => {
        navigate(window.location.pathname + "/manage");
    }

    const openLiveUpdatePage = () => {
        // Check if live view is enabled
        if (!auction?.auctionLiveEnabled) {
            toast.error('Live view is disabled! Please enable it in Auction Settings first.', {
                duration: 4000,
                icon: '🔒',
            });
            return;
        }
        navigate("/t/auction/" + auctionId + "/live");
    }

    const logoutFormAuction = () => {
        AuctionService.auctionLogout().then(() => {
            navigate(`/p/${currUser._id}/t/auction`);
        })
    }

    const handleLogout = () => {
        authService.logout()
          .then(() => {
            toast.success("Logged out successfully");
            setCurrUser(null);
            navigate('/auth/login');
          })
          .catch((error) => {
            toast.error("Failed to logout");
          });
    };

    // Get status badge
    const getStatusBadge = (state) => {
        switch(state) {
            case 'running':
                return { bg: 'bg-green-100', text: 'text-green-700', label: 'Running', pulse: true };
            case 'completed':
                return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', pulse: false };
            case 'setup':
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Setup', pulse: false };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown', pulse: false };
        }
    };

    const badge = auction?.state ? getStatusBadge(auction.state) : null;

    return (
        <div className='flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
            <AuctionNavbar 
                onNavigate={navigate}
                onLogout={handleLogout}
                auction={auction}
            />
            
            <div className='w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-6 bg-gradient-to-br from-blue-50 to-indigo-50'>
                {/* Auction Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-3xl font-bold text-gray-900">{auction?.name || 'Loading...'}</h1>
                                {badge && (
                                    <span className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-sm font-semibold flex items-center gap-1`}>
                                        {badge.pulse && <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>}
                                        {badge.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-left">Organizer: {currUser?.username || '-'} • Created: {auction?.createdAt ? new Date(auction.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                        <button 
                            onClick={() => {
                                // Check if live view is enabled
                                if (!auction?.auctionLiveEnabled) {
                                    toast.error('Live view is disabled! Enable it in Settings to share the link.', {
                                        duration: 4000,
                                        icon: '🔒',
                                    });
                                    return;
                                }
                                const liveUrl = `${window.location.origin}/t/auction/${auctionId}/live`;
                                navigator.clipboard.writeText(liveUrl);
                                toast.success('Live link copied to clipboard!');
                            }}
                            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center md:justify-start ${
                                auction?.auctionLiveEnabled 
                                    ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <span>{auction?.auctionLiveEnabled ? '🔗' : '🔒'}</span>
                            <span>Share Live Link</span>
                            {!auction?.auctionLiveEnabled && (
                                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded ml-1">Disabled</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100 hover:shadow-lg transition">
                        <div className="text-3xl mb-2">👥</div>
                        <p className="text-2xl font-bold text-gray-900">{auctionStats.teamCount}</p>
                        <p className="text-sm text-gray-600">Teams</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100 hover:shadow-lg transition">
                        <div className="text-3xl mb-2">🎯</div>
                        <p className="text-2xl font-bold text-gray-900">{auctionStats.playerCount}</p>
                        <p className="text-sm text-gray-600">Players</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100 hover:shadow-lg transition">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-2xl font-bold text-green-600">{auctionStats.soldCount}</p>
                        <p className="text-sm text-gray-600">Sold</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-5 text-center border border-gray-100 hover:shadow-lg transition">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-2xl font-bold text-gray-900">₹{getTeamBudgetForView(auctionStats.totalBudget)}</p>
                        <p className="text-sm text-gray-600">Total Budget</p>
                    </div>
                </div>

                {/* Viewer Analytics */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6 overflow-hidden">
                    <button 
                        onClick={toggleAnalytics}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span>📊</span>
                                <span>Viewer Analytics</span>
                            </h2>
                            {viewerAnalytics && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    {viewerAnalytics.summary.totalSnapshots} snapshots
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {analyticsLoading && (
                                <span className="text-sm text-gray-500">Loading...</span>
                            )}
                            <svg 
                                className={`w-6 h-6 transition-transform ${showAnalytics ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </button>
                    
                    {showAnalytics && (
                        <div className="px-6 pb-6">
                            {analyticsLoading ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">📊</div>
                                    <p className="text-gray-600">Loading analytics...</p>
                                </div>
                            ) : viewerAnalytics ? (
                                <>
                                    <div className="flex items-center justify-end mb-4">
                                        <button 
                                            onClick={fetchViewerAnalytics}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <span>🔄</span>
                                            <span>Refresh</span>
                                        </button>
                                    </div>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-blue-600">{viewerAnalytics.summary.overallPeak}</div>
                                <div className="text-sm text-gray-600 mt-1">Peak Viewers</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-600">{viewerAnalytics.summary.overallAvg}</div>
                                <div className="text-sm text-gray-600 mt-1">Avg Viewers</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-purple-600">{viewerAnalytics.summary.overallMin}</div>
                                <div className="text-sm text-gray-600 mt-1">Min Viewers</div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-gray-700">
                                    {Math.floor(viewerAnalytics.summary.duration / 60)}h {viewerAnalytics.summary.duration % 60}m
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Duration</div>
                            </div>
                        </div>
                        
                        {/* Simple Trend Display */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Viewer Trend</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {viewerAnalytics.snapshots.slice(-20).reverse().map((snapshot, index) => {
                                    const time = new Date(snapshot.timestamp).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                    const isRecent = index < 5;
                                    
                                    return (
                                        <div 
                                            key={index}
                                            className={`flex items-center justify-between p-2 rounded ${
                                                isRecent ? 'bg-blue-100' : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 font-mono w-16">{time}</span>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="h-2 rounded-full bg-blue-500"
                                                        style={{ width: `${Math.min((snapshot.viewerCount / viewerAnalytics.summary.overallPeak) * 200, 200)}px` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-600">
                                                    Avg: <span className="font-semibold">{snapshot.avgViewers}</span>
                                                </span>
                                                <span className="text-blue-600">
                                                    Peak: <span className="font-semibold">{snapshot.peakViewers}</span>
                                                </span>
                                                <span className="text-gray-700 font-bold">{snapshot.viewerCount}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-gray-500 mt-3 text-center">
                                Showing last {Math.min(viewerAnalytics.snapshots.length, 20)} snapshots (1-minute intervals)
                            </div>
                        </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">📊</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Analytics Data</h3>
                                    <p className="text-gray-600 mb-4">
                                        Enable "Viewer Analytics" in auction settings to start tracking
                                    </p>
                                    <button 
                                        onClick={() => openManagementBoard()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                    >
                                        Go to Settings →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Start/Continue Bidding */}
                    <div 
                        onClick={() => openBiddingProcess()} 
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        <div className="text-5xl mb-3">🎮</div>
                        <h3 className="text-2xl font-bold mb-2">
                            {auction?.state === 'setup' ? 'Start Bidding' : 'Continue Bidding'}
                        </h3>
                        <p className="text-green-100 text-sm mb-4">
                            {auction?.state === 'setup' ? 'Begin the live auction process' : 'Resume the live auction process'}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">{auctionStats.soldCount}/{auctionStats.playerCount} Players sold</span>
                            <span className="text-2xl">→</span>
                        </div>
                    </div>

                    {/* Auction Setup/Details */}
                    <div 
                        onClick={() => openManagementBoard()} 
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        <div className="text-5xl mb-3">⚙️</div>
                        <h3 className="text-2xl font-bold mb-2">Auction Setup</h3>
                        <p className="text-blue-100 text-sm mb-4">Manage teams, players, and sets</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Edit auction data</span>
                            <span className="text-2xl">→</span>
                        </div>
                    </div>

                    {/* Live View */}
                    <div 
                        onClick={() => openLiveUpdatePage()} 
                        className={`rounded-xl shadow-xl p-6 text-white transition-all transform ${
                            auction?.auctionLiveEnabled
                                ? 'bg-gradient-to-br from-purple-500 to-purple-600 cursor-pointer hover:shadow-2xl hover:scale-105'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                        }`}
                    >
                        <div className="text-5xl mb-3">{auction?.auctionLiveEnabled ? '📺' : '🔒'}</div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            Live View
                            {!auction?.auctionLiveEnabled && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">Disabled</span>
                            )}
                        </h3>
                        <p className={`text-sm mb-4 ${auction?.auctionLiveEnabled ? 'text-purple-100' : 'text-gray-200'}`}>
                            {auction?.auctionLiveEnabled ? 'Public spectator page' : 'Enable in Settings first'}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Share with viewers</span>
                            <span className="text-2xl">→</span>
                        </div>
                    </div>
                </div>

                {/* Teams Overview */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Teams Overview</h2>
                        <button 
                            onClick={() => openManagementBoard()}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Manage Teams →
                        </button>
                    </div>
                    
                    {teamPlayerMap && teamPlayerMap.length > 0 ? (
                        <AuctionTeamView 
                            currentTeamPlayerMap={currentTeamPlayerMap} 
                            teamPlayerMap={teamPlayerMap} 
                            setCurrentTeamPlayerMap={setCurrentTeamPlayerMap} 
                            teams={teams} 
                            selectedPlayer={selectedPlayer} 
                            setSelectedPlayer={setSelectedPlayer}
                            auction={auction}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Teams Yet</h3>
                            <p className="text-gray-600 mb-6">Add teams in the Auction Setup to see them here</p>
                            <button 
                                onClick={() => openManagementBoard()}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                            >
                                Go to Setup →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
