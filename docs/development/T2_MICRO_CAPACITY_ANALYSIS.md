# t2.micro (1GB RAM) Capacity Analysis

## 🖥️ Server Specifications

**AWS t2.micro:**
- **RAM**: 1 GB (1024 MB)
- **vCPU**: 1 core (burstable)
- **Network**: Low to Moderate
- **Cost**: ~$8-10/month

---

## 📊 Memory Allocation Breakdown

### Base System & OS:
- **Linux OS**: ~150-200 MB
- **SSH/System Services**: ~50 MB
- **Available for apps**: ~800 MB

### Your Stack:

#### 1. Node.js Backend + Socket.IO:
- **Node.js Runtime**: ~50-80 MB (base)
- **Express App**: ~30-50 MB (loaded modules)
- **MongoDB Connections**: ~10-20 MB (connection pool)
- **Socket.IO Server**: ~20-30 MB (base)
- **Per Connection**: ~1-2 KB per socket
- **Subtotal**: ~110-180 MB (idle) + ~0.001-0.002 MB per connection

#### 2. Nginx:
- **Nginx Process**: ~20-40 MB
- **Static File Serving**: ~10-20 MB (cached)
- **Subtotal**: ~30-60 MB

#### 3. MongoDB (if on same server):
- **MongoDB**: ~200-400 MB (with cache)
- **Note**: Ideally should be separate server

---

## 🧮 Concurrent User Calculation

### Scenario 1: MongoDB on Separate Server (RECOMMENDED)

**Available RAM for App**:
```
Total:              1024 MB
- OS/System:        -200 MB
- Node.js Backend:  -150 MB
- Socket.IO Base:    -30 MB
- Nginx:             -40 MB
- Buffer (safety):  -104 MB (10%)
─────────────────────────────
Available:           500 MB
```

**Per User Resource Usage:**

**Live View User (Viewer)**:
- Socket connection: 1-2 KB
- Memory overhead: ~0.5 KB
- **Total**: ~2-3 KB per viewer

**Admin User (Bidding)**:
- Socket connection: 1-2 KB
- Session data: ~5 KB
- Active requests: ~10 KB (temporary)
- **Total**: ~15-20 KB per admin

**Calculation**:
```
500 MB available / 0.003 MB per viewer = ~166,666 viewers (theoretical)

Realistic with safety margin:
500 MB / 0.01 MB per connection = ~50,000 viewers
```

**CPU Consideration** (More limiting factor):
- t2.micro: 1 vCPU (burstable)
- CPU is the bottleneck, not RAM
- Realistic limit: **500-1000 concurrent viewers**

---

### Scenario 2: MongoDB on Same Server (Not Recommended)

**Available RAM**:
```
Total:              1024 MB
- OS/System:        -200 MB
- MongoDB:          -300 MB
- Node.js Backend:  -150 MB
- Socket.IO Base:    -30 MB
- Nginx:             -40 MB
- Buffer:           -104 MB
─────────────────────────────
Available:           200 MB
```

**Realistic Limit**: **200-400 concurrent viewers**

---

## 🎯 Real-World Capacity Estimates

### Conservative Estimate (SAFE):
```
Live Viewers:     500-800 concurrent
Admin Users:      5-10 concurrent
API Requests:     50-100 req/sec
Peak Load:        1000 viewers for short bursts
```

### Optimistic Estimate (With tuning):
```
Live Viewers:     1000-1500 concurrent
Admin Users:      10-15 concurrent
API Requests:     100-150 req/sec
Peak Load:        2000 viewers for short bursts (CPU throttling)
```

### Realistic for Your Auction:
```
Typical Auction:
- Live Viewers:   100-500 concurrent
- Peak Moments:   800-1000 viewers (when star player bids)
- Admins:         1-3 concurrent
- Duration:       2-4 hours

✅ t2.micro can EASILY handle this!
```

---

## 📈 Scalability Recommendations

### For < 500 Viewers:
- ✅ **t2.micro is PERFECT**
- Single server setup
- No need for Redis/load balancer
- Cost: ~$10/month

### For 500-1500 Viewers:
- ⚠️ **Consider t2.small** (2 GB RAM)
- Still single server
- Better CPU credits
- Cost: ~$17/month

### For 1500+ Viewers:
- 🚀 **Need scaling**:
  - Multiple t2.small instances
  - Load balancer
  - Redis for session sharing
  - Socket.IO Redis adapter
  - Cost: ~$50-100/month

---

## 🔧 Optimization Tips for t2.micro

### 1. MongoDB Optimization:
```javascript
// Use separate MongoDB instance (MongoDB Atlas free tier)
// Or use DigitalOcean managed MongoDB ($15/month)
// Frees up 300MB on your t2.micro!
```

### 2. Node.js Memory Limit:
```javascript
// Set Node.js max memory (prevent OOM)
node --max-old-space-size=512 server.js
// Limits Node to 512MB, leaves room for OS
```

### 3. Enable Gzip Compression:
```javascript
// app.js
const compression = require('compression');
app.use(compression());
// Reduces bandwidth by 70%
```

### 4. Connection Pooling:
```javascript
// Limit concurrent connections
const connectionLimit = 1000; // Max sockets

io.on('connection', (socket) => {
  const currentConnections = io.engine.clientsCount;
  if (currentConnections > connectionLimit) {
    socket.emit('serverFull', 'Too many viewers, try again later');
    socket.disconnect();
    return;
  }
  // ... rest of code
});
```

### 5. Nginx Optimization:
```nginx
# nginx.conf
worker_processes auto;
worker_connections 2048;

gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Cache static files
location /static {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 📊 Load Testing Results (Estimated)

### Test Scenario: Auction with 100 Players, 10 Teams

**Concurrent Users Test**:
```
100 viewers:
- RAM Usage: ~250 MB (backend + sockets)
- CPU: 15-20%
- Response Time: < 100ms
- Status: ✅ EXCELLENT

300 viewers:
- RAM Usage: ~300 MB
- CPU: 30-40%
- Response Time: < 150ms
- Status: ✅ GOOD

500 viewers:
- RAM Usage: ~350 MB
- CPU: 50-60%
- Response Time: < 200ms
- Status: ✅ ACCEPTABLE

800 viewers:
- RAM Usage: ~400 MB
- CPU: 70-80% (bursting)
- Response Time: 200-300ms
- Status: ⚠️ STRESSED (still works)

1000 viewers:
- RAM Usage: ~450 MB
- CPU: 90-100% (constant burst)
- Response Time: 300-500ms
- Status: ⚠️ LIMIT REACHED

1500+ viewers:
- CPU: 100% (throttled)
- Response Time: > 1000ms
- Status: ❌ NEED UPGRADE
```

---

## 🎯 Bottleneck Analysis

### Primary Bottleneck: **CPU, not RAM**

**Why**:
- Socket.IO is CPU-intensive (event broadcasting)
- t2.micro has only 1 vCPU (burstable)
- Burst credits deplete under sustained load
- RAM usage stays low (~400-500 MB even with 1000 viewers)

**CPU Credits**:
- t2.micro earns 6 credits/hour
- Uses 6 credits/hour at 100% CPU
- Can burst for 1-2 hours, then throttles to 10% CPU

**Real Limit**: 
- **Sustained load**: 500 viewers (30-40% CPU)
- **Burst load**: 1000 viewers (for 1-2 hours max)

---

## 💡 Recommendations

### For Your Auction Use Case:

**Expected Load**:
- Typical: 50-200 viewers
- Peak: 300-500 viewers (exciting moments)
- Duration: 2-4 hours

**Recommendation**: 
✅ **t2.micro is PERFECT!**

**Why**:
- Well within capacity (500 viewers sustained)
- Can handle peaks up to 800-1000 (short bursts)
- Cost-effective (~$10/month)
- Room for growth

---

### Growth Path:

**When to Upgrade**:

| Concurrent Viewers | Recommendation | Cost/Month |
|-------------------|----------------|------------|
| < 500 | t2.micro (1 GB) | $8-10 |
| 500-1500 | t2.small (2 GB) | $17 |
| 1500-3000 | t2.medium (4 GB) | $34 |
| 3000+ | Multiple servers + LB | $100+ |

**For Your Case**: Stick with t2.micro for now!

---

## 🚀 Implementation Impact

### With Real Viewer Count:

**Resource Addition**:
- Memory: +20-30 MB (Socket.IO server)
- CPU: +5-10% (idle), +20-40% (500 viewers)
- Connections: 1 socket per viewer

**Total Capacity**:
- ✅ **Recommended max**: 500 concurrent viewers
- ⚠️ **Burst capacity**: 1000 viewers (1-2 hours)
- ❌ **Hard limit**: 1500+ (need upgrade)

---

## 📋 Monitoring Recommendations

### Add These Metrics (Optional):

**File**: `backend/socket/auctionSocket.js`
```javascript
// Add monitoring
const getServerHealth = () => {
  const totalViewers = Object.values(viewerCounts).reduce((sum, count) => sum + count, 0);
  const memUsage = process.memoryUsage();
  
  return {
    totalViewers,
    activeAuctions: Object.keys(viewerCounts).length,
    memoryUsage: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    },
    cpuUsage: process.cpuUsage(),
    uptime: Math.round(process.uptime() / 60) + ' minutes'
  };
};

// Emit health status every minute
setInterval(() => {
  const health = getServerHealth();
  console.log('Server Health:', health);
  
  // Warn if approaching limits
  if (health.totalViewers > 800) {
    console.warn('⚠️ High viewer count:', health.totalViewers);
  }
}, 60000);
```

---

## ✅ Final Answer

### **Can t2.micro handle live viewer count tracking?**

**YES!** ✅

**Capacity**:
- **Comfortable**: 500 concurrent viewers
- **Peak**: 1000 viewers (short bursts)
- **Resource Usage**: Very low (~2-3KB per viewer)

**Your Auction**:
- Expected: 100-500 viewers
- Well within limits!
- No issues at all

**Recommendation**:
✅ **Implement it!** You have plenty of capacity.

---

## 🎯 Quick Implementation (2 hours)

1. ✅ Create socket handler (room-based)
2. ✅ Update server.js
3. ✅ Update frontend listener
4. ✅ Test with multiple tabs
5. ✅ Deploy!

**Server will handle it easily!** 🚀

---

**Want to implement now?** The server can definitely handle it, and it adds great value for spectators to see how many people are watching!

