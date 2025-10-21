import React from 'react';

export default function SetsTab({ sets, playersCopy, createNewAuctionSet, handleSetPermenentRemove }) {
    return (
        <div>
            {/* Action Button */}
            <div className="mb-6">
                <button 
                    onClick={() => { createNewAuctionSet() }}
                    className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                    <span>➕</span>
                    <span>Create New Set</span>
                </button>
            </div>

            {/* Sets List - Modern Cards */}
            {sets.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-600 text-lg mb-4">No auction sets created yet</p>
                    <button 
                        onClick={() => { createNewAuctionSet() }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
                    >
                        Create Your First Set
                    </button>
                </div>
            ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {sets.map((set, index) => {
                        // Calculate player counts for this set (INCLUDING unsold)
                        const setPlayers = playersCopy.filter(p => p.auctionSet === set._id);
                        const totalPlayers = setPlayers.length;
                        const soldPlayers = setPlayers.filter(p => p.auctionStatus === 'sold').length;
                        const unsoldPlayers = setPlayers.filter(p => p.auctionStatus === 'unsold').length;
                        const completedPlayers = soldPlayers + unsoldPlayers; // Both sold and unsold are processed
                        const pendingPlayers = totalPlayers - completedPlayers;
                        const progressPercent = totalPlayers > 0 ? Math.round((completedPlayers / totalPlayers) * 100) : 0;
                        
                        // Determine status badge (with completed state)
                        const isCompleted = set.state === 'completed' || (totalPlayers > 0 && pendingPlayers === 0);
                        const isActive = set.state === 'active' || set.state === 'running';
                        const statusBadge = isCompleted
                            ? { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed', icon: '🎉' }
                            : isActive 
                                ? { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: '✅' }
                                : { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending', icon: '⏳' };

                        return (
                            <div key={set._id || index} className={`bg-white rounded-xl p-5 ${isActive ? 'border-2 border-green-500' : 'border border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-gray-900 text-xl text-left">{set.name}</h3>
                                        <span className={`px-3 py-1 ${statusBadge.bg} ${statusBadge.text} rounded-full text-xs font-semibold flex items-center gap-1`}>
                                            <span>{statusBadge.icon}</span>
                                            <span>{statusBadge.label}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { handleSetPermenentRemove(set) }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete set"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                    <span>🎯 {totalPlayers} Players</span>
                                    <span>✅ {soldPlayers} Sold</span>
                                    <span>❌ {unsoldPlayers} Unsold</span>
                                    <span>⏳ {pendingPlayers} Pending</span>
                                </div>
                                
                                {totalPlayers > 0 && (
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full transition-all" 
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{progressPercent}% complete</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

