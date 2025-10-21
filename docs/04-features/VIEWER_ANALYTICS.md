# Viewer Analytics System

Complete guide to real-time viewer tracking and analytics.

---

## 📊 Overview

Track live auction viewership with:
- ✅ Real-time viewer count
- ✅ 1-minute snapshots (12 samples aggregated)
- ✅ Peak, average, minimum tracking
- ✅ Historical trend analysis
- ✅ Opt-in per auction
- ✅ 90-day data retention

---

## 🏗️ Architecture

### **2-Server Communication:**

```
Socket Server (Port 8081)
  │
  ├─ Every 5 sec: Sample viewer count (in memory)
  │  Track: min, max, sum
  │
  └─ Every 1 min: HTTP POST to Backend
     POST /api/v1/auctions/:id/analytics/snapshot
     
Backend Server (Port 8080)
  │
  ├─ Verify: Internal API key
  ├─ Check: auction.enableViewerAnalytics
  └─ Save: ViewerAnalytics collection (if enabled)
```

---

## 🔧 Configuration

### 1. Enable Analytics in Auction

**Location**: Auction Setup → Settings

**Toggle**: "Enable Viewer Analytics Tracking"

**Effect:**
- When enabled: Viewer counts stored every minute
- When disabled: No storage (still shows live count)

### 2. Environment Variables

**Backend (.env):**
```bash
INTERNAL_API_KEY=your-secret-key-12345
```

**Socket Server (.env):**
```bash
BACKEND_API_URL=http://localhost:8080
INTERNAL_API_KEY=your-secret-key-12345  # Same as backend!
```

---

## 📊 Data Model

### ViewerAnalytics Schema:

```javascript
{
  auction: ObjectId,           // Reference to auction
  timestamp: Date,             // Snapshot time
  viewerCount: Number,         // Current viewers at snapshot
  avgViewers: Number,          // Average over 1 minute (12 samples)
  peakViewers: Number,         // Peak in 1 minute
  minViewers: Number,          // Min in 1 minute
  sampleCount: Number,         // Number of 5-sec samples (usually 12)
  createdAt: Date,             // Auto (with TTL index)
  updatedAt: Date              // Auto
}

// TTL Index: Auto-delete after 90 days
```

---

## 🎯 How It Works

### Real-Time Count:

```
User connects → viewerCount++
  ↓
Broadcast to all viewers: viewerCountUpdate(newCount)
  ↓
All clients see "X watching" instantly
```

### Analytics Storage:

**Every 5 Seconds (In Memory):**
```javascript
// Socket server samples current count
samples: [420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475]
min: 420
max: 475
sum: 5340
```

**Every 1 Minute (HTTP to Backend):**
```javascript
// Calculate aggregates
avgViewers = 5340 / 12 = 445

// Send to backend
POST /api/v1/auctions/123/analytics/snapshot
{
  timestamp: "2025-10-21T14:15:00Z",
  viewerCount: 475,      // Current
  avgViewers: 445,       // Calculated
  peakViewers: 475,      // Max
  minViewers: 420,       // Min
  sampleCount: 12
}

// Backend saves if analytics enabled
```

---

## 📈 Accessing Analytics

### API Endpoint:

```
GET /api/v1/auctions/:id/analytics/viewers?timeRange=all

Response:
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
    ]
  }
}
```

### Dashboard Display:

**Location**: Auction Dashboard → "Viewer Analytics" (collapsible)

**Shows:**
- Peak viewers (highest count)
- Average viewers
- Minimum viewers
- Total duration
- Trend list (last 20 snapshots)
- Visual progress bars

**Features:**
- Lazy loading (only fetches on expand)
- Client-side calculation (saves server CPU)
- Refresh button
- Empty state if analytics disabled

---

## 💾 Storage Impact

### Per Auction (3 hours):
```
180 minutes = 180 snapshots
180 × 250 bytes = ~45 KB
```

### For 100 Auctions:
```
100 × 45 KB = ~4.5 MB
```

### With 90-Day TTL:
```
~90 auctions × 180 snapshots = 16,200 records
= ~4 MB total in database
```

**Impact**: ✅ Negligible (< 0.5% of typical database)

---

## 🚀 Performance

### Server Impact:

**Socket Server:**
- Memory: +1-2 MB (tracking data)
- CPU: +2-3% (sampling & aggregation)
- Network: 1 HTTP call per minute per active auction

**Backend Server:**
- Memory: Negligible
- CPU: < 1% (simple DB writes)
- Database: 1 write per minute per auction

**Total Impact**: ✅ Minimal (< 5% resource increase)

---

## 📊 Use Cases

### 1. Live Auction Monitoring
- See how many people are watching in real-time
- Gauge audience engagement
- Show social proof to bidders

### 2. Post-Auction Analysis
- Review peak viewership moments
- Analyze viewer drop-off
- Plan future auction timing

### 3. Marketing Insights
- Compare auction popularity
- Identify high-traffic periods
- Optimize scheduling

---

## 🔒 Security

### Internal API Key:
- Socket server must send correct key
- Prevents unauthorized analytics writes
- Shared secret between servers

### Per-Auction Toggle:
- Admins choose to enable/disable
- No storage if disabled
- Privacy-friendly

### Data Retention:
- Auto-delete after 90 days
- Minimal data collection
- GDPR-friendly (no personal data)

---

## 🧪 Testing

### 1. Enable Analytics:
```
Auction Setup → Settings → Enable "Viewer Analytics"
```

### 2. Test Real-Time:
```
Open live view → See "1 watching"
Open 2nd tab → See "2 watching"
Close tab → See "1 watching"
```

### 3. Test Storage:
```
Wait 1 minute
Check socket server logs: "📊 Analytics sent"
Check backend logs: "✅ Viewer snapshot saved"
Check MongoDB: vieweranalytics collection
```

### 4. Test Dashboard:
```
Go to Auction Dashboard
Click "Viewer Analytics" to expand
Should see: Peak, Avg, Min, Duration
Should see: Trend list
```

---

## 📚 Related Documentation

- [Live View Feature](./LIVE_VIEW.md)
- [Capacity Analysis](../05-performance/CAPACITY_ANALYSIS.md)
- [Two-Server Setup](../02-architecture/TWO_SERVER_SETUP.md)
- [Socket Events](../03-api/SOCKET_EVENTS.md)

---

**Analytics enabled!** Track your auction's reach! 📊

