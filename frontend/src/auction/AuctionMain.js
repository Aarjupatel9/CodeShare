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

export default function AuctionMain(props) {
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

    useEffect(() => {
        getAuctionData()
    }, [])

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

    return (<div className='flex flex-col w-full h-full'>
        <AuctionNavbar 
            onNavigate={navigate}
            onLogout={handleLogout}
        />
        <div className='flex flex-col w-full h-full sm:text-xs md:text-lg lg:text-xl sm:gap-2 md:gap-2 lg:gap-4 sm:p-1 md:p-2 lg:p-4'>
        <div className='header flex flex-row justify-center gap-2 font-medium capitalize'>
            <div className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" onClick={() => { openBiddingProcess() }}>Continue Bidding process</div>
            <div className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" onClick={() => { openManagementBoard() }}>Auction Details</div>
            <div className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer" onClick={() => { openLiveUpdatePage() }}>Auction Live update</div>
            <div className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-200 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer ml-auto" onClick={() => { logoutFormAuction() }}>Logout</div>
        </div>
        <AuctionTeamView currentTeamPlayerMap={currentTeamPlayerMap} teamPlayerMap={teamPlayerMap} setCurrentTeamPlayerMap={setCurrentTeamPlayerMap} teams={teams} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />
        </div>
    </div>)
}
