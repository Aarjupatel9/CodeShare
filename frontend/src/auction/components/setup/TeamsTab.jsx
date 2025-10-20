import React from 'react';
import { getTeamBudgetForView } from '../../Utility';

export default function TeamsTab({ 
    teams, 
    playersCopy, 
    addTeam,
    editTeam,
    handleImageUpload, 
    handleTeamPermenentRemove 
}) {
    const getTeamLogo = (team) => {
        return team?.logoUrl || null;
    };
    return (
        <div>
            {/* Action Buttons */}
            <div className="mb-6">
                <button 
                    onClick={() => { addTeam() }}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                    <span>➕</span>
                    <span>Add Team Manually</span>
                </button>
            </div>

            {/* Teams List - Modern Cards */}
            {teams.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-600 text-lg mb-4">No teams added yet</p>
                    <button 
                        onClick={() => { addTeam() }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        Add Your First Team
                    </button>
                </div>
            ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {teams.map((team, index) => {
                        // Calculate player count for this team
                        const teamPlayerCount = playersCopy.filter(p => p.team === team._id).length;
                        
                        // Generate team initials
                        const teamInitials = team.name
                            .split(' ')
                            .map(word => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 3);
                        
                        return (
                            <div key={team._id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                {/* Team Logo */}
                                <label className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer flex-shrink-0">
                                    {getTeamLogo(team) ? (
                                        <img 
                                            src={getTeamLogo(team)} 
                                            alt={team.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-xl">
                                            {teamInitials}
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => { handleImageUpload(e, team) }}
                                    />
                                </label>
                                
                                {/* Team Info */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg text-left">{team.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 text-left">
                                        <span>Budget: {getTeamBudgetForView(team.budget)}</span>
                                        <span>•</span>
                                        <span>Players: {teamPlayerCount}</span>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => { editTeam(team) }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Edit team"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => { handleTeamPermenentRemove(team) }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete team"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

