"use strict";(self.webpackChunkcode_share=self.webpackChunkcode_share||[]).push([[259,472,43,201,391],{472:(e,l,o)=>{o.r(l),o.d(l,{default:()=>a});var i=o(43),t=o(424),r=o(772),s=o(579);const a=e=>{let{players:l,setPlayers:o}=e;const[a,n]=(0,i.useState)(r.initialState),[c,d]=(0,i.useState)(r.initialPlayerPositions),[v,p]=(0,i.useState)("initialize"),[x,m]=(0,i.useState)(!1),[f,u]=(0,i.useState)(-1),[y,b]=(0,i.useState)(!1);(0,i.useEffect)((()=>{9===l[0].placedPlayer&&9===l[1].placedPlayer&&p("start"),9!==l[0].retirePlayer&&9!==l[1].retirePlayer||p("end")}),[l]),(0,i.useEffect)((()=>{x&&(g(!1),w()),console.log("in use Effect : ",x)}),[x]);const h=()=>{b(!1),n((e=>e=e.map((e=>(e.isMovable&&(e.isMovable=!1),e.isSelectedForMove=!1,e)))))},g=e=>{var o=l[0].isActive?1:2;if(console.log("populatePosiblePlayerRemove : ",e,o),e)return void n((e=>e.map((e=>(e.isRemovable=!1,e)))));const i=(e=>{let l=[];for(let i=0;i<=6;i++){const t=e.filter((e=>e.row===i));for(let e=0;e<=t.length-3;e+=3)t[e].player===o&&t[e].player===t[e+1].player&&t[e].player===t[e+2].player&&(console.log("triplets found for row ",t),l.push(t[e],t[e+1],t[e+2]))}for(let i=0;i<=6;i++){const t=e.filter((e=>e.col===i));for(let e=0;e<=t.length-3;e+=3)t[e].player===o&&t[e].player===t[e+1].player&&t[e].player===t[e+2].player&&(console.log("triplets found for col ",t),l.push(t[e],t[e+1],t[e+2]))}return l})(a),t=a.filter((e=>e.player===o&&!i.includes(e)));console.log("Players that can be removed: ",t,i),n((e=>(e=structuredClone(e),t.forEach((l=>{e[l.index].isRemovable=!0})),e)))},w=()=>{o((e=>((e=structuredClone(e))[0].isActive=!e[0].isActive,e[1].isActive=!e[1].isActive,e)))},M=(e,i)=>{if(console.log("handlePlayerClick index : ",i,e,v,x,y),"end"!=v){if(x)return!0===e.isRemovable?(u(i),void(e=>{console.log("removeSpecificPlayer : ",e),n((l=>((l=structuredClone(l))[e].player=0,l))),d((l=>{l=structuredClone(l);for(var o=0;o<18;o++)console.log("removeSpecificPlayer setPlayerPositions : ",e,o),l[o].index===e&&(l[o].isRemoved=!0);return l})),o((e=>{e=structuredClone(e);for(var l=0;l<e.length;l++)e[l].isActive||(e[l].retirePlayer+=1);return e})),m(!1),g(!0),w()})(i)):void 0;if(!y||e.isMovable)if("initialize"===v){if(console.log("inside initialize"),e.player>0)return;u(i);var t=l[0].isActive?0:9;d((l=>{for(l=structuredClone(l),console.log("setPlayerPositions nextToInsert : ",t);l[t].isBind;)t++;return l[t].index=i,l[t].isBind=!0,l[t].top="".concat(100*e.row/6,"%"),l[t].left="".concat(100*e.col/6,"%"),console.log("setPlayerPositions : ",l),l})),n((e=>{var o=l[0].isActive?1:2;return(e=structuredClone(e))[i].player=o,e})),o((e=>{var o=l[0].isActive?0:1;return(e=structuredClone(e))[o].placedPlayer+=1,e})),w()}else"start"===v&&(console.log("inside start"),e.isMovable?(console.log("handlePlahyerClick start movable ",i,e),u(i),((e,o)=>{var i=a.findIndex((e=>e.isSelectedForMove));console.log("handlePlayerChange playerIndexToMove ",i,e,o,c),-1!==i?(n((e=>{const t=[...e];return t[i].player=0,l[0].isActive?t[o].player=1:t[o].player=2,t})),d((l=>{l=structuredClone(l);for(var t=0;t<18;t++)console.log("handlePlayerChange setPlayerPositions : ",o,t),l[t].index==i&&(l[t].top="".concat(100*e.row/6,"%"),l[t].left="".concat(100*e.col/6,"%"));return console.log("setPlayerPositions : ",l),l})),h(),w()):console.log("handlePlayerChange playerIndexToMove ",i,"returning")})(e,i)):1!==e.player&&2!==e.player||!l[e.player-1].isActive||(console.log("handlePlahyerClick start touch ",i,e),((e,l)=>{if(0!==e.player&&3!==e.player)if(e.isSelectedForMove)h();else{var o=r.edges[l].filter((e=>0===a[e].player));o&&o.length>0?(b(!0),n((e=>{e=structuredClone(e);for(var i=0;i<o.length;i++)e[o[i]].isMovable=!0;return e[l].isSelectedForMove=!0,e}))):console.log("Player is blocked")}})(e,i)))}};(0,i.useEffect)((()=>{var e=R();m(e),console.log("isAdvantage : ",e)}),[a]),(0,i.useEffect)((()=>{}),[l]);const R=()=>{for(let e=0;e<=6;e++){const l=a.filter((l=>l.row===e));for(let e=0;e<=l.length-3;e+=3)if(0!==l[e].player&&l[e].player===l[e+1].player&&l[e].player===l[e+2].player&&[l[e].index,l[e+1].index,l[e+2].index].includes(f))return!0}for(let e=0;e<=6;e++){const l=a.filter((l=>l.col===e));for(let e=0;e<=l.length-3;e+=3)if(0!==l[e].player&&l[e].player===l[e+1].player&&l[e].player===l[e+2].player&&[l[e].index,l[e+1].index,l[e+2].index].includes(f))return!0}return!1};return(0,i.useEffect)((()=>{console.log("playerState changed : ",a)}),[a]),(0,i.useEffect)((()=>{console.log("playerPositions changed : ",c)}),[c]),(0,s.jsxs)("div",{className:"flex flex-col mx-auto py-2 px-3 jsutify-center",children:[(0,s.jsxs)("div",{className:"relative sm:max-h-[270px] sm:max-w-[270px] sm:min-h-[270px] sm:min-w-[270px]  md:max-h-[600px] md:max-w-[600px] md:min-h-[500px] md:min-w-[500px] mx-auto ",children:[r.pattern.map(((e,l)=>((e,l)=>{var o="";return 3===l?(o=400/6+"%",(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"absolute left-0 h-px bg-black",style:{top:"".concat(100*l/6,"%"),width:"".concat(e[0],"%"),marginLeft:"0px"}},"h1-".concat(l)),(0,s.jsx)("div",{className:"absolute left-0 h-px bg-black",style:{top:"".concat(100*l/6,"%"),width:"".concat(e[0],"%"),marginLeft:o}},"h2-".concat(l,"-1"))]},"h1x-".concat(l))):(o=l<3?100*l/6+"%":100*(6-l)/6+"%",(0,s.jsx)("div",{className:"absolute left-0 h-px bg-black",style:{top:"".concat(100*l/6,"%"),width:"".concat(e[0],"%"),marginLeft:o}},"h-".concat(l)))})(e,l))),r.pattern.map(((e,l)=>((e,l)=>{var o="";return 3===l?(o=400/6+"%",(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"absolute top-0 w-px bg-black",style:{left:"".concat(100*l/6,"%"),height:"".concat(e[0],"%"),marginTop:"0px"}},"v1-".concat(l)),(0,s.jsx)("div",{className:"absolute top-0 w-px bg-black",style:{left:"".concat(100*l/6,"%"),height:"".concat(e[0],"%"),marginTop:o}},"v2-".concat(l,"-1"))]},"v1x-".concat(l))):(o=l<3?100*l/6+"%":100*(6-l)/6+"%",(0,s.jsx)("div",{className:"absolute top-0 w-px bg-black",style:{left:"".concat(100*l/6,"%"),height:"".concat(e[0],"%"),marginTop:o}},"v-".concat(l)))})(e,l))),a.map(((e,l)=>{var o="";switch(e.player){case 0:o="bg-slate-300";break;case 1:case 2:o="bg-transparent";break;case 3:o="bg-green-800";break;case 4:o="bg-red-600";break;default:o="bg-black"}return e.isRemovable&&0!==e.player&&(o="bg-red-600"),e.isMovable&&(o="bg-green-800"),(0,s.jsx)("div",{className:"absolute sm:w-[16px] md:w-[20px] sm:h-[16px] md:h-[20px] rounded-full cursor-pointer ".concat(o," \n                                transition-all duration-1000 ease-in-out"),style:{top:"".concat(100*e.row/6,"%"),left:"".concat(100*e.col/6,"%"),transform:"translate(-50%, -50%)",zIndex:100},onClick:()=>{M(e,l)}},"circle-".concat(e.row,"-").concat(e.col,"-").concat(l))})),c.map(((e,o)=>{var i=l[o>8?1:0].color;if(!e.isRemoved)return(0,s.jsx)("div",{className:"playersCircle sm:w-[16px] md:w-[20px] sm:h-[16px] md:h-[20px] absolute rounded-full cursor-pointer ".concat(i," \n                                    transition-all duration-1000 ease-in-out  ").concat(e.isBind&&a[e.index].isSelectedForMove?"rounded shadow-cyan-500/50 shadow-xl animate-bounce":"shadow-sm"," "),style:{top:"".concat(parseFloat(e.top),"%"),left:"".concat(parseFloat(e.left),"%"),transform:"translate(-50%, -50%)",zIndex:99}},"playerCircle-".concat(o))})),"end"==v&&(0,s.jsxs)("div",{className:"absolute rounded cursor-pointer font-bold text-xl bg-green-300 flex flex-col justify-around items-center",style:{width:"200px",height:"200px",top:"50%",left:"50%",transform:"translate(-50%, -50%)"},children:[(0,s.jsxs)("div",{children:[l[0].retirePlayer>l[1].retirePlayer?"Player 2":"Player 1"," Won "]}),(0,s.jsx)("div",{children:(0,s.jsx)("div",{className:"px-2 py-1 bg-green-600 rounded",onClick:()=>{},children:"Restart the Game"})})]},"win-div-container")]}),(0,s.jsxs)("div",{className:"flex justify-around content-around mt-10",children:[(0,s.jsx)(t.default,{user1:l[0],user2:l[1],possition:"left"}),(0,s.jsx)(t.default,{user1:l[1],user2:l[0],possition:"right"})]})]})}},259:(e,l,o)=>{o.r(l),o.d(l,{default:()=>s});var i=o(43),t=o(472),r=(o(424),o(579));function s(e){let{gameConfiguration:l}=e;const[o,s]=(0,i.useState)([{name:"player 1",isActive:!0,color:"bg-blue-500",placedPlayer:0,retirePlayer:0},{name:"player 2",isActive:!1,color:"bg-yellow-300",placedPlayer:0,retirePlayer:0}]);return(0,r.jsxs)("div",{className:"w-full h-full flex flex-col  px-1",children:[(0,r.jsxs)("div",{className:"font-bold text-2xl mb-2",children:[l&&l.displayName," "]}),(0,r.jsx)(t.default,{players:o,setPlayers:s})]})}},424:(e,l,o)=>{o.r(l),o.d(l,{default:()=>s});var i=o(43),t=o(201),r=o(579);function s(e){const{name:l,isActive:o,color:s}=e.user1,a=e.possition;return(0,i.useEffect)((()=>{}),[]),(0,r.jsxs)("div",{className:"Player flex ".concat("right"==a?"flex-row-reverse":"flex-row"," items-center justify-center"),children:[(0,r.jsxs)("div",{className:"flex flex-col content-center justify-center",children:[(0,r.jsx)("div",{className:"rounded shadow-cyan-500/50 ".concat(o?"shadow-xl animate-bounce":"shadow-sm"),children:(0,r.jsx)("div",{className:s,children:(0,r.jsx)(t.UserIcon,{color:s})})}),l]}),(0,r.jsx)("div",{className:"flex content-center justify-center mx-4 flex-row flex-wrap gap-1",children:Array.from({length:e.user2.retirePlayer},((e,l)=>l)).map(((l,o)=>(0,r.jsx)("div",{className:" rounded-full cursor-pointer "+e.user2.color,style:{width:"18px",height:"18px",transform:"translate(-50%, -50%)"}},"retirePlayer2-circle-".concat(o))))})]})}},201:(e,l,o)=>{o.r(l),o.d(l,{UserIcon:()=>t});var i=o(579);const t=e=>(0,i.jsx)("svg",{className:"w-16 h-16 text-gray-800 dark:text-white","aria-hidden":"true",xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",fill:"currentColor",viewBox:"0 0 24 24",children:(0,i.jsx)("path",{fillRule:"evenodd",d:"M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z",clipRule:"evenodd"})})},772:(e,l,o)=>{o.r(l),o.d(l,{edges:()=>s,initialPlayerPositions:()=>r,initialState:()=>t,pattern:()=>i});const i=[[100,0],[4/6*100,0],[2/6*100,0],[2/6*100,1],[2/6*100,0],[4/6*100,0],[100,0]],t=[{row:0,col:0,player:0,isSelectedForMove:!1,index:0,isRemovable:!1,isMovable:!1},{row:0,col:3,player:0,isSelectedForMove:!1,index:1,isRemovable:!1,isMovable:!1},{row:0,col:6,player:0,isSelectedForMove:!1,index:2,isRemovable:!1,isMovable:!1},{row:1,col:1,player:0,isSelectedForMove:!1,index:3,isRemovable:!1,isMovable:!1},{row:1,col:3,player:0,isSelectedForMove:!1,index:4,isRemovable:!1,isMovable:!1},{row:1,col:5,player:0,isSelectedForMove:!1,index:5,isRemovable:!1,isMovable:!1},{row:2,col:2,player:0,isSelectedForMove:!1,index:6,isRemovable:!1,isMovable:!1},{row:2,col:3,player:0,isSelectedForMove:!1,index:7,isRemovable:!1,isMovable:!1},{row:2,col:4,player:0,isSelectedForMove:!1,index:8,isRemovable:!1,isMovable:!1},{row:3,col:0,player:0,isSelectedForMove:!1,index:9,isRemovable:!1,isMovable:!1},{row:3,col:1,player:0,isSelectedForMove:!1,index:10,isRemovable:!1,isMovable:!1},{row:3,col:2,player:0,isSelectedForMove:!1,index:11,isRemovable:!1,isMovable:!1},{row:3,col:4,player:0,isSelectedForMove:!1,index:12,isRemovable:!1,isMovable:!1},{row:3,col:5,player:0,isSelectedForMove:!1,index:13,isRemovable:!1,isMovable:!1},{row:3,col:6,player:0,isSelectedForMove:!1,index:14,isRemovable:!1,isMovable:!1},{row:4,col:2,player:0,isSelectedForMove:!1,index:15,isRemovable:!1,isMovable:!1},{row:4,col:3,player:0,isSelectedForMove:!1,index:16,isRemovable:!1,isMovable:!1},{row:4,col:4,player:0,isSelectedForMove:!1,index:17,isRemovable:!1,isMovable:!1},{row:5,col:1,player:0,isSelectedForMove:!1,index:18,isRemovable:!1,isMovable:!1},{row:5,col:3,player:0,isSelectedForMove:!1,index:19,isRemovable:!1,isMovable:!1},{row:5,col:5,player:0,isSelectedForMove:!1,index:20,isRemovable:!1,isMovable:!1},{row:6,col:0,player:0,isSelectedForMove:!1,index:21,isRemovable:!1,isMovable:!1},{row:6,col:3,player:0,isSelectedForMove:!1,index:22,isRemovable:!1,isMovable:!1},{row:6,col:6,player:0,isSelectedForMove:!1,index:23,isRemovable:!1,isMovable:!1}],r=[{top:"10%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"18.67%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"27.34%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"36.01%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"44.68%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"53.35%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"62.02%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"70.69%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"79.36%",left:"-10%",index:0,isBind:!1,isRemoved:!1},{top:"10%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"18.67%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"27.34%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"36.01%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"44.68%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"53.35%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"62.02%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"70.69%",left:"110%",index:0,isBind:!1,isRemoved:!1},{top:"79.36%",left:"110%",index:0,isBind:!1,isRemoved:!1}],s=[[1,9],[0,2,4],[1,14],[4,10],[1,3,5,7],[4,13],[7,11],[4,6,8],[7,12],[0,10,21],[3,9,11,18],[6,10,15],[8,13,17],[5,12,14,20],[2,13,23],[11,16],[15,17,19],[12,16],[10,19],[16,18,20,22],[13,19],[9,22],[19,21,23],[14,22]]}}]);
//# sourceMappingURL=259.eb154138.chunk.js.map