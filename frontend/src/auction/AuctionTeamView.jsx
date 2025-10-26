import { backArrowIcon, defaultTeamLogo } from "../assets/svgs";
import { getTeamName, getTeamBudgetForView } from "./Utility";
import { getPlayerWidget } from "./Widgets";
import { getTeamLogoUrl } from "./utils/assetUtils";

export default function AuctionTeamView(props) {

    const { currentTeamPlayerMap, teamPlayerMap, setCurrentTeamPlayerMap, teams, selectedPlayer, setSelectedPlayer, auction } = props;

    const getBiddingView = (player) => {
        if (player && Object.keys(player).length > 0 && player.bidding.length > 0) {
            var x = structuredClone(player.bidding);
            x.reverse();
            return x.map((b, index) => {
                const isWinningBid = index === 0;
                return (
                    <div 
                        key={`bid_${index}`}
                        className={`rounded-xl p-3 md:p-4 transition flex-shrink-0 ${
                            isWinningBid 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                                : 'bg-white border-2 border-gray-200'
                        }`}
                    >
                        <div className='flex items-center justify-between gap-2'>
                            <div className='flex flex-col text-left flex-1 min-w-0'>
                                <span className={`font-semibold text-sm md:text-base truncate ${isWinningBid ? 'text-white' : 'text-gray-900'}`}>
                                    {getTeamName(b.team, teams)}
                                </span>
                                <span className={`text-xs ${isWinningBid ? 'text-green-100' : 'text-gray-500'}`}>
                                    Bid #{x.length - index}
                                </span>
                            </div>
                            <div className={`font-bold text-base md:text-lg whitespace-nowrap ${isWinningBid ? 'text-white' : 'text-gray-900'}`}>
                                {getTeamBudgetForView(b.price)}
                            </div>
                        </div>
                        {isWinningBid && (
                            <div className='mt-2 pt-2 border-t border-white border-opacity-20'>
                                <span className='text-xs text-green-100 font-medium'>✓ Winning Bid</span>
                            </div>
                        )}
                    </div>
                )
            })
        }
    }

    const displayTeamBoard = () => {
        setSelectedPlayer(null)
        setCurrentTeamPlayerMap(null)
    }
    const getTeamLogo = (teamId) => {
        let team = teams.find((t) => { return t._id == teamId });
        return getTeamLogoUrl(team);
    }


    // Get team color based on index (cycle through colors)
    const getTeamColor = (index) => {
        const colors = [
            { bg: 'bg-blue-600', border: 'border-blue-500', progress: 'bg-blue-600' },
            { bg: 'bg-yellow-500', border: 'border-yellow-500', progress: 'bg-yellow-500' },
            { bg: 'bg-red-600', border: 'border-red-500', progress: 'bg-red-600' },
            { bg: 'bg-green-600', border: 'border-green-500', progress: 'bg-green-600' },
            { bg: 'bg-purple-600', border: 'border-purple-500', progress: 'bg-purple-600' },
            { bg: 'bg-indigo-600', border: 'border-indigo-500', progress: 'bg-indigo-600' },
            { bg: 'bg-pink-600', border: 'border-pink-500', progress: 'bg-pink-600' },
            { bg: 'bg-orange-600', border: 'border-orange-500', progress: 'bg-orange-600' },
        ];
        return colors[index % colors.length];
    };

    // Get team initials for logo
    const getTeamInitials = (teamName) => {
        const words = teamName.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return teamName.substring(0, 2).toUpperCase();
    };

    return (
        <div className='flex flex-col h-auto w-full rounded gap-4 overflow-auto'>
            {!currentTeamPlayerMap && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
                    {(teamPlayerMap && teamPlayerMap.length) > 0 ? teamPlayerMap.map((map, index) => {
                        const teamData = teams.find(t => t._id === map.team);
                        const teamName = getTeamName(map.team, teams);
                        const colors = getTeamColor(index);
                        const budgetUsed = teamData?.budget ? teamData.budget - map.remainingBudget : 0;
                        const budgetPercentage = teamData?.budget ? Math.round((budgetUsed / teamData.budget) * 100) : 0;
                        const maxPlayers = auction.maxTeamMember;
                        
                        return (
                            <div 
                                onClick={() => { setCurrentTeamPlayerMap(map) }} 
                                key={"team_" + index}
                                className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition cursor-pointer"
                            >
                                {/* Team Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    {getTeamLogo(map.team) ? (
                                        <img
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                            src={getTeamLogo(map.team)}
                                            alt={teamName}
                                        />
                                    ) : (
                                        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                                            {getTeamInitials(teamName)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 text-left">
                                        <h3 className="font-bold text-gray-900 text-left">{teamName}</h3>
                                        <p className="text-xs text-gray-500 text-left">
                                            {teamData?.owner ? `Owner: ${teamData.owner}` : ''}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Team Stats */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Budget:</span>
                                        <span className="font-semibold text-gray-900">{getTeamBudgetForView(teamData?.budget || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-semibold text-green-600">{getTeamBudgetForView(map.remainingBudget)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Players:</span>
                                        <span className="font-semibold text-gray-900">{map.players.length}/{maxPlayers}</span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`${colors.progress} h-2 rounded-full`} 
                                            style={{ width: `${budgetPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-center">{budgetPercentage}% budget used</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className='col-span-full text-center py-8 text-gray-500 normal-case font-medium'>
                            No teams added in the auction
                        </div>
                    )}
                </div>
            )}
            {currentTeamPlayerMap && <div className='flex flex-col w-full h-full gap-4'>
                {/* Back Button - Visible on all screens */}
                <div className='w-full'>
                    <button
                        onClick={displayTeamBoard}
                        className='px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-2 font-medium text-gray-700 shadow-sm'
                    >
                        <span>←</span>
                        <span>Back to Teams</span>
                    </button>
                </div>

                {/* Main Content - Responsive Layout */}
                <div className='flex flex-col md:flex-row gap-4 w-full' style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    {/* Player List Sidebar */}
                    <div className='flex flex-col gap-3 w-full md:w-[35%] lg:w-[32%] xl:w-[28%]' style={{ maxHeight: 'calc(100vh - 250px)' }}>
                        {/* Header */}
                        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg flex-shrink-0'>
                            <div className='flex items-center justify-between'>
                                <h3 className='font-bold text-base md:text-lg text-left'>Player List</h3>
                                <span className='px-2 md:px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs md:text-sm font-semibold'>
                                    {currentTeamPlayerMap.players.length}
                                </span>
                            </div>
                            <p className='text-blue-100 text-xs md:text-sm mt-1 text-left truncate'>
                                {getTeamName(currentTeamPlayerMap.team, teams)}
                            </p>
                        </div>

                        {/* Player Cards - Scrollable */}
                        <div className='flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1 custom-scrollbar'>
                            {(currentTeamPlayerMap.players.length) > 0 ? currentTeamPlayerMap.players.map((player, index) => {
                                const isSelected = selectedPlayer?._id === player._id;
                                return (
                                    <div 
                                        onClick={() => { setSelectedPlayer(player) }} 
                                        key={"player_" + index} 
                                        className={`flex flex-col p-3 md:p-4 rounded-xl cursor-pointer transition border-2 flex-shrink-0 ${
                                            isSelected 
                                                ? 'bg-blue-50 border-blue-500 shadow-md' 
                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className='font-semibold text-sm md:text-base text-gray-900 text-left truncate'>{player.name}</div>
                                        <div className='flex flex-wrap items-center gap-2 mt-2'>
                                            <span className='text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium whitespace-nowrap'>
                                                {player.role}
                                            </span>
                                            <span className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium whitespace-nowrap'>
                                                {getTeamBudgetForView(player.soldPrice)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className='flex flex-col items-center justify-center py-8 md:py-12 bg-white rounded-xl border-2 border-dashed border-gray-300'>
                                    <div className='text-3xl md:text-4xl mb-2'>👥</div>
                                    <p className='text-gray-500 font-medium text-sm md:text-base'>Team has no players</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Player Details Section */}
                    <div className='flex flex-col gap-3 w-full md:w-[65%] lg:w-[68%] xl:w-[72%]' style={{ maxHeight: 'calc(100vh - 250px)' }}>
                        {/* Header */}
                        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg flex-shrink-0'>
                            <h3 className='font-bold text-base md:text-lg text-left'>Player Details</h3>
                            {selectedPlayer && (
                                <p className='text-indigo-100 text-xs md:text-sm mt-1 text-left truncate'>
                                    Viewing {selectedPlayer.name}'s profile
                                </p>
                            )}
                        </div>

                        {/* Player Content - Scrollable */}
                        <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar'>
                            {selectedPlayer ? (
                                <div className='flex flex-col xl:flex-row gap-4 pb-2'>
                                    {/* Player Profile Card */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200 shadow-sm'>
                                            <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
                                                {/* Player Image/Icon */}
                                                <div className='flex-shrink-0 mx-auto md:mx-0'>
                                                    <div className='w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-lg'>
                                                        {selectedPlayer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>

                                                {/* Player Info */}
                                                <div className='flex-1 min-w-0 space-y-4'>
                                                    {/* Name & Number */}
                                                    <div>
                                                        <h2 className='text-xl md:text-2xl font-bold text-gray-900 text-left truncate'>{selectedPlayer.name}</h2>
                                                        <p className='text-sm text-gray-500 text-left mt-1'>Player #{selectedPlayer.playerNumber || 'N/A'}</p>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className='grid grid-cols-2 gap-3'>
                                                        <div className='bg-blue-50 rounded-lg p-3'>
                                                            <p className='text-xs text-blue-600 font-medium text-left'>Role</p>
                                                            <p className='text-sm md:text-base font-bold text-blue-900 text-left mt-1'>{selectedPlayer.role || 'N/A'}</p>
                                                        </div>
                                                        <div className='bg-green-50 rounded-lg p-3'>
                                                            <p className='text-xs text-green-600 font-medium text-left'>Sold Price</p>
                                                            <p className='text-sm md:text-base font-bold text-green-900 text-left mt-1'>{getTeamBudgetForView(selectedPlayer.soldPrice)}</p>
                                                        </div>
                                                        <div className='bg-purple-50 rounded-lg p-3'>
                                                            <p className='text-xs text-purple-600 font-medium text-left'>Base Price</p>
                                                            <p className='text-sm md:text-base font-bold text-purple-900 text-left mt-1'>{getTeamBudgetForView(selectedPlayer.basePrice)}</p>
                                                        </div>
                                                        <div className='bg-orange-50 rounded-lg p-3'>
                                                            <p className='text-xs text-orange-600 font-medium text-left'>Status</p>
                                                            <p className='text-sm md:text-base font-bold text-orange-900 text-left mt-1 capitalize'>{selectedPlayer.auctionStatus || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Team Info */}
                                                    <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3'>
                                                        <p className='text-xs text-gray-600 font-medium text-left'>Team</p>
                                                        <p className='text-sm md:text-base font-bold text-gray-900 text-left mt-1'>
                                                            {getTeamName(selectedPlayer.team, teams) || 'Not Assigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bidding History */}
                                    {(selectedPlayer.bidding && selectedPlayer.bidding.length > 0) && (
                                        <div className='xl:w-[280px] 2xl:w-[320px] w-full flex flex-col gap-2 xl:sticky xl:top-0 xl:self-start' style={{ maxHeight: 'calc(100vh - 320px)' }}>
                                            <div className='bg-white rounded-xl p-3 md:p-4 border-2 border-gray-200 shadow-sm flex-shrink-0'>
                                                <h4 className='font-semibold text-sm md:text-base text-gray-900 text-left'>Bidding History</h4>
                                                <p className='text-xs text-gray-500 mt-1 text-left'>
                                                    {selectedPlayer.bidding.length} bid{selectedPlayer.bidding.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className='flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1 custom-scrollbar'>
                                                {getBiddingView(selectedPlayer)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center h-full min-h-[300px] bg-white rounded-xl border-2 border-dashed border-gray-300'>
                                    <div className='text-4xl md:text-5xl mb-3'>🏏</div>
                                    <p className='text-gray-900 font-semibold text-base md:text-lg mb-1'>Select a Player</p>
                                    <p className='text-gray-500 text-xs md:text-sm text-center px-4'>Click on a player to view their details and bidding history</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>}
        </div>

    )
}
