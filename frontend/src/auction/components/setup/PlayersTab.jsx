import React from 'react';
import toast from 'react-hot-toast';
import { getTeamBudgetForView, getTeamName } from '../../Utility';

export default function PlayersTab({
    players,
    playersCopy,
    teams,
    sets,
    playerListFilters,
    selectedPlayerListFilters,
    setSelectedPlayerListFilters,
    getMSExelForPlayerAdd,
    handlePlayerSelectChange,
    handlePlayerTeamAssign,
    handlePlayerEditBasePrice,
    handlePlayerSetAssign,
    handlePlayerPermenentRemove
}) {
    // Helper function to get set name
    const getSetName = (setId) => {
        const set = sets?.find(s => s._id === setId);
        return set ? set.name : null;
    };
    return (
        <div>
            {/* Action Buttons */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <button 
                    onClick={() => { getMSExelForPlayerAdd() }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                    <span>📤</span>
                    <span>Upload Players (Excel)</span>
                </button>
                <button 
                    className="flex-1 px-6 py-4 bg-white hover:bg-gray-50 border-2 border-green-600 text-green-600 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                    <span>➕</span>
                    <span>Add Player Manually</span>
                </button>
            </div>

            {/* Player Stats */}
            {playersCopy.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{playersCopy.length}</p>
                        <p className="text-sm text-gray-600">Total Players</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {playersCopy.filter(p => p.auctionStatus === 'sold').length}
                        </p>
                        <p className="text-sm text-gray-600">Sold</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-gray-600">
                            {playersCopy.filter(p => p.auctionStatus !== 'sold').length}
                        </p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                </div>
            )}

            {/* Selected Players Actions */}
            {players.filter(p => p.isSelected).length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <span className="font-semibold text-blue-900">
                            {players.filter(p => p.isSelected).length} player(s) selected
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { handlePlayerTeamAssign() }}
                                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                            >
                                Assign to Team
                            </button>
                            <button 
                                onClick={() => { handlePlayerEditBasePrice() }}
                                className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                            >
                                Edit Base Price
                            </button>
                            <button 
                                onClick={() => { handlePlayerSetAssign() }}
                                className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                            >
                                Add to Set
                            </button>
                            <button 
                                onClick={() => { handlePlayerPermenentRemove() }}
                                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1">
                    <select 
                        onChange={(e) => {
                            var val = e.target.value === "" ? null : e.target.value;
                            setSelectedPlayerListFilters((old) => ({ ...old, auctionSet: val }));
                        }}
                        value={selectedPlayerListFilters.auctionSet || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Sets</option>
                        {playerListFilters.auctionSet?.map((opt, index) => (
                            <option key={index} value={opt.value}>{opt.displayValue}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <select 
                        onChange={(e) => {
                            var val = e.target.value === "" ? null : e.target.value;
                            setSelectedPlayerListFilters((old) => ({ ...old, team: val }));
                        }}
                        value={selectedPlayerListFilters.team || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Teams</option>
                        {playerListFilters.team?.map((opt, index) => (
                            <option key={index} value={opt.value}>{opt.displayValue}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <select 
                        onChange={(e) => {
                            var val = e.target.value === "" ? null : e.target.value;
                            setSelectedPlayerListFilters((old) => ({ ...old, auctionStatus: val }));
                        }}
                        value={selectedPlayerListFilters.auctionStatus || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        {playerListFilters.auctionStatus?.map((opt, index) => (
                            <option key={index} value={opt.value}>{opt.displayValue}</option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={() => { setSelectedPlayerListFilters({ auctionStatus: null, team: null, auctionSet: null }) }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                    Clear
                </button>
            </div>

            {/* Players List - Modern Cards */}
            {players.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-600 text-lg mb-4">No players added yet</p>
                    <button 
                        onClick={() => { getMSExelForPlayerAdd() }}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                        Upload Players
                    </button>
                </div>
            ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {players.map((player, index) => {
                        const roleBadgeColor = 
                            player.role === 'Batsman' || player.role === 'batsman' ? 'bg-blue-100 text-blue-700' :
                            player.role === 'Bowler' || player.role === 'bowler' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700';
                        
                        const statusBadge = player.auctionStatus === 'sold' 
                            ? { bg: 'bg-green-100', text: 'text-green-700', label: `Sold: ${getTeamBudgetForView(player.soldPrice)}` }
                            : { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' };

                        return (
                            <div key={player._id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex items-center gap-4">
                                    {/* Selection Checkbox */}
                                    <div className="flex-shrink-0">
                                        <input 
                                            onChange={(e) => { handlePlayerSelectChange(player._id, e.target.checked) }}
                                            checked={player.isSelected || false}
                                            type="checkbox"
                                            className="w-5 h-5 bg-gray-100 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    {/* Player Number Badge */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                        {player.playerNumber || '#'}
                                    </div>
                                    
                                    {/* Player Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg text-left truncate">{player.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap text-left">
                                            {player.role && (
                                                <span className={`px-2 py-1 ${roleBadgeColor} rounded text-xs font-medium`}>
                                                    {player.role}
                                                </span>
                                            )}
                                            <span>Base: {getTeamBudgetForView(player.basePrice)}</span>
                                            {getSetName(player.auctionSet) && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                    📦 {getSetName(player.auctionSet)}
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} rounded text-xs font-semibold`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Team Badge (if sold) */}
                                    {player.team && player.auctionStatus === 'sold' && (() => {
                                        const team = teams.find(t => t._id === player.team);
                                        if (!team) return null;
                                        
                                        // Generate team initials
                                        const teamInitials = team.name
                                            .split(' ')
                                            .map(word => word[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 3);
                                        
                                        return (
                                            <div className="hidden md:flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    {team.logo && team.logo.url ? (
                                                        <div
                                                            className="w-8 h-8 rounded-full bg-cover bg-center border border-gray-300"
                                                            style={{ backgroundImage: `url(${team.logo.url})` }}
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {teamInitials}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-semibold text-gray-700">{team.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Select All / Deselect All */}
            {players.length > 0 && (
                <div className="mt-4 flex justify-center gap-3">
                    <button 
                        onClick={() => { handlePlayerSelectChange(null, true) }}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition text-sm"
                    >
                        Select All
                    </button>
                    <button 
                        onClick={() => { handlePlayerSelectChange(null, false) }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
                    >
                        Deselect All
                    </button>
                </div>
            )}
        </div>
    );
}

