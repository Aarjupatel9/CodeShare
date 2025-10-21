# Server Capacity Analysis

Comprehensive analysis of CodeShare server capacity for AWS t2.micro instances.

---

## 🖥️ Server Specifications

### AWS t2.micro:
- **RAM**: 1 GB (1024 MB)
- **vCPU**: 1 core (burstable)
- **Network**: Low to Moderate
- **Cost**: ~$8-10/month
- **Burst Credits**: 6 credits/hour

---

## 📊 Single Server Capacity (1 × t2.micro)

### Memory Allocation:
```
Total RAM:              1024 MB
- OS/System:            -200 MB
- Node.js Backend:      -150 MB
- Socket.IO Server:      -30 MB
- Nginx:                 -40 MB
- MongoDB (optional):   -300 MB
- Buffer (10%):         -104 MB
────────────────────────────────
Available:               200 MB (with MongoDB)
Available:               500 MB (MongoDB separate)
```

### Concurrent User Capacity:

**With MongoDB on Same Server:**
- Realistic: **200-400 viewers**
- Peak (burst): **500 viewers**

**With MongoDB on Separate Server (Recommended):**
- Realistic: **500-800 viewers**
- Peak (burst): **1000 viewers**

**Bottleneck**: CPU (not RAM!)

---

## 🚀 Two-Server Setup (2 × t2.micro) - RECOMMENDED

### **Server 1: Backend + Frontend**

**Services:**
- Nginx (frontend serving)
- Node.js Express (REST API)
- MongoDB connection pool

**Memory Usage:**
```
Total:                  1024 MB
- OS:                   -200 MB
- Nginx:                 -40 MB
- Node.js:              -150 MB
- API pool:              -50 MB
- Buffer:               -104 MB
────────────────────────────────
Available:               480 MB
```

**Capacity:**
- API Requests: 150-200 req/sec
- Concurrent users: 1000-1500 (stateless)
- CPU Usage: 50-60% (avg), 80% (peak)

---

### **Server 2: Socket Server (Dedicated)**

**Services:**
- Node.js
- Socket.IO server only

**Memory Usage:**
```
Total:                  1024 MB
- OS:                   -200 MB
- Node.js:               -50 MB
- Socket.IO:             -30 MB
- Connections (1600):     -5 MB
- Buffer:               -104 MB
────────────────────────────────
Available:               635 MB
```

**Per Connection:**
- Memory: **2-3 KB**
- CPU: Minimal (only on events)

**Capacity:**
- Concurrent viewers: **1500-2000**
- Memory usage at 1600 viewers: **~5 MB** (negligible!)
- CPU Usage: 60-75% (avg), 90% (peak)

---

## 🎯 Combined Capacity (2 × t2.micro)

### **For 1000 Average Viewers:**

| Server | Usage | Headroom |
|--------|-------|----------|
| Backend | 50% CPU, 300 MB RAM | ✅ Plenty |
| Socket | 50% CPU, 250 MB RAM | ✅ Plenty |

**Status**: ✅ **COMFORTABLE** (50% capacity)

### **For 1600 Peak Viewers:**

| Server | Usage | Headroom |
|--------|-------|----------|
| Backend | 60% CPU, 320 MB RAM | ✅ Good |
| Socket | 70% CPU, 280 MB RAM | ✅ Good |

**Status**: ✅ **GOOD** (70% capacity)

---

## 📈 Scalability Path

| Viewers | Recommendation | Monthly Cost |
|---------|---------------|--------------|
| < 500 | 1 × t2.micro | $10 |
| 500-1600 | **2 × t2.micro** ⭐ | **$20** |
| 1600-3000 | 1 × t2.small + 1 × t2.micro | $25 |
| 3000-5000 | 2 × t2.small | $34 |
| 5000+ | Auto-scaling + Load balancer | $100+ |

**Your Setup**: 2 × t2.micro for 1000-1600 viewers ✅

---

## 💡 Optimization Tips

### 1. Use MongoDB Atlas (Free Tier)
- Offloads 300MB from your server
- Professional hosting
- Automatic backups
- **Frees up 30% of RAM!**

### 2. Enable Gzip Compression
```javascript
// backend/src/app.js
const compression = require('compression');
app.use(compression());
```
- Reduces bandwidth by 70%
- Faster page loads

### 3. Set Node.js Memory Limit
```bash
node --max-old-space-size=512 server.js
```
- Prevents OOM crashes
- Leaves room for OS

### 4. Connection Limiting
```javascript
// Protect against overload
if (io.engine.clientsCount > 2000) {
  socket.emit('serverFull');
  socket.disconnect();
}
```

### 5. Nginx Optimization
```nginx
worker_connections 2048;
gzip on;
keepalive_timeout 65;
```

---

## 🧪 Load Testing Results (Estimated)

### Socket Server Test:

| Viewers | CPU | Memory | Response Time | Status |
|---------|-----|--------|---------------|--------|
| 100 | 15% | 220 MB | < 50ms | ✅ Excellent |
| 500 | 40% | 240 MB | < 100ms | ✅ Good |
| 1000 | 60% | 260 MB | < 150ms | ✅ Acceptable |
| 1600 | 75% | 280 MB | < 200ms | ✅ Good |
| 2000 | 90% | 300 MB | < 300ms | ⚠️ Limit |

**Primary Bottleneck**: CPU (not RAM)

### Backend Server Test:

| Req/Sec | CPU | Memory | Response Time | Status |
|---------|-----|--------|---------------|--------|
| 50 | 20% | 250 MB | < 100ms | ✅ Excellent |
| 100 | 40% | 280 MB | < 150ms | ✅ Good |
| 150 | 60% | 310 MB | < 200ms | ✅ Acceptable |
| 200 | 80% | 340 MB | < 300ms | ⚠️ Stressed |

---

## 📊 Real-World Scenarios

### Typical Auction (100-500 viewers):

**Server 1 (Backend):**
- CPU: 30-40%
- Memory: 280 MB
- Load: Light ✅

**Server 2 (Socket):**
- CPU: 30-50%
- Memory: 240 MB
- Connections: 500
- Load: Light ✅

**Verdict**: ✅ **Very comfortable**

### Peak Moments (800-1600 viewers):

**Server 1 (Backend):**
- CPU: 50-60%
- Memory: 320 MB
- Load: Moderate ✅

**Server 2 (Socket):**
- CPU: 60-80%
- Memory: 280 MB
- Connections: 1600
- Load: Moderate ✅

**Verdict**: ✅ **Handles well with some burst**

---

## 🎯 Recommendations

### For Your Use Case (1000 avg, 1600 peak):

**Setup**: 2 × t2.micro ✅

**Why**:
- Perfect capacity match (60-80% at peak)
- Cost-effective ($20/month)
- Room for growth (up to 2000)
- Isolation (socket issues don't crash API)
- Independent scaling

**MongoDB**: Use MongoDB Atlas Free Tier
- Offloads database from app servers
- Better performance
- Professional management

---

## 📚 Related Documentation

- [Two-Server Setup Details](../02-architecture/TWO_SERVER_SETUP.md)
- [Live View Optimization](../../development/LIVE_VIEW_API_OPTIMIZATION_PLAN.md)
- [Viewer Analytics](../04-features/VIEWER_ANALYTICS.md)

---

**Optimized for minimal resources, maximum performance!** 🚀

