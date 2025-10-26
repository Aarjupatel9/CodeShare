import React, { useState } from 'react';
import { getTeamBudgetForView, getTeamName } from '../../Utility';
import ExportOptionsModal from './ExportOptionsModal';

export default function ExportTeamList({ 
    auction,
    teams,
    teamPlayerMap,
    setView,
    exportFinalTeamList
}) {
    const [showExportModal, setShowExportModal] = useState(false);

    return (
        <div className='p-8'>
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">📥 Export Final Teams</h2>
                    <p className="text-gray-600">Download complete team rosters in multiple formats</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setView({ player: false, team: false, set: false, auctionDetails: false, exportTeamList: false });
                        }}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>Back</span>
                    </button>
                    <button 
                        onClick={() => setShowExportModal(true)} 
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition shadow-lg flex items-center gap-2"
                    >
                        <span>📤</span>
                        <span>Export Options</span>
                    </button>
                </div>
            </div>

            {/* Export Preview - PDF-Optimized Layout */}
            <div className='bg-white border-2 border-gray-200 rounded-xl p-6 shadow-inner'>
                <div id="finalTeamListView" className='w-full'>
                    {/* Header */}
                    <div className="flex justify-between items-center border-b-2 border-gray-300 pb-6 mb-8">
                        <div className="text-gray-900 text-4xl font-bold">
                            <span id="header-auction-name" style={{ whiteSpace: 'pre' }}>{auction.name}</span>
                        </div>
                        <div className="text-gray-600 text-sm font-semibold">
                            Generated on {new Date().toLocaleString()}
                        </div>
                    </div>

                    {/* Teams arranged in rows of 4 for better PDF pagination */}
                    <div className="space-y-6">
                        {teamPlayerMap && teamPlayerMap.reduce((rows, map, index) => {
                            const teamBudgetUsed = map.players?.reduce((sum, p) => sum + (parseFloat(p.soldPrice) || 0), 0) || 0;
                            
                            // Create new row every 4 teams
                            if (index % 4 === 0) {
                                rows.push([]);
                            }
                            
                            // Add team to current row
                            rows[rows.length - 1].push({
                                map,
                                teamBudgetUsed,
                                index
                            });
                            
                            return rows;
                        }, []).map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`} className={`page-break-inside-avoid ${rowIndex > 0 ? 'mt-8' : ''}`}>
                                {/* Row of 4 teams */}
                                <div className="grid grid-cols-4 gap-4">
                                    {row.map(({ map, teamBudgetUsed, index }) => (
                                        <div key={`team-${index}`} className="flex flex-col">
                                            {/* Team Card */}
                                            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-md overflow-hidden h-full'>
                                                {/* Team Header */}
                                                <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3'>
                                                    <h3 className='text-lg font-bold text-center mb-1'>
                                                        {getTeamName(map.team, teams)}
                                                    </h3>
                                                    <div className='text-center text-sm'>
                                                        <div className='font-semibold'>Players: {map.players?.length || 0}</div>
                                                        <div className='font-semibold'>Spent: {getTeamBudgetForView(teamBudgetUsed)}</div>
                                                    </div>
                                                </div>
                                                
                                                {/* Players List - Full List */}
                                                <div className='p-3'>
                                                    <div className="space-y-2">
                                                        {map.players && map.players.map((p, playerIndex) => (
                                                            <div key={`player-${index}-${playerIndex}`} className="flex justify-between items-center text-xs border-b border-blue-100 pb-1">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-semibold text-gray-700">{p.playerNumber}.</span>
                                                                    <span className="text-gray-900 font-medium truncate">{p.name}</span>
                                                                </div>
                                                                <span className="font-semibold text-blue-700">{getTeamBudgetForView(p.soldPrice)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Fill empty slots if row has less than 4 teams */}
                                    {/* {Array.from({ length: 3 - row.length }).map((_, emptyIndex) => (
                                        <div key={`empty-${rowIndex}-${emptyIndex}`} className="flex flex-col">
                                            <div className='bg-gray-100 rounded-lg border-2 border-gray-200 h-full min-h-[200px] flex items-center justify-center'>
                                                <span className="text-gray-400 text-sm">Empty Slot</span>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Options Modal */}
            <ExportOptionsModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                auction={auction}
                teams={teams}
                teamPlayerMap={teamPlayerMap}
            />
        </div>
    );
}

