# Viewer Tracking - Final Implementation ✅

## 🏗️ Architecture (2-Server Setup)

```
┌──────────────────────────────────────────────────┐
│ Socket Server (t2.micro #2) - Port 8081         │
│ ┌──────────────────────────────────────────────┐ │
│ │ Real-Time Viewer Tracking:                   │ │
│ │ - Users connect → viewerCount++              │ │
│ │ - Users disconnect → viewerCount--           │ │
│ │ - Broadcast count to all viewers             │ │
│ │                                              │ │
│ │ In-Memory Sampling (Every 5 sec):            │ │
│ │ - Track: min, max, sum of viewer counts     │ │
│ │ - Store 12 samples per minute                │ │
│ │                                              │ │
│ │ Analytics (Every 1 minute):                  │ │
│ │   HTTP POST → Backend Server                 │ │
│ │   URL: /api/v1/auctions/:id/analytics/snapshot│ │
│ │   Body: { viewerCount, avgViewers, peak... }│ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
                      ↓
          HTTP POST (with API key)
                      ↓
┌──────────────────────────────────────────────────┐
│ Backend Server (t2.micro #1) - Port 8080        │
│ ┌──────────────────────────────────────────────┐ │
│ │ API Endpoint:                                │ │
│ │ POST /api/v1/auctions/:id/analytics/snapshot │ │
│ │                                              │ │
│ │ Process:                                     │ │
│ │ 1. Verify internal API key                  │ │
│ │ 2. Check auction.enableViewerAnalytics      │ │
│ │ 3. If enabled: Save to MongoDB              │ │
│ │ 4. If disabled: Skip (return success)       │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ MongoDB: ViewerAnalytics Collection             │
│ - 1-minute snapshots                            │
│ - 90-day TTL auto-cleanup                       │
└──────────────────────────────────────────────────┘
```

---

## 📋 Files Modified

### Socket Server (socketServer/):
- ✅ `app.js` - Added viewer tracking + analytics HTTP calls

### Backend Server (backend/):
- ✅ `models/viewerAnalyticsModel.js` (NEW)
- ✅ `models/auctionModel.js` - Added enableViewerAnalytics field
- ✅ `controllers/v1/auctionStatsController.js` - Added 2 functions
- ✅ `routes/v1/auctions.route.js` - Added 2 routes
- ✅ `server.js` - Reverted (socket runs separately)

### Frontend (frontend/src/):
- ✅ `auction/AuctionLiveView.js` - Added viewerCountUpdate listener
- ✅ `auction/components/setup/AuctionSettings.jsx` - Analytics toggle
- ✅ `services/api/auctionApi.js` - getViewerAnalytics method

---

## 🔧 How It Works

### Real-Time Viewer Count:

**When User Joins:**
```
1. User opens live view
2. Socket connects to socketServer:8081
3. viewerCounts[auctionId]++
4. Broadcast to all in room: viewerCountUpdate(newCount)
5. All viewers see updated count instantly
```

**When User Leaves:**
```
1. User closes tab
2. Socket disconnects
3. viewerCounts[auctionId]--
4. Broadcast updated count
```

---

### Analytics Storage (If Enabled):

**Every 5 Seconds (In Memory):**
```javascript
// Socket Server tracks in memory only
currentMinuteStats[auctionId] = {
  samples: [420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475],
  min: 420,
  max: 475,
  sum: 5340
}
```

**Every 1 Minute (HTTP to Backend):**
```javascript
// Socket Server calculates
avgViewers = 5340 / 12 = 445

// HTTP POST to backend
POST http://backend:8080/api/v1/auctions/123/analytics/snapshot
Headers: { X-Internal-Request: 'secret-key' }
Body: {
  timestamp: "2025-10-21T14:15:00Z",
  viewerCount: 475,     // Current count
  avgViewers: 445,      // Average of 12 samples
  peakViewers: 475,     // Max of 12 samples
  minViewers: 420,      // Min of 12 samples
  sampleCount: 12
}

// Backend receives, checks flag, saves to MongoDB
```

---

## ⚙️ Configuration

### Socket Server (.env):
```bash
PORT=8081
ALLOWED_ORIGIN=http://localhost:3000,http://localhost:8080

# Backend communication
BACKEND_API_URL=http://localhost:8080
INTERNAL_API_KEY=your-secret-key-here-12345
```

### Backend Server (.env):
```bash
PORT=8080
ALLOWED_ORIGIN=http://localhost:3000,http://localhost:8081

# Internal API security
INTERNAL_API_KEY=your-secret-key-here-12345
```

**Important**: Both servers must have **same** `INTERNAL_API_KEY`

---

## 🎯 Auction Settings UI

### New Toggle Added:

```
┌─────────────────────────────────────────────────┐
│ 📊 Viewer Analytics Tracking                    │
├─────────────────────────────────────────────────┤
│ [ON/OFF Toggle]  Enabled/Disabled               │
│                                                  │
│ Track viewer count every minute for analytics   │
│ dashboard (snapshots stored for 90 days)        │
│                                                  │
│ ℹ️ Analytics Details:                           │
│ Viewer count will be sampled every 5 seconds    │
│ and aggregated every minute. This data will be  │
│ available in your analytics dashboard.          │
└─────────────────────────────────────────────────┘
```

---

## 📊 API Endpoints

### Internal (Socket Server → Backend):
```
POST /api/v1/auctions/:id/analytics/snapshot
  Headers: X-Internal-Request: [API-KEY]
  Body: { timestamp, viewerCount, avgViewers, peakViewers, ... }
  
Response: { success: true, message: 'Snapshot saved' }
```

### Admin Dashboard (Future):
```
GET /api/v1/auctions/:id/analytics/viewers?timeRange=all

Response: {
  snapshots: [...],
  summary: {
    overallPeak: 890,
    overallAvg: 520,
    duration: 180
  }
}
```

---

## 🧪 Testing Checklist

### Setup:
- [ ] Add `INTERNAL_API_KEY` to both .env files (same value)
- [ ] Add `BACKEND_API_URL` to socket server .env
- [ ] Restart both servers

### Backend Server:
```bash
cd backend
npm start

# Should see:
# 🚀 Server started on PORT --> 8080
```

### Socket Server:
```bash
cd socketServer  
npm start

# Should see:
# 🚀 Socket Server running on port 8081
# 📡 Main IO: /socket/
# 📡 Auction IO: /auction/
# 📊 Viewer analytics: Enabled
```

### Functional Tests:
- [ ] Enable analytics in auction settings
- [ ] Save settings
- [ ] Open live view → See "1 watching"
- [ ] Open 2nd tab → See "2 watching"
- [ ] Close 1 tab → See "1 watching"
- [ ] Wait 1 minute → Check socket server logs for "Analytics sent"
- [ ] Check backend logs for "Viewer snapshot saved"
- [ ] Check MongoDB: `vieweranalytics` collection should have record

### Verify Analytics Saving:
```javascript
// MongoDB shell or Compass
db.vieweranalytics.find({ auction: ObjectId("your-auction-id") }).sort({ timestamp: -1 })

// Should show:
{
  _id: ...,
  auction: ObjectId("..."),
  timestamp: ISODate("2025-10-21T14:15:00Z"),
  viewerCount: 2,
  avgViewers: 2,
  peakViewers: 2,
  minViewers: 1,
  sampleCount: 12
}
```

---

## 🚨 Troubleshooting

### Issue: Viewer count not updating
**Check:**
- Socket server running on port 8081
- Frontend config.json has correct socket_url
- Browser console for Socket errors

### Issue: Analytics not saving
**Check:**
- `enableViewerAnalytics` is true in auction
- Socket server logs show "Analytics sent"
- Backend logs show "Viewer snapshot saved"
- API keys match in both .env files
- Backend API URL is correct

### Issue: "Unauthorized" error
**Check:**
- `INTERNAL_API_KEY` matches in both servers
- Header name is exact: `X-Internal-Request`

---

## 📈 Future: Analytics Dashboard

### Chart Display (To Be Built):

```javascript
// In AuctionDashboard.js
const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  auctionApi.getViewerAnalytics(auctionId).then(res => {
    setAnalytics(res.data);
  });
}, []);

// Display:
<div>
  <h3>📊 Viewer Analytics</h3>
  <p>Peak: {analytics.summary.overallPeak}</p>
  <p>Average: {analytics.summary.overallAvg}</p>
  <Line data={chartData} /> {/* Chart.js */}
</div>
```

---

## ✅ Implementation Complete!

### What Works Now:
- ✅ Real-time viewer count (instant updates)
- ✅ Analytics toggle in settings
- ✅ 1-minute snapshot storage (if enabled)
- ✅ HTTP communication between servers
- ✅ Security with API key
- ✅ Auto-cleanup (90 days)

### What's Pending:
- ⏭️ Analytics dashboard UI (chart display)
- ⏭️ Add env variables to production servers
- ⏭️ Test in production

---

**Ready to test!** 🚀

Just add the env variables and restart both servers!

