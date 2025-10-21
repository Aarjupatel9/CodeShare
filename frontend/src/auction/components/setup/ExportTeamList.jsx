import React from 'react';
import { getTeamBudgetForView, getTeamName } from '../../Utility';

export default function ExportTeamList({ 
    auction,
    teams,
    teamPlayerMap,
    setView,
    exportFinalTeamList
}) {
    return (
        <div className='p-8'>
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">📥 Export Final Teams</h2>
                    <p className="text-gray-600">Download complete team rosters as PDF</p>
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
                        onClick={() => { exportFinalTeamList("finalTeamListView") }} 
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold transition shadow-lg flex items-center gap-2"
                    >
                        <span>📥</span>
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>

            {/* Export Preview */}
            <div className='bg-white border-2 border-gray-200 rounded-xl p-6 shadow-inner'>
                <div id="finalTeamListView" className='flex flex-col gap-6 w-full'>
                    <div className="text-center border-b pb-4">
                        <div className="text-gray-900 text-3xl font-bold mb-2">
                            {auction.name}
                        </div>
                        <div className="text-gray-600 text-lg font-semibold">
                            Final Team Roster
                        </div>
                    </div>

                    <div className="flex flex-row flex-wrap gap-6 justify-center w-full">
                        {teamPlayerMap && teamPlayerMap.map((map, _mapIndex) => {
                            const teamBudgetUsed = map.players?.reduce((sum, p) => sum + (parseFloat(p.soldPrice) || 0), 0) || 0;
                            
                            return (
                                <div key={"exportTeamList_teamPlayerMap_" + _mapIndex} className='flex-1 min-w-[280px] max-w-[400px] flex-col bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg overflow-hidden'>
                                    {/* Team Header */}
                                    <div className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4'>
                                        <h3 className='text-xl font-bold text-center mb-2'>
                                            {getTeamName(map.team, teams)}
                                        </h3>
                                        <div className='flex justify-between text-sm'>
                                            <span className='font-medium'>Players: {map.players?.length || 0}</span>
                                            <span className='font-medium'>Spent: {getTeamBudgetForView(teamBudgetUsed)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Players Table */}
                                    <div className='p-4'>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className='border-b-2 border-blue-300'>
                                                    <th className='px-2 py-2 text-left font-bold text-gray-700'>No.</th>
                                                    <th className='px-2 py-2 text-left font-bold text-gray-700'>Player</th>
                                                    <th className='px-2 py-2 text-right font-bold text-gray-700'>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {map.players && map.players.map((p, _playerIndex) => {
                                                    return (
                                                        <tr key={"row-" + _mapIndex + "-" + _playerIndex} className="border-b border-blue-100 hover:bg-blue-100 transition">
                                                            <td className='px-2 py-2 font-semibold text-gray-700'>
                                                                {p.playerNumber}
                                                            </td>
                                                            <td className='px-2 py-2 text-gray-900 font-medium'>
                                                                {p.name}
                                                            </td>
                                                            <td className='px-2 py-2 text-right font-semibold text-blue-700'>
                                                                {getTeamBudgetForView(p.soldPrice)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

