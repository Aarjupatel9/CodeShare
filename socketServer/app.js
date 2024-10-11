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
    console.log("on connect ", socket.id, room);
})