const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');
require("dotenv").config();
const path = require('path');
const logFilePath = path.join(__dirname, 'socket_usage.log');

let allowedOrigin = process.env.ALLOWED_ORIGIN;
allowedOrigin = allowedOrigin.split(",");

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: allowedOrigin
    },
    path: '/socket/'
});

const auctionIO = new Server(server, {
    cors: {
        origin: allowedOrigin
    },
    path: '/auction/'
});

const port = 8081
server.listen(port, () => {
    console.info("Socket Server running on port ", port);
})

io.on('connection', (socket) => {
    const room = socket.handshake.query.slug;
    socket.join(room);

    //handle main sync event
    socket.on('room_message', (room, content) => {
        socket.to(room).emit('room_message', room, content);
    })

    socket.on('disconnect', () => {
        console.info("on disconnect ", socket.id);

        // const rooms = io.sockets.adapter.rooms;
        // rooms.forEach((room, roomId) => {
        //     console.log(`On disconnect Room ID: ${roomId} , sockets are : ` + Array.from(room).join(" , "));
        // });    
    })

    // const rooms = io.sockets.adapter.rooms;
    // rooms.forEach((room, roomId) => {
    //     console.log(`Room ID: ${roomId} , sockets are : ` + Array.from(room).join(" , "));
    // });
    socket.on("connect", () => {

    });

    socket.on('newPlayerBiddingUpdate', (player) => {
        socket.to(room).emit('playerBiddingUpdate', player);
    })

    console.info("on connect ", socket.id, room);
})


auctionIO.on('connection', (socket) => {
    const room = socket.handshake.query.slug;
    socket.join(room);

    socket.on('disconnect', () => {
        console.info("on disconnect ", socket.id);
    })

    socket.on("connect", () => {

    });

    socket.on('newPlayerBiddingUpdate', (player) => {
        // console.log("newPlayerBiddingUpdate", player)
        // auctionIO.sockets.emit('playerBiddingUpdate', player);
        socket.to(room).emit('playerBiddingUpdate', player);
    })
    socket.on('playerSoldUpdate', (message) => {
        // console.log("newPlayerBiddingUpdate", player)
        // auctionIO.sockets.emit('playerSoldUpdate', message);
        socket.to(room).emit('playerSoldUpdate', message);
    })

    console.log("on connect ", socket.id, room);
})


function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error("Error writing to log file", err);
    });
}

setInterval(() => {
    const mainIOConnections = io.engine.clientsCount;
    const auctionIOConnections = auctionIO.engine.clientsCount;

    const logMessage = `Total connections (Main IO): ${mainIOConnections}, Total connections (Auction IO): ${auctionIOConnections}`;

    logToFile(logMessage);    // Save log to file
}, 10000); // Logs every 5 seconds
