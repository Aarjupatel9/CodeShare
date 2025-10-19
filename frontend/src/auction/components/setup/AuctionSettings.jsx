import React from 'react';
import toast from 'react-hot-toast';
import AuctionService from '../../../services/auctionService';

export default function AuctionSettings({ 
    auction,
    auctionEditable, 
    setAuctionEditable, 
    setView,
    getAuctionData
}) {
    const handleSaveSettings = (e) => {
        e.preventDefault();
        const payload = {
            _id: auction._id,
            maxTeamMember: auctionEditable.maxTeamMember,
            minTeamMember: auctionEditable.minTeamMember,
            budgetPerTeam: auctionEditable.budgetPerTeam,
            auctionLiveEnabled: auctionEditable.auctionLiveEnabled
        };
        
        if (isNaN(payload.budgetPerTeam) || isNaN(payload.minTeamMember) || isNaN(payload.maxTeamMember)) {
            toast.error("Please enter valid numbers", { duration: 3000 });
            return;
        }
        
        AuctionService.updateAuction({ auction: payload })
            .then((res) => {
                toast.success("Auction settings updated successfully! 🎉", { duration: 3000 });
            })
            .catch((e) => {
                console.error(e);
                toast.error("Error updating settings: " + e.toString(), { duration: 3000 });
            })
            .finally(() => {
                getAuctionData();
                setView({ player: false, team: false, set: false, auctionDetails: false, exportTeamList: false });
            });
    };

    return (
        <div className='p-8'>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">⚙️ Auction Configuration</h2>
                <p className="text-gray-600">Configure budget, team size, and other auction settings</p>
            </div>

            {/* Settings Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Budget per Team */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <label htmlFor="budgetPerTeam" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                        💰 Budget per Team
                    </label>
                    <input
                        id="budgetPerTeam"
                        type="number"
                        placeholder="e.g., 100000000"
                        value={auctionEditable.budgetPerTeam}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                        onChange={(e) => {
                            setAuctionEditable((old) => {
                                old = structuredClone(old);
                                old.budgetPerTeam = e.target.value;
                                return old;
                            });
                        }}
                    />
                    <p className="text-xs text-gray-600 mt-2">Total budget allocated to each team</p>
                </div>

                {/* Live Link Toggle */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <label htmlFor="auctionLiveEnabled" className="block text-sm font-semibold text-gray-700 mb-3 text-left">
                        📡 Public Live View
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                id="auctionLiveEnabled"
                                type="checkbox"
                                checked={auctionEditable.auctionLiveEnabled}
                                className="sr-only peer"
                                onChange={(e) => {
                                    setAuctionEditable((old) => {
                                        old = structuredClone(old);
                                        old.auctionLiveEnabled = e.target.checked;
                                        return old;
                                    });
                                }}
                            />
                            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-lg font-semibold text-gray-900">
                                {auctionEditable.auctionLiveEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Allow public viewers to watch live bidding</p>
                </div>

                {/* Max Team Members */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <label htmlFor="maxTeamMember" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                        ⬆️ Maximum Players per Team
                    </label>
                    <input
                        id="maxTeamMember"
                        type="number"
                        placeholder="e.g., 11"
                        value={auctionEditable.maxTeamMember}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                        onChange={(e) => {
                            setAuctionEditable((old) => {
                                old = structuredClone(old);
                                old.maxTeamMember = e.target.value;
                                return old;
                            });
                        }}
                    />
                    <p className="text-xs text-gray-600 mt-2">Maximum squad size allowed</p>
                </div>

                {/* Min Team Members */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <label htmlFor="minTeamMember" className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                        ⬇️ Minimum Players per Team
                    </label>
                    <input
                        id="minTeamMember"
                        type="number"
                        placeholder="e.g., 8"
                        value={auctionEditable.minTeamMember}
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold"
                        onChange={(e) => {
                            setAuctionEditable((old) => {
                                old = structuredClone(old);
                                old.minTeamMember = e.target.value;
                                return old;
                            });
                        }}
                    />
                    <p className="text-xs text-gray-600 mt-2">Minimum squad size required</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
                <button
                    onClick={() => {
                        setView({ player: false, team: false, set: false, auctionDetails: false, exportTeamList: false });
                    }}
                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition shadow-sm flex items-center justify-center gap-2"
                >
                    <span>←</span>
                    <span>Cancel</span>
                </button>
                <button
                    onClick={handleSaveSettings}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                    <span>💾</span>
                    <span>Save Settings</span>
                </button>
            </div>
        </div>
    );
}

