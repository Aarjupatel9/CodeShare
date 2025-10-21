# Live View API Optimization Plan

## 🎯 Goals

1. **Reduce data transfer size** - Only fetch required fields
2. **Reduce API calls** - Merge multiple APIs into one
3. **Improve performance** - Faster page load and updates
4. **Maintain flexibility** - Keep individual APIs available for other uses

---

## 📊 Current State Analysis

### Current API Calls in Live View:

```javascript
// 1. Get full auction data (LARGE response)
AuctionService.getPublicAuctionDetails({ auctionId })
// Returns: auction, teams, players, sets, maps

// 2. Get leaderboard
auctionApi.getAuctionLeaderboard(auctionId)
// Returns: [{_id, name, logo, budgetSpent, playerCount, ...}]

// 3. Get recent sold players
auctionApi.getRecentSoldPlayers(auctionId, 10)
// Returns: [{_id, name, playerNumber, soldPrice, team}]
```

**Total:** 3 API calls on page load + Socket.IO connection

---

## 🚀 Proposed Solution

### **Option 1: Unified Live View API** (RECOMMENDED)

Create a single optimized endpoint specifically for live view that returns only what's needed.

#### New Endpoint:
```
GET /api/v1/auctions/:id/live-data
```

#### Response Structure:
```javascript
{
  success: true,
  data: {
    // Minimal auction info
    auction: {
      _id,
      name,
      state,
      auctionLiveEnabled,
      createdAt
    },
    
    // Teams with only display fields
    teams: [{
      _id,
      name,
      logoUrl,
      budget,
      remainingBudget
    }],
    
    // Leaderboard (sorted by spending)
    leaderboard: [{
      teamId,
      teamName,
      logoUrl,
      playerCount,
      budgetSpent,
      remainingBudget
    }],
    
    // Recent sales (last 10)
    recentSales: [{
      playerId,
      playerName,
      playerNumber,
      teamId,
      teamName,
      soldPrice,
      soldNumber
    }],
    
    // Stats summary
    stats: {
      totalPlayers,
      soldPlayers,
      unsoldPlayers,
      pendingPlayers,
      totalTeams
    },
    
    // Team-Player mapping (for expanded view)
    teamPlayers: {
      "teamId1": [{
        _id,
        name,
        playerNumber,
        role,
        soldPrice
      }],
      "teamId2": [...]
    }
  }
}
```

**Benefits:**
- ✅ Single API call instead of 3
- ✅ ~70% smaller payload (only display fields)
- ✅ All data fetched at once (consistent state)
- ✅ Optimized queries on backend
- ✅ Easier to maintain

---

### **Option 2: Field Selection Query Parameter**

Add field selection to existing APIs.

#### Enhanced Endpoints:
```
GET /api/v1/auctions/:id/details?fields=_id,name,state,createdAt&includeTeams=name,logoUrl,budget&includePlayers=name,playerNumber,soldPrice,team
GET /api/v1/auctions/:id/leaderboard
GET /api/v1/auctions/:id/recent-sold?limit=10
```

**Benefits:**
- ✅ Flexible field selection
- ✅ Backward compatible
- ✅ Can reuse in other pages

**Drawbacks:**
- ❌ Still 3 API calls
- ❌ More complex query parameter parsing
- ❌ Harder to maintain

---

## 📝 Implementation Plan (Option 1 - RECOMMENDED)

### Phase 1: Backend Implementation

#### 1. Create New Controller
**File:** `backend/controllers/v1/auctionLiveViewController.js`

```javascript
exports.getLiveViewData = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get auction (minimal fields)
    const auction = await AuctionModel.findById(id)
      .select('_id name state auctionLiveEnabled createdAt')
      .lean();
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }
    
    if (!auction.auctionLiveEnabled) {
      return res.status(403).json({
        success: false,
        message: "Live view is not enabled"
      });
    }
    
    // 2. Get teams (minimal fields)
    const teams = await AuctionTeamModel.find({ auction: id })
      .select('_id name logoUrl budget remainingBudget')
      .lean();
    
    // 3. Get player stats for leaderboard
    const playerStats = await AuctionPlayerModel.aggregate([
      { $match: { auction: auction._id, auctionStatus: 'sold' } },
      { 
        $group: {
          _id: "$team",
          playerCount: { $sum: 1 },
          budgetSpent: { $sum: { $toDouble: "$soldPrice" } }
        }
      }
    ]);
    
    // 4. Build leaderboard
    const leaderboard = teams
      .map(team => {
        const stats = playerStats.find(ps => 
          ps._id?.toString() === team._id.toString()
        );
        return {
          teamId: team._id,
          teamName: team.name,
          logoUrl: team.logoUrl,
          playerCount: stats?.playerCount || 0,
          budgetSpent: stats?.budgetSpent || 0,
          remainingBudget: team.remainingBudget || 0
        };
      })
      .sort((a, b) => b.budgetSpent - a.budgetSpent);
    
    // 5. Get recent sales (last 10)
    const recentSales = await AuctionPlayerModel.find({
      auction: id,
      auctionStatus: 'sold'
    })
      .populate('team', 'name')
      .select('_id name playerNumber soldPrice soldNumber')
      .sort({ soldNumber: -1 })
      .limit(10)
      .lean();
    
    const recentSalesFormatted = recentSales.map(player => ({
      playerId: player._id,
      playerName: player.name,
      playerNumber: player.playerNumber,
      teamId: player.team?._id,
      teamName: player.team?.name,
      soldPrice: player.soldPrice,
      soldNumber: player.soldNumber
    }));
    
    // 6. Get overall stats
    const allPlayers = await AuctionPlayerModel.find({ auction: id })
      .select('auctionStatus')
      .lean();
    
    const stats = {
      totalPlayers: allPlayers.length,
      soldPlayers: allPlayers.filter(p => p.auctionStatus === 'sold').length,
      unsoldPlayers: allPlayers.filter(p => p.auctionStatus === 'unsold').length,
      pendingPlayers: allPlayers.filter(p => p.auctionStatus === 'pending').length,
      totalTeams: teams.length
    };
    
    // 7. Get team-player mapping
    const teamPlayersData = await AuctionPlayerModel.find({
      auction: id,
      auctionStatus: 'sold',
      team: { $exists: true, $ne: null }
    })
      .select('_id name playerNumber role soldPrice team')
      .sort({ soldNumber: 1 })
      .lean();
    
    const teamPlayers = {};
    teams.forEach(team => {
      teamPlayers[team._id] = [];
    });
    
    teamPlayersData.forEach(player => {
      if (teamPlayers[player.team]) {
        teamPlayers[player.team].push({
          _id: player._id,
          name: player.name,
          playerNumber: player.playerNumber,
          role: player.role,
          soldPrice: player.soldPrice
        });
      }
    });
    
    // 8. Return unified response
    res.status(200).json({
      success: true,
      message: "Live view data retrieved successfully",
      data: {
        auction,
        teams,
        leaderboard,
        recentSales: recentSalesFormatted,
        stats,
        teamPlayers
      }
    });
    
  } catch (error) {
    console.error("Error in getLiveViewData:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};
```

#### 2. Add Route
**File:** `backend/routes/v1/auctions.route.js`

```javascript
const { getLiveViewData } = require('../../controllers/v1/auctionLiveViewController');

// Add new route
router.get("/:id/live-data", getLiveViewData);
```

#### 3. Keep Existing APIs (for backward compatibility & other uses)
- `GET /api/v1/auctions/:id/leaderboard` - Keep for dashboard/other pages
- `GET /api/v1/auctions/:id/recent-sold` - Keep for dashboard/other pages
- `GET /api/auction/details` - Keep for other features

---

### Phase 2: Frontend Implementation

#### 1. Create New Service Method
**File:** `frontend/src/services/api/auctionApi.js`

```javascript
// New unified API call
export const getLiveViewData = async (auctionId) => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auctions/${auctionId}/live-data`
  );
  return response.json();
};
```

#### 2. Update AuctionLiveView Component
**File:** `frontend/src/auction/AuctionLiveView.js`

**Before:**
```javascript
useEffect(() => {
    getAuctionData();
    fetchLiveData();
}, [])

const getAuctionData = () => {
    AuctionService.getPublicAuctionDetails({ auctionId }).then(...)
}

const fetchLiveData = async () => {
    const recentRes = await auctionApi.getRecentSoldPlayers(auctionId, 10);
    const leaderRes = await auctionApi.getAuctionLeaderboard(auctionId);
}
```

**After:**
```javascript
useEffect(() => {
    fetchAllLiveData();
}, [])

const fetchAllLiveData = async () => {
    try {
        const res = await auctionApi.getLiveViewData(auctionId);
        
        if (res.success) {
            const { auction, teams, leaderboard, recentSales, stats, teamPlayers } = res.data;
            
            // Set all states at once
            setAuction(auction);
            setTeams(teams);
            setLeaderboardData(leaderboard);
            setRecentSoldPlayers(recentSales);
            
            // Build players array from teamPlayers for stats
            const allPlayers = Object.values(teamPlayers).flat();
            setPlayers(allPlayers);
            
            // Build teamPlayerMap for team expansion
            const teamMap = teams.map(team => ({
                team: team,
                players: teamPlayers[team._id] || [],
                totalSpent: leaderboard.find(lb => lb.teamId === team._id)?.budgetSpent || 0,
                remainingBudget: team.remainingBudget,
                avgPrice: teamPlayers[team._id]?.length > 0 
                    ? leaderboard.find(lb => lb.teamId === team._id)?.budgetSpent / teamPlayers[team._id].length 
                    : 0
            }));
            setTeamPlayerMap(teamMap);
            
            setIsLinkValid(true);
        }
    } catch (error) {
        console.error('Error fetching live data:', error);
        toast.error("Failed to load auction data");
        setIsLinkValid(false);
    }
};
```

#### 3. Update Socket Handler
```javascript
socket.on("playerSoldUpdate", (message) => {
    toast.success(message);
    fetchAllLiveData(); // Refresh all data with single API call
});
```

---

## 📈 Performance Improvements

### Before Optimization:
```
API Call 1: getPublicAuctionDetails
  - Response Size: ~500KB (full auction, all teams, all players, all sets)
  - Time: ~800ms

API Call 2: getAuctionLeaderboard
  - Response Size: ~5KB
  - Time: ~150ms

API Call 3: getRecentSoldPlayers
  - Response Size: ~3KB
  - Time: ~120ms

Total Time: ~1070ms
Total Size: ~508KB
API Calls: 3
```

### After Optimization:
```
API Call: getLiveViewData
  - Response Size: ~50KB (only display fields)
  - Time: ~400ms (optimized queries)

Total Time: ~400ms
Total Size: ~50KB
API Calls: 1

Improvement:
⚡ 63% faster (~670ms saved)
📦 90% smaller payload (~458KB saved)
🔌 67% fewer API calls (2 fewer calls)
```

---

## 🔧 Additional Optimizations

### 1. Add Caching (Optional)
```javascript
// Cache live data for 5 seconds
const CACHE_DURATION = 5000;
let cacheTimestamp = 0;
let cachedData = null;

const fetchAllLiveData = async (forceRefresh = false) => {
    const now = Date.now();
    
    if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        // Use cached data
        updateStatesFromCache(cachedData);
        return;
    }
    
    // Fetch fresh data
    const res = await auctionApi.getLiveViewData(auctionId);
    cachedData = res.data;
    cacheTimestamp = now;
    updateStatesFromCache(cachedData);
};
```

### 2. Implement Incremental Updates via Socket.IO
Instead of refreshing all data on player sold, send only the changed data:

```javascript
// Backend: Send delta updates
socket.emit('liveDataUpdate', {
    type: 'playerSold',
    player: {...},
    updatedLeaderboard: [...],
    updatedStats: {...}
});

// Frontend: Merge delta updates
socket.on('liveDataUpdate', (update) => {
    if (update.type === 'playerSold') {
        // Update only changed data
        setRecentSoldPlayers(prev => [update.player, ...prev.slice(0, 9)]);
        setLeaderboardData(update.updatedLeaderboard);
        // ... update other states
    }
});
```

---

## 🧪 Testing Plan

### 1. Unit Tests
- [ ] Test `getLiveViewData` with various auction states
- [ ] Test with no sold players
- [ ] Test with no teams
- [ ] Test field selection accuracy

### 2. Integration Tests
- [ ] Test API response structure
- [ ] Test response time < 500ms
- [ ] Test payload size < 100KB
- [ ] Test with large auctions (100+ players)

### 3. Frontend Tests
- [ ] Test single API call on mount
- [ ] Test data mapping to states
- [ ] Test Socket.IO refresh
- [ ] Test error handling

---

## 📋 Migration Checklist

### Backend:
- [ ] Create `auctionLiveViewController.js`
- [ ] Implement `getLiveViewData` function
- [ ] Add route in `auctions.route.js`
- [ ] Test endpoint with Postman/Thunder Client
- [ ] Keep existing APIs (backward compatibility)

### Frontend:
- [ ] Add `getLiveViewData` to `auctionApi.js`
- [ ] Update `AuctionLiveView.js` to use new API
- [ ] Remove old API calls (`getPublicAuctionDetails`, etc.)
- [ ] Update Socket.IO handler
- [ ] Test in development
- [ ] Test error scenarios

### Testing:
- [ ] Load test with multiple concurrent users
- [ ] Verify all data displays correctly
- [ ] Check console for errors
- [ ] Verify Socket.IO updates work
- [ ] Test on slow network (throttle to 3G)

---

## 🎯 Expected Outcomes

1. **Faster Page Load**: 400ms vs 1070ms (~63% faster)
2. **Smaller Payload**: 50KB vs 508KB (~90% reduction)
3. **Fewer API Calls**: 1 vs 3 (67% reduction)
4. **Better User Experience**: Instant loading, smooth updates
5. **Lower Server Load**: Fewer queries, optimized joins
6. **Easier Maintenance**: Single endpoint for live view

---

## 🔄 Rollback Plan

If issues arise:
1. Keep old API calls commented in code
2. Add feature flag: `USE_UNIFIED_LIVE_API`
3. Quick rollback by toggling flag
4. Monitor error logs and performance metrics

---

## 📅 Timeline

- **Day 1**: Backend implementation + testing (4 hours)
- **Day 2**: Frontend implementation + integration (3 hours)
- **Day 3**: Testing + bug fixes (2 hours)
- **Total**: ~9 hours for complete optimization

---

## 💡 Future Enhancements

1. **GraphQL**: Consider GraphQL for even more flexible field selection
2. **Server-Side Caching**: Redis cache for frequently accessed data
3. **CDN**: Cache static responses at CDN level
4. **WebSocket Full Duplex**: Real-time bidirectional updates
5. **Pagination**: For team players if teams have 50+ players

