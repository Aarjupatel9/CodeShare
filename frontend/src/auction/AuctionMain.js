import React, { useEffect, useContext, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AuctionService from '../services/auctionService';
import toast from 'react-hot-toast';
import * as xlsx from 'xlsx';

export default function AuctionMain(props) {
    const [auction, setAuction] = useState({});
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);


    const { auctionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getAuctionData()
    }, [])
    const getAuctionData = () => {
        AuctionService.getAuctionDetails({ auctionId: auctionId }).then((res) => {
            console.log(res);
            if (res.auction) {
                setAuction(res.auction);
            }
            if (res.teams) {
                setTeams(res.teams);
            }
            if (res.players) {
                setPlayers(res.players);
            }
        }).catch((error) => {
            console.log(error);
            toast.error(error);
        });
    }

    useEffect(() => {
        // console.log("auction changed "+JSON.stringify(auction));
    }, [auction])

    const canStartAuction = () => {
        console.log("called");
        if (auction || auction.state == "setup") {
            AuctionService.updateAuction({ auction: { _id: auctionId, state: "running" } }).then((res) => {
                navigate(window.location.pathname + "/bidding");
            }).catch((err) => {
                toast.error(err);
                console.log(err);
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
    const openSetManagementBoard = () => {
        console.log(window.location.pathname);
        navigate(window.location.pathname + "/manageset");
    }

    return (
        <>
            <div className='flex flex-col w-full h-full p-1 text-sx gap-2'>
                <div className='header flex flex-row justify-around gap-2'>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openBiddingProcess() }}>Start/Continue Auction</div>
                    <div className='button rounded p-1 px-2 bg-gray-300 cursor-pointer' onClick={() => { openSetManagementBoard() }}>Manage Set</div>
                </div>
                <div className='flex flex-row gap-2 h-full max-h-full overflow-auto'>
                    <div className='TeamPannel flex flex-col gap-2 w-[50%] overflow-auto'>
                        <div key={"team_" + "title"} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                            <div>Team List</div>
                        </div>
                        {(teams && teams.length) > 0 ? teams.map((team, index) => {
                            return (<div key={"team_" + index} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                                <div>{team.name}</div>
                                <div className='text-xs'>Owner - {team.owner}</div>
                            </div>)
                        }) : <>
                            <div className=''>
                                No team added for the auction
                            </div>
                        </>}
                    </div>
                    <div className='PlayerPannel flex flex-col gap-2 w-[50%] overflow-auto '>
                        {(players && players.length) > 0 ? players.map((player, index) => {
                            <div key={"player_" + "title"} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                                <div>Player List</div>
                            </div>
                            return (<div key={"player_" + index} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                                <div>{player.name}</div>
                                <div className='text-xs'>Role - {player.role}  </div>
                                {/* <div className='text-xs'>Type - {player.role=="BATTER"&& player.battingHand}  </div> */}
                            </div>)
                        }) : <>
                            <div className='flex flex-col gap-2 w-[50%]'>
                                No player added for the auction
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </>
    )
}
