require("dotenv").config();
require('./DB/conn');
const { createServer } = require('node:http');
const {attach_socket_server} = require("./socket_server")

const PORT = process.env.PORT || 8080;
const app = require("./src/app");

const server = createServer(app);

attach_socket_server(server)

server.listen(PORT, (err) => {
    if (err) {
        console.log("Error occurred while starting the server..." + err);
        return
    }
    console.log(`server started on PORT --> ${PORT}`);
})

