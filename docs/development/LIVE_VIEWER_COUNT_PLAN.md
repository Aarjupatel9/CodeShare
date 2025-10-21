# Live Viewer Count Implementation Plan

## 🎯 Current State

### Frontend:
```javascript
// AuctionLiveView.js - Line 228-229
// Mock viewer count
setViewerCount(Math.floor(Math.random() * 150) + 20);
```

### Backend:
- ❌ No Socket.IO server implementation found
- ❌ No viewer tracking system
- ✅ Socket.IO client connection exists in frontend

---

## 🔍 Current Socket.IO Usage

### Frontend (AuctionLiveView.js):
```javascript
const socket = new io(SOCKET_ADDRESS, {
    query: { slug: "auction-" + auctionId },
    path: "/auction/",
});

socket.on("playerBiddingUpdate", (player) => {
    setCurrentPlayer(player);
});

socket.on("playerSoldUpdate", (message) => {
    toast.success(message);
    fetchAllLiveData();
});

// TODO: Implement viewer tracking
```

### Backend:
- Socket.IO server needs to be set up
- No viewer room tracking currently

---

## 🚀 Implementation Plan

### **Option 1: Simple Room-Based Tracking** (RECOMMENDED)

Track viewers per auction using Socket.IO rooms.

#### Backend Implementation:

**File**: `backend/socket/auctionSocket.js` (NEW)
```javascript
const { Server } = require("socket.io");

let io;
const viewerCounts = {}; // { auctionId: count }

const initializeAuctionSocket = (server) => {
  io = new Server(server, {
    path: "/auction/",
    cors: {
      origin: process.env.ALLOWED_ORIGIN?.split(',') || ["http://localhost:3000"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Extract auctionId from query
    const { slug } = socket.handshake.query;
    const auctionId = slug?.replace('auction-', '');
    
    if (!auctionId) {
      console.log("No auction ID provided");
      socket.disconnect();
      return;
    }
    
    // Join auction room
    const roomName = `auction-${auctionId}`;
    socket.join(roomName);
    
    // Initialize viewer count for this auction if not exists
    if (!viewerCounts[auctionId]) {
      viewerCounts[auctionId] = 0;
    }
    
    // Increment viewer count
    viewerCounts[auctionId]++;
    
    console.log(`Viewer joined auction ${auctionId}. Total viewers: ${viewerCounts[auctionId]}`);
    
    // Broadcast updated viewer count to all clients in this room
    io.to(roomName).emit('viewerCountUpdate', viewerCounts[auctionId]);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      if (viewerCounts[auctionId]) {
        viewerCounts[auctionId]--;
        if (viewerCounts[auctionId] < 0) viewerCounts[auctionId] = 0;
        
        console.log(`Viewer left auction ${auctionId}. Total viewers: ${viewerCounts[auctionId]}`);
        
        // Broadcast updated count
        io.to(roomName).emit('viewerCountUpdate', viewerCounts[auctionId]);
      }
    });
    
    // Existing handlers (playerBiddingUpdate, playerSoldUpdate)
    // These would be called from API endpoints when admin updates auction
  });
};

// Helper function to emit bidding updates (called from API)
const emitPlayerBiddingUpdate = (auctionId, playerData) => {
  if (io) {
    io.to(`auction-${auctionId}`).emit('playerBiddingUpdate', playerData);
  }
};

// Helper function to emit player sold update (called from API)
const emitPlayerSoldUpdate = (auctionId, message) => {
  if (io) {
    io.to(`auction-${auctionId}`).emit('playerSoldUpdate', message);
  }
};

module.exports = {
  initializeAuctionSocket,
  emitPlayerBiddingUpdate,
  emitPlayerSoldUpdate,
  getViewerCount: (auctionId) => viewerCounts[auctionId] || 0
};
```

#### Update server.js:
```javascript
const http = require('http');
const app = require("./src/app");
const { initializeAuctionSocket } = require("./socket/auctionSocket");

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO for auction
initializeAuctionSocket(server);

server.listen(PORT, (err) => {
    if (err) {
        console.error("Error occurred while starting the server..." + err);
        return;
    }
    console.info(`Server started on PORT --> ${PORT}`);
    console.info(`Socket.IO initialized at /auction/`);
});
```

#### Frontend Changes:
```javascript
// AuctionLiveView.js - Update createAuctionSocket()

function createAuctionSocket() {
    const SOCKET_ADDRESS = getBackendSocketUrl();
    const socket = new io(SOCKET_ADDRESS, {
        query: { slug: "auction-" + auctionId },
        path: "/auction/",
    });

    socket.on("playerBiddingUpdate", (player) => {
        setCurrentPlayer(player);
    });
    
    socket.on("playerSoldUpdate", (message) => {
        toast.success(message);
        fetchAllLiveData();
    });
    
    // NEW: Listen for viewer count updates
    socket.on("viewerCountUpdate", (count) => {
        setViewerCount(count);
    });
    
    setSocket(socket);
}
```

**Time**: 2-3 hours
**Complexity**: Low

---

### **Option 2: Redis-Based Tracking** (Production Grade)

Use Redis for distributed viewer tracking (for multiple server instances).

**Pros**:
- Works with load balancers
- Persistent across server restarts
- More accurate

**Cons**:
- Requires Redis setup
- More complex
- Overkill for single server

---

### **Option 3: Database-Based Tracking**

Store active viewers in MongoDB.

**Pros**:
- Persistent
- Can track viewer history

**Cons**:
- Database overhead for real-time data
- Slower than memory-based
- Not recommended for real-time tracking

---

## 📋 Implementation Checklist (Option 1)

### Backend:
- [ ] Install socket.io (if not already): `npm install socket.io`
- [ ] Create `backend/socket/auctionSocket.js`
- [ ] Update `backend/server.js` to use http.createServer
- [ ] Initialize Socket.IO with auction socket handler
- [ ] Test connection with client

### Frontend:
- [ ] Update `createAuctionSocket()` function
- [ ] Add `viewerCountUpdate` event listener
- [ ] Remove mock viewer count
- [ ] Test real-time updates

### Testing:
- [ ] Open live view in 2 tabs → count = 2
- [ ] Close 1 tab → count = 1
- [ ] Open in 5 tabs → count = 5
- [ ] Verify count updates in real-time
- [ ] Test with multiple auctions simultaneously

---

## 🔧 Implementation Steps

### Step 1: Check if socket.io is installed
```bash
cd backend
npm list socket.io
```

### Step 2: Install if needed
```bash
npm install socket.io
```

### Step 3: Create socket handler
- Create `backend/socket/auctionSocket.js`
- Implement room-based tracking
- Add event handlers

### Step 4: Update server
- Modify `server.js` to use http.createServer
- Initialize Socket.IO

### Step 5: Update frontend
- Add `viewerCountUpdate` listener
- Remove mock data

### Step 6: Test
- Multi-tab test
- Multi-user test
- Disconnect test

---

## 💡 Additional Features (Optional)

### 1. Viewer List (Who's watching)
Track not just count, but who (IP or user ID if authenticated)

### 2. Peak Viewer Count
```javascript
const peakViewers = {}; // Track max concurrent viewers

socket.on('connection', () => {
  viewerCounts[auctionId]++;
  if (viewerCounts[auctionId] > (peakViewers[auctionId] || 0)) {
    peakViewers[auctionId] = viewerCounts[auctionId];
  }
  // Emit both current and peak
  io.to(roomName).emit('viewerStats', {
    current: viewerCounts[auctionId],
    peak: peakViewers[auctionId]
  });
});
```

### 3. Viewer Location/Analytics
- Track country/city using IP
- Display on admin dashboard
- Show geographic distribution

### 4. Heartbeat Mechanism
Ping viewers every 30s to ensure they're still active:

```javascript
// Backend
socket.on('heartbeat', () => {
  socket.emit('heartbeat-ack');
});

// Frontend
setInterval(() => {
  if (socket.connected) {
    socket.emit('heartbeat');
  }
}, 30000);
```

---

## 📊 Expected Behavior

### Scenario 1: User Joins
```
User opens live view
  ↓
Socket connects
  ↓
Join room: "auction-123"
  ↓
Increment count: 5 → 6
  ↓
Broadcast to all: viewerCountUpdate(6)
  ↓
All clients update: "6 watching"
```

### Scenario 2: User Leaves
```
User closes tab
  ↓
Socket disconnects
  ↓
Decrement count: 6 → 5
  ↓
Broadcast to all: viewerCountUpdate(5)
  ↓
All clients update: "5 watching"
```

### Scenario 3: Multiple Auctions
```
Auction A: Room "auction-123" → 15 viewers
Auction B: Room "auction-456" → 8 viewers
Auction C: Room "auction-789" → 23 viewers

Each room tracks independently ✅
```

---

## 🚨 Edge Cases to Handle

1. **Duplicate connections**: Same user, multiple tabs
   - Current approach counts each tab
   - Alternative: Track by user ID (requires auth check)

2. **Zombie connections**: Client disconnects ungracefully
   - Socket.IO handles this automatically
   - Connection timeout after ~60 seconds

3. **Server restart**: Viewer count resets
   - Acceptable for simple implementation
   - Use Redis if persistence needed

4. **Negative counts**: Bugs in increment/decrement
   - Add safeguard: `if (count < 0) count = 0`

---

## 📝 Code Template

### Complete Backend Socket File:

```javascript
// backend/socket/auctionSocket.js
const { Server } = require("socket.io");

let io;
const viewerCounts = {};
const peakViewers = {};

const initializeAuctionSocket = (server) => {
  io = new Server(server, {
    path: "/auction/",
    cors: {
      origin: process.env.ALLOWED_ORIGIN?.split(',') || ["http://localhost:3000"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    const { slug } = socket.handshake.query;
    const auctionId = slug?.replace('auction-', '');
    
    if (!auctionId) {
      socket.disconnect();
      return;
    }
    
    const roomName = `auction-${auctionId}`;
    socket.join(roomName);
    
    // Increment count
    viewerCounts[auctionId] = (viewerCounts[auctionId] || 0) + 1;
    
    // Track peak
    if (!peakViewers[auctionId] || viewerCounts[auctionId] > peakViewers[auctionId]) {
      peakViewers[auctionId] = viewerCounts[auctionId];
    }
    
    // Broadcast
    io.to(roomName).emit('viewerCountUpdate', {
      current: viewerCounts[auctionId],
      peak: peakViewers[auctionId]
    });
    
    console.log(`✅ Viewer joined ${auctionId}: ${viewerCounts[auctionId]} watching`);
    
    socket.on('disconnect', () => {
      viewerCounts[auctionId]--;
      if (viewerCounts[auctionId] < 0) viewerCounts[auctionId] = 0;
      
      io.to(roomName).emit('viewerCountUpdate', {
        current: viewerCounts[auctionId],
        peak: peakViewers[auctionId]
      });
      
      console.log(`❌ Viewer left ${auctionId}: ${viewerCounts[auctionId]} watching`);
    });
  });
  
  return io;
};

const emitPlayerBiddingUpdate = (auctionId, playerData) => {
  if (io) {
    io.to(`auction-${auctionId}`).emit('playerBiddingUpdate', playerData);
  }
};

const emitPlayerSoldUpdate = (auctionId, message) => {
  if (io) {
    io.to(`auction-${auctionId}`).emit('playerSoldUpdate', message);
  }
};

const getViewerCount = (auctionId) => {
  return viewerCounts[auctionId] || 0;
};

module.exports = {
  initializeAuctionSocket,
  emitPlayerBiddingUpdate,
  emitPlayerSoldUpdate,
  getViewerCount
};
```

### Updated server.js:
```javascript
const http = require('http');
const app = require("./src/app");
const { initializeAuctionSocket } = require("./socket/auctionSocket");

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeAuctionSocket(server);

server.listen(PORT, (err) => {
    if (err) {
        console.error("Error occurred while starting the server..." + err);
        return;
    }
    console.info(`🚀 Server started on PORT --> ${PORT}`);
    console.info(`📡 Socket.IO listening at /auction/`);
});
```

### Updated Frontend:
```javascript
// AuctionLiveView.js - createAuctionSocket()

socket.on("viewerCountUpdate", (data) => {
    setViewerCount(data.current);
    // Optional: setPeakViewers(data.peak);
});

// Remove mock viewer count line:
// setViewerCount(Math.floor(Math.random() * 150) + 20); ← DELETE
```

---

## 📊 Data Flow

```
User opens live view page
  ↓
Socket connects to server
  ↓
Server: join room "auction-123"
  ↓
Server: viewerCounts['123']++
  ↓
Server: emit('viewerCountUpdate', count) to room
  ↓
All clients in room receive update
  ↓
Update UI: "25 watching"
```

---

## 🔧 Additional Improvements

### 1. Show Peak Viewers
```javascript
// Frontend
const [viewerCount, setViewerCount] = useState(0);
const [peakViewers, setPeakViewers] = useState(0);

// Display
<span className="text-xs text-gray-400">
  Peak: {peakViewers}
</span>
```

### 2. Viewer Activity Indicator
```javascript
// Show "live" indicator when viewers are active
{viewerCount > 0 && (
  <span className="text-green-400">● {viewerCount} watching</span>
)}
```

### 3. Admin Dashboard - Viewer Analytics
```javascript
// API endpoint to get viewer stats
GET /api/v1/auctions/:id/viewer-stats

Response:
{
  current: 25,
  peak: 47,
  history: [
    { timestamp: '...', count: 30 },
    { timestamp: '...', count: 25 },
  ]
}
```

---

## 🚨 Important Considerations

### 1. Server Resource Usage
**Memory**: ~1KB per connection
- 100 viewers = ~100KB
- 1000 viewers = ~1MB
- ✅ Very light for t2.micro

**CPU**: Minimal
- Only on connect/disconnect
- Broadcast is efficient

### 2. Multiple Server Instances (Future)
If you scale to multiple servers:
- Use Socket.IO Redis adapter
- Share viewer count across instances
- Not needed for single server (t2.micro)

### 3. Connection Timeouts
- Default timeout: 60 seconds
- Disconnected clients auto-removed
- No manual cleanup needed

---

## 📋 Implementation Checklist

### Prerequisites:
- [ ] Check if socket.io is installed
- [ ] Check Node.js version (should be 14+)

### Backend:
- [ ] Create `backend/socket/` directory
- [ ] Create `backend/socket/auctionSocket.js`
- [ ] Update `backend/server.js`
- [ ] Test server starts correctly

### Frontend:
- [ ] Add `viewerCountUpdate` listener
- [ ] Remove mock viewer count
- [ ] Test in development

### Testing:
- [ ] Open live view → count = 1
- [ ] Open in 2nd tab → count = 2
- [ ] Close 1 tab → count = 1
- [ ] Test multiple auctions simultaneously
- [ ] Test server restart (count resets to 0)

---

## 🎯 Timeline

### Quick Implementation:
- **Backend**: 1 hour (create socket handler + update server)
- **Frontend**: 30 mins (add listener, remove mock)
- **Testing**: 30 mins (multi-tab, multi-auction)

**Total**: ~2 hours

### With Enhancements (peak viewers, analytics):
- **Additional**: 2-3 hours

---

## 💡 Recommendation

**Start Simple**: Implement Option 1 (Room-Based Tracking)

**Why**:
- ✅ Easy to implement (2 hours)
- ✅ Accurate real-time count
- ✅ Low server overhead
- ✅ Works perfectly for single server
- ✅ Can enhance later if needed

**Later**: Add peak viewers, analytics, viewer list if needed

---

**Want me to implement this now?** It's a quick 2-hour task with high visual impact!

