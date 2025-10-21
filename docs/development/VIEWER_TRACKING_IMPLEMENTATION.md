# Viewer Tracking Implementation - Complete ✅

## 🎉 What Was Implemented

### ✅ Backend:
1. **ViewerAnalytics Model** - MongoDB schema for storing snapshots
2. **Socket.IO Server** - Real-time viewer tracking
3. **Analytics API Endpoints** - Save & retrieve analytics
4. **Auction Model Update** - Added `enableViewerAnalytics` flag
5. **Security** - Internal API key for socket→backend communication

### ✅ Frontend:
1. **Real-time Viewer Count** - Socket listener in AuctionLiveView
2. **Analytics Toggle** - Checkbox in Auction Settings
3. **API Integration** - getViewerAnalytics method

---

## 📋 Files Created/Modified

### Backend:
- ✅ `backend/models/viewerAnalyticsModel.js` (NEW)
- ✅ `backend/socket/auctionSocket.js` (NEW)
- ✅ `backend/models/auctionModel.js` (MODIFIED - added enableViewerAnalytics)
- ✅ `backend/controllers/v1/auctionStatsController.js` (MODIFIED - added 2 functions)
- ✅ `backend/routes/v1/auctions.route.js` (MODIFIED - added 2 routes)
- ✅ `backend/server.js` (MODIFIED - Socket.IO initialization)
- ✅ `backend/package.json` (MODIFIED - added socket.io, axios)

### Frontend:
- ✅ `frontend/src/auction/AuctionLiveView.js` (MODIFIED - viewer count listener)
- ✅ `frontend/src/auction/components/setup/AuctionSettings.jsx` (MODIFIED - analytics toggle)
- ✅ `frontend/src/services/api/auctionApi.js` (MODIFIED - analytics method)

---

## 🔧 How It Works

### 1. Socket Server (Every 5 seconds):
```
Samples current viewer count in memory
↓
Tracks: min, max, sum for current minute
↓
No database calls (all in memory)
```

### 2. Socket Server (Every 1 minute):
```
Calculate: avg, peak, min from 12 samples
↓
HTTP POST → Backend API
  URL: /api/v1/auctions/:id/analytics/snapshot
  Headers: X-Internal-Request: [API-KEY]
  Body: { viewerCount, avgViewers, peakViewers, ... }
↓
Backend checks: auction.enableViewerAnalytics
↓
If enabled: Save to ViewerAnalytics collection
If disabled: Skip (return success, don't save)
```

### 3. Real-Time Updates (Continuous):
```
User connects → viewerCount++
↓
Broadcast to all: viewerCountUpdate(newCount)
↓
All viewers see updated count instantly
```

---

## 🎯 Analytics Dashboard (To Be Built)

### API Endpoint:
```
GET /api/v1/auctions/:id/analytics/viewers?timeRange=all
```

### Response:
```javascript
{
  success: true,
  data: {
    snapshots: [
      {
        timestamp: "2025-10-21T14:00:00Z",
        viewerCount: 425,
        avgViewers: 420,
        peakViewers: 450,
        minViewers: 380,
        sampleCount: 12
      },
      // ... more snapshots
    ],
    summary: {
      totalSnapshots: 180,
      overallPeak: 890,
      overallAvg: 520,
      overallMin: 120,
      duration: 180 // minutes
    }
  }
}
```

### Frontend Display (Future - AuctionDashboard):
```javascript
import { Line } from 'react-chartjs-2';

const [viewerAnalytics, setViewerAnalytics] = useState(null);

useEffect(() => {
  auctionApi.getViewerAnalytics(auctionId).then(res => {
    setViewerAnalytics(res.data);
  });
}, []);

// Render chart with snapshots data
<Line data={chartData} options={chartOptions} />
```

---

## ⚙️ Configuration Required

### Backend .env:
```bash
# Add these to your .env file:

INTERNAL_API_KEY=your-secret-key-change-in-production
BACKEND_API_URL=http://localhost:8080

# For production (2-server setup):
# Server 1 (Backend):
INTERNAL_API_KEY=same-key-on-both-servers

# Server 2 (Socket):
BACKEND_API_URL=http://backend-server-ip:8080
INTERNAL_API_KEY=same-key-on-both-servers
```

---

## 🧪 Testing Steps

### 1. Start Backend:
```bash
cd backend
npm start
```

**Expected Output:**
```
🚀 Server started on PORT --> 8080
📡 Socket.IO listening at /auction/
📊 Viewer analytics: Configured per auction
```

### 2. Enable Analytics:
- Go to Auction Setup → Settings
- Enable "Viewer Analytics Tracking"
- Save

### 3. Open Live View:
- Open: `/t/auction/:auctionId/live`
- Check: Viewer count shows "1 watching"

### 4. Test Multi-Tab:
- Open 2nd tab → "2 watching"
- Open 3rd tab → "3 watching"
- Close 1 tab → "2 watching"

### 5. Check Analytics (After 1 minute):
- Wait 1 minute
- Check MongoDB: `ViewerAnalytics` collection
- Should have 1 record with your viewer data

### 6. Query Analytics:
```bash
# Using MongoDB shell or Compass
db.vieweranalytics.find({ auction: ObjectId("your-auction-id") })
```

---

## 📊 Storage Impact

### For 3-Hour Auction:
- Snapshots: 180 (1 per minute)
- Size: ~45 KB
- ✅ Negligible

### For 100 Auctions (90 days):
- Records: ~16,200
- Size: ~4 MB
- ✅ Minimal

---

## 🔐 Security Features

1. **Internal API Key**: Socket server must send correct key
2. **Per-Auction Toggle**: Only save if analytics enabled
3. **Auto-Cleanup**: 90-day TTL (automatic deletion)
4. **No Public Write**: Only internal services can save

---

## 🚀 Next Steps

### Immediate (Testing):
1. Add `INTERNAL_API_KEY` to .env
2. Restart backend server
3. Test viewer tracking
4. Verify analytics saving

### Future (Analytics Dashboard):
1. Create analytics chart component
2. Add to AuctionDashboard
3. Display trend line
4. Show peak/avg stats

---

## ✅ Ready to Test!

All code is implemented. Just need to:
1. Add environment variables
2. Restart server
3. Enable analytics in auction settings
4. Test viewer counting!

**No commits yet - test first!** 🚀

