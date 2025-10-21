const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');
const axios = require('axios');
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

const port = 8081;

// Viewer tracking
const viewerCounts = {}; // { auctionId: count }
const peakViewers = {}; // { auctionId: peak }
const currentMinuteStats = {}; // { auctionId: { samples: [], min, max, sum } }

server.listen(port, () => {
    console.info("🚀 Socket Server running on port ", port);
    console.info("📡 Main IO: /socket/");
    console.info("📡 Auction IO: /auction/");
    console.info("📊 Viewer analytics: Enabled");
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
    const auctionId = room?.replace('auction-', '');
    
    socket.join(room);

    if (auctionId) {
        // Initialize viewer count if not exists
        if (!viewerCounts[auctionId]) {
            viewerCounts[auctionId] = 0;
        }
        
        // Increment viewer count
        viewerCounts[auctionId]++;
        
        // Update peak
        if (!peakViewers[auctionId] || viewerCounts[auctionId] > peakViewers[auctionId]) {
            peakViewers[auctionId] = viewerCounts[auctionId];
        }
        
        console.log(`✅ Viewer joined auction ${auctionId}. Total viewers: ${viewerCounts[auctionId]}`);
        
        // Broadcast updated viewer count to all clients in this room
        auctionIO.to(room).emit('viewerCountUpdate', viewerCounts[auctionId]);
    }

    socket.on('disconnect', () => {
        console.info("on disconnect ", socket.id);
        
        if (auctionId && viewerCounts[auctionId]) {
            viewerCounts[auctionId]--;
            if (viewerCounts[auctionId] < 0) viewerCounts[auctionId] = 0;
            
            console.log(`❌ Viewer left auction ${auctionId}. Total viewers: ${viewerCounts[auctionId]}`);
            
            // Broadcast updated count
            auctionIO.to(room).emit('viewerCountUpdate', viewerCounts[auctionId]);
        }
    })

    socket.on("connect", () => {

    });

    socket.on('newPlayerBiddingUpdate', (player) => {
        socket.to(room).emit('playerBiddingUpdate', player);
    })
    
    socket.on('playerSoldUpdate', (message) => {
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

// Sample viewer count every 5 seconds (in memory only)
setInterval(() => {
    for (const [auctionId, count] of Object.entries(viewerCounts)) {
        if (count > 0 || currentMinuteStats[auctionId]) {
            if (!currentMinuteStats[auctionId]) {
                currentMinuteStats[auctionId] = {
                    samples: [],
                    min: count,
                    max: count,
                    sum: 0
                };
            }
            
            currentMinuteStats[auctionId].samples.push(count);
            currentMinuteStats[auctionId].min = Math.min(currentMinuteStats[auctionId].min, count);
            currentMinuteStats[auctionId].max = Math.max(currentMinuteStats[auctionId].max, count);
            currentMinuteStats[auctionId].sum += count;
        }
    }
}, 5000); // Every 5 seconds

// Send analytics to backend every 1 minute
setInterval(async () => {
    for (const [auctionId, stats] of Object.entries(currentMinuteStats)) {
        if (stats.samples.length > 0) {
            const avgViewers = Math.round(stats.sum / stats.samples.length);
            const currentCount = viewerCounts[auctionId] || 0;
            
            const analyticsData = {
                timestamp: new Date(),
                viewerCount: currentCount,
                avgViewers: avgViewers,
                peakViewers: stats.max,
                minViewers: stats.min,
                sampleCount: stats.samples.length
            };
            
            // Make HTTP call to backend API
            try {
                const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
                const apiKey = process.env.INTERNAL_API_KEY || 'default-dev-key';
                
                await axios.post(
                    `${backendUrl}/api/v1/auctions/${auctionId}/analytics/snapshot`,
                    analyticsData,
                    {
                        headers: {
                            'X-Internal-Request': apiKey,
                            'Content-Type': 'application/json'
                        },
                        timeout: 5000
                    }
                );
                
                console.log(`📊 Analytics sent for auction ${auctionId}: current ${currentCount}, avg ${avgViewers}, peak ${stats.max}, samples ${stats.samples.length}`);
            } catch (error) {
                // Don't crash if backend is down, just log
                console.error(`⚠️ Failed to send analytics for ${auctionId}:`, error.message);
            }
            
            // Reset stats for next minute
            delete currentMinuteStats[auctionId];
        }
    }
}, 60000); // Every 1 minute

// Log connection counts every 10 seconds
setInterval(() => {
    const mainIOConnections = io.engine.clientsCount;
    const auctionIOConnections = auctionIO.engine.clientsCount;
    const totalViewers = Object.values(viewerCounts).reduce((sum, count) => sum + count, 0);

    const logMessage = `Total connections (Main IO): ${mainIOConnections}, Auction IO: ${auctionIOConnections}, Live Viewers: ${totalViewers}`;

    logToFile(logMessage);
    console.log(`📊 ${logMessage}`);
}, 10000); // Logs every 10 seconds
