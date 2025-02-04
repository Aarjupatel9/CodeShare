import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';
import { backArrowIcon } from '../assets/svgs';
import AuctionTeamView from './AuctionTeamView';
import { getTeamBudget } from './Utility';

export default function AuctionMain(props) {
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
            navigate("/t/auction");
        })
    }

    return (<div className='flex flex-col w-full h-full sm:text-xs md:text-lg lg:text-xl sm:gap-2 md:gap-2 lg:gap-4 sm:p-1 md:p-2 lg:p-4'>
        <div className='header flex flex-row justify-center gap-2 font-medium capitalize'>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openBiddingProcess() }}>Continue Bidding process</div>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openManagementBoard() }}>Auction Details</div>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openLiveUpdatePage() }}>Auction Live update</div>
            <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer ml-auto' onClick={() => { logoutFormAuction() }}>Logout</div>
        </div>
        <AuctionTeamView currentTeamPlayerMap={currentTeamPlayerMap} teamPlayerMap={teamPlayerMap} setCurrentTeamPlayerMap={setCurrentTeamPlayerMap} teams={teams} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />
    </div>)
}
