const port = 2000;
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer((req, res) => {
    console.log("helo")
    res.setHeader('Access-Control-Allow-Origin', '*');
});

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

server.listen(port, () => {
    console.log("Server started ");
})

io.on('connection', (socket) => {
    const room = socket.handshake.query.slug;
    console.log(room);

    socket.join(room);
    // console.log(socket)
    // socket.data.
    socket.on('connect', () => {
        console.log("connecting")
    })

    socket.on('room_message', (room,content) => {
        console.log("broad casting in room")
        socket.to(room).emit('room_message',room,content);
        // io.to().emit();
        // console.log(room);

        // socket.broadcast()
    })

    socket.on('disconnect', () => {
       
    })
    // console.log("connections ", socket);
})