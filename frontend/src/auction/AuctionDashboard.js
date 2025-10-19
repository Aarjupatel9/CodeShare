import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { backArrowIcon } from '../assets/svgs';
import AuctionTeamView from './AuctionTeamView';
import { getTeamBudget } from './Utility';
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

    // Calculate quick stats (mock for now, TODO: get from API)
    const [auctionStats, setAuctionStats] = useState({
        teamCount: 0,
        playerCount: 0,
        soldCount: 0,
        totalBudget: 0
    });

    useEffect(() => {
        getAuctionData()
    }, [])

    // Update stats when data changes
    useEffect(() => {
        if (teams && players) {
            const soldCount = players.filter(p => p.auctionStatus === 'sold').length;
            const totalBudget = teams.reduce((sum, t) => sum + (t.budget || 0), 0);
            
            setAuctionStats({
                teamCount: teams.length,
                playerCount: players.length,
                soldCount,
                totalBudget
            });
        }
    }, [teams, players]);

    const getAuctionData = () => {
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
            console.info("auction details", res);
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
            if (error == "TokenExpiredError") {
                navigate("/auth/login")
            }
            toast.error(error, { duration: 3000 });
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
            />
            
            <div className='max-w-7xl mx-auto px-4 py-6 w-full'>
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
                            <p className="text-gray-600">Organizer: {currUser?.username || 'You'} • Created: {auction?.createdAt ? new Date(auction.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                        <button 
                            onClick={() => {
                                const liveUrl = `${window.location.origin}/t/auction/${auctionId}/live`;
                                navigator.clipboard.writeText(liveUrl);
                                toast.success('Live link copied to clipboard!');
                            }}
                            className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition flex items-center gap-2 justify-center md:justify-start"
                        >
                            <span>🔗</span>
                            <span>Share Live Link</span>
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
                        <p className="text-2xl font-bold text-gray-900">₹{auctionStats.totalBudget}Cr</p>
                        <p className="text-sm text-gray-600">Total Budget</p>
                    </div>
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
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        <div className="text-5xl mb-3">📺</div>
                        <h3 className="text-2xl font-bold mb-2">Live View</h3>
                        <p className="text-purple-100 text-sm mb-4">Public spectator page</p>
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
