require("dotenv").config();
require('./DB/conn');
const http = require('http');
const { Server } = require('socket.io');
const app = require("./src/app");

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
let allowedOrigin = process.env.ALLOWED_ORIGIN;
allowedOrigin = allowedOrigin ? allowedOrigin.split(",") : ['http://localhost:3000'];

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true
    },
    path: '/socket/'
});

// Document collaboration socket (only namespace we need)
io.on('connection', (socket) => {
    const room = socket.handshake.query.slug;
    socket.join(room);

    console.info("📡 Socket connected:", socket.id, "Room:", room);

    // Handle document sync event
    socket.on('room_message', (room, content) => {
        socket.to(room).emit('room_message', room, content);
    });

    // Document collaboration event (misnamed but used for docs)
    socket.on('newPlayerBiddingUpdate', (player) => {
        socket.to(room).emit('playerBiddingUpdate', player);
    });

    socket.on('disconnect', () => {
        console.info("📡 Socket disconnected:", socket.id);
    });
});

// Start server
server.listen(PORT, (err) => {
    if (err) {
        console.error("Error occurred while starting the server..." + err);
        return;
    }
    console.info(`🚀 Server started on PORT --> ${PORT}`);
    console.info(`📡 Socket.IO available at /socket/`);
});
