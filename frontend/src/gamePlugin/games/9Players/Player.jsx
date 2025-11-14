import React from 'react'
import { UserIcon } from './assets/svgs';


export default function Player(props) {
    const { name, isActive, color } = props.user1;
    const availablePieces = 9 - props.user1.retirePlayer;
 
    return (
        <div className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border-2 transition-all ${isActive ? 'border-blue-400 shadow-md' : 'border-gray-200'}`}>
            {/* Player Avatar */}
            <div className='flex-shrink-0'>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110 shadow-md shadow-blue-500/50' : 'scale-100'}`}>
                    <UserIcon color={color} />
                </div>
            </div>

            {/* Player Info - Horizontal Layout */}
            <div className='flex items-center gap-4 flex-grow'>
                <div className='flex-1'>
                    <h3 className={`font-bold text-sm capitalize ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                        {name}
                        {isActive && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Active</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Available:</span>
                        <span className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                            {availablePieces}
                        </span>
                    </div>
                </div>

                {/* Retired Pieces - Horizontal */}
                <div className='text-right'>
                    <p className="text-xs text-gray-500 mb-1">Retired</p>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-700">{props.user2.retirePlayer}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}