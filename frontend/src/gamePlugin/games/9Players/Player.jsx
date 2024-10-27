import React, { useEffect } from 'react'
import { UserIcon } from './assets/svgs';


export default function Player(props) {
    const { name, isActive, color, } = props.user1;
    const possition = props.possition;
    useEffect(() => {
        // console.log("____", Array.from({ length: props.user2.retirePlayer }, (_, index) => index), props.user2.retirePlayer, possition)
    }, [])
    return (
        <div className={`Player flex ${possition == "right" ? "flex-row-reverse" : "flex-row"} items-center justify-center`}>
            <div className='flex flex-col content-center justify-center'>
                <div className={`rounded shadow-cyan-500/50 ${isActive ? "shadow-xl animate-bounce" : "shadow-sm"}`}>
                    <div className={color}>
                        <UserIcon color={color} />
                    </div>
                </div>
                {name}
            </div>
            <div className={`flex content-center justify-center mx-4 flex-row flex-wrap gap-1`}>
                {Array.from({ length: props.user2.retirePlayer }, (_, index) => index).map((_, index) => {
                    return (<div
                        key={`retirePlayer2-circle-${index}`}
                        className={` rounded-full cursor-pointer ` + props.user2.color}
                        style={{
                            width: "18px",
                            height: "18px",
                            transform: "translate(-50%, -50%)"
                        }}
                    ></div>)
                })}
            </div>
        </div>
    )
}