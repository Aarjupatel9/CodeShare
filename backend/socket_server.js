const { Server } = require('socket.io');

const { uniEE } = require("../backend/emmiters/universal")

const attach_socket_server = (httpserver) => {
    const socketio = new Server(httpserver, {
        cors: {
            origin: '*', // Allowed origin(s)
            methods: ['GET', 'POST'],        // Allowed HTTP methods
            allowedHeaders: ['*'], // Additional headers if required
            credentials: true                // Allow credentials (cookies, authorization headers)
        }
    });

    const events = socketio.of('/events');

    // Middleware for authenticating JWT
    events.use((socket, next) => {
        const token = socket.handshake.headers.token;
        console.log("token : ", token)
        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        try {
            // const payload = jwt.verify(token, JWT_SECRET);
            //   socket.user = "user data after the verification"
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    events.on('connection', (socket) => {
        console.log('A user connected to the /events namespace');
        socket.on('event', (msg) => {
            console.log('event data from the client :', msg);
        });
        uniEE.on("event", (data) => {
            socket.broadcast.emit("event", data);
        })
    });
}

module.exports = { attach_socket_server }