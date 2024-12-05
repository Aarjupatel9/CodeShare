const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost",
            "http://43.205.203.95"
        ],
    },
    path: '/socket/'
});

const auctionIO = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost",
            "http://43.205.203.95"
        ],
    },
    path: '/auction/'
});

const port = 8081
server.listen(port, () => {
    console.log("Server started at port ", port);
})

io.on('connection', (socket) => {
    const room = socket.handshake.query.slug;
    socket.join(room);

    //handle main sync event
    socket.on('room_message', (room, content) => {
        socket.to(room).emit('room_message', room, content);
    })

    socket.on('disconnect', () => {
        console.log("on disconnect ", socket.id);

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
        console.log("newPlayerBiddingUpdate", player)
        socket.to(room).emit('playerBiddingUpdate', player);
    })

    console.log("on connect ", socket.id, room);
})


auctionIO.on('connection', (socket) => {
    const room = socket.handshake.query.slug;
    socket.join(room);

    socket.on('disconnect', () => {
        console.log("on disconnect ", socket.id);
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
