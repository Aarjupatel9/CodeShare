import { backArrowIcon, defaultTeamLogo } from "../assets/svgs";
import { getTeamName, getTeamBudgetForView } from "./Utility";
import { getPlayerWidget } from "./Widgets";

export default function AuctionTeamView(props) {

    const { currentTeamPlayerMap, teamPlayerMap, setCurrentTeamPlayerMap, teams, selectedPlayer, setSelectedPlayer } = props;

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
        if (team && team.logo && team.logo.url && team.logo.key) {
            try {
                const url = new URL(team.logo.url);
                const originalHostname = url.hostname; // e.g., codeshare.public-images.s3.ap-south-1.amazonaws.com
                // Remove the bucket name from the hostname
                const correctedHostname = originalHostname.replace(`${team.logo.bucket}.`, ""); // Removes "codeshare.public-images."
                // Construct the new URL
                return `https://${correctedHostname}/${team.logo.bucket}/${team.logo.key}`;

            } catch (error) {
                console.error("Error processing logo URL:", error);
                return null;
            }
        }
    }


    return (
        <div className='flex flex-col h-auto h-full rounded gap-2 overflow-auto'>
            <div className='flex flex-row justify-center p-2 bg-slate-500 font-bold uppercase'>
                {currentTeamPlayerMap && <div onClick={() => { displayTeamBoard() }} className='absolute left-5 cursor-pointer'>
                    {backArrowIcon}
                </div>}
                {currentTeamPlayerMap ? getTeamName(currentTeamPlayerMap.team, teams) : "Teams"}
            </div>

            {!currentTeamPlayerMap && <div className='flex flex-row gap-2 w-full h-auto max-h-full flex-wrap mx-auto'>
                {(teamPlayerMap && teamPlayerMap.length) > 0 ? teamPlayerMap.map((map, index) => {
                    return (<div onClick={() => { setCurrentTeamPlayerMap(map) }} key={"team_" + index}
                        className={`flex lg:w-[32.7%] md:w-[49%] sm:w-[100%]  gap-4 p-4 flex-row items-start bg-gray-200 cursor-pointer rounded-lg  ${currentTeamPlayerMap && currentTeamPlayerMap.team == map.team ? "bg-gray-400" : "bg-gray-200"}`}>
                        <div className="w-24 h-24 relative flex flex-col items-center">
                            <label className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer">
                                {
                                    getTeamLogo(map.team) ? (
                                        <img
                                            className="w-full h-full bg-cover bg-center"
                                            src={getTeamLogo(map.team)}
                                            alt="logo"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            {defaultTeamLogo}
                                        </div>
                                    )
                                }
                            </label>
                        </div>
                        {/* <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-dark">
                            <span className="flex ">
                                {getTeamLogo(getTeamName(map.team, teams))}
                            </span>
                        </div> */}
                        <div className='flex flex-col gap-2 flex-grow flex-start'>
                            <div className='text-lg font-bold text-center'>{getTeamName(map.team, teams)}</div>
                            <div className='text-sm font-medium text-center'>Total player - {map.players.length}</div>
                            <div className='text-sm font-medium text-center'>Remaining Budgert - {getTeamBudgetForView(map.remainingBudget)}</div>
                        </div>
                    </div>)
                }) : <>
                    <div className='normal-case font-medium'>
                        No team added in the auction
                    </div>
                </>}
            </div>}
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
