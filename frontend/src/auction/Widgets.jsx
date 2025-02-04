import { getProfilePicture, getTeamBudgetForView } from "./Utility"

export const getPlayerWidget = (player) => {
    if (player && Object.keys(player).length > 0) {
        return (
            <div className={`flex flex-row justify-center items-center sm:gap-1 md:gap-1 lg:gap-2  rounded sm:p-1 md:p-2 `}>

                <div className="bg-slate-200  sm:max-w-[200px] md:max-w-[300px] lg:max-w-[300px] rounded-full">
                    {getProfilePicture(player)}
                </div>

                <div className='flex flex-col sm:text-xs md:text-sm lg:text-lg text-start justify-start items-start '>
                    <div className='font-medium '>Player No. - {player.playerNumber}</div>
                    <div className='font-bold'>Name - {player.name}</div>
                    <div className='font-medium'>Role - {player.role}</div>
                    {player.bowlingHand && <div className='font-medium'>Bowl  -<span className='lowercase'> {player.bowlingHand} Arm - {player.bowlingType} </span></div>}
                    {player.battingHand && <div className='font-medium '>Bat - <span className='lowercase'> {player.battingHand} Arm - {player.battingPossition} order {player.battingType}</span> </div>}

                    <div className='font-medium'>Base Price - {getTeamBudgetForView(player.basePrice)}</div>
                </div>
            </div>
        )
    }
}