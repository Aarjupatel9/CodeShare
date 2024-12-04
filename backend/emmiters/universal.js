const ee = require("events")

const uniEE = new ee.EventEmitter()

uniEE.on("event",(data)=>{
    // intercepting the event
    console.log("Emmitter data :",data)
})

module.exports={uniEE}