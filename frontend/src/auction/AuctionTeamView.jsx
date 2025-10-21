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
                return (
                    <div className={`${index == 0 ? "bg-green-400" : "bg-slate-300"} flex flex-row justify-center    rounded p-2 `}>
                        <div >
                            {getTeamName(b.team, teams)} -  {getTeamBudgetForView(b.price)}
                        </div>
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
            {currentTeamPlayerMap && <div className='flex flex-row flex-wrap gap-2 w-full h-full overflow-auto'>
                <div className='PlayerPannel flex flex-col gap-2 lg:w-[30%] sm:w-[100%] md:w-[30%] h-full overflow-auto'>
                    <div key={"player_" + "title"} className='flex flex-col items-start bg-slate-400 p-2 rounded'>
                        <div className='font-bold '>Player List</div>
                    </div>
                    <div className='flex flex-col gap-2 overflow-auto'>
                        {(currentTeamPlayerMap.players.length) > 0 ? currentTeamPlayerMap.players.map((player, index) => {
                            return (
                                <div onClick={() => { setSelectedPlayer(player) }} key={"player_" + index} className='flex flex-col items-start bg-gray-200 p-2 rounded'>
                                    <div className='font-medium '>{player.name}</div>
                                    <div className='text-xs'>Role - {player.role}  </div>
                                    <div className='text-xs'>Sold - {getTeamBudgetForView(player.soldPrice)}  </div>
                                </div>)
                        }) : <div className='flex flex-col w-full mt-5 justify-center normal-case font-medium gap-2 w-[50%]'>
                            Team has no player
                        </div>}
                    </div>
                </div>
                <div className='PlayerPannel flex flex-col gap-2 lg:w-[69%] sm:w-[100%] md:w-[68%]  h-full overflow-auto'>
                    <div key={"player_" + "title"} className='flex flex-col items-start bg-slate-400 p-2 rounded'>
                        <div className='font-bold '>Player Details</div>
                    </div>
                    {selectedPlayer ? <div className='flex flex-row flex-wrap h-full gap-1 justify-center overflow-auto'>
                        <div className='PlayerProfile flex flex-col lg:w-[80%] lgxl:w-[50%] sm:w-[100%] md:w-[100%]'>
                            {getPlayerWidget(selectedPlayer)}
                        </div>
                        <div className='PlayerProfile flex flex-col lg:w-[50%] sm:w-[100%] md:w-[100%] h-full flex-grow max-w-[400px] gap-[1px] overflow-auto'>
                            {(selectedPlayer.bidding && selectedPlayer.bidding.length > 0) && getBiddingView(selectedPlayer)}
                        </div>
                    </div> : <div className='flex flex-col w-full mt-5 justify-center normal-case font-medium gap-2 w-[50%]'>
                        Select player to view bidding history
                    </div>}
                </div>
            </div>}
        </div>

    )
}
