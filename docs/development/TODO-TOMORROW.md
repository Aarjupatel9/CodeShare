# 📋 TODO for Tomorrow

## 🔴 URGENT: Live View API Issues

### 1. **Leaderboard API** 🏆
**Problem:**
- API not returning or displaying data correctly
- Teams not showing in leaderboard

**Files to Check:**
- `backend/controllers/v1/auctionStatsController.js` - `getAuctionLeaderboard` function
- `frontend/src/auction/AuctionLiveView.js` - Line ~393-430

**Debug Steps:**
1. Check if backend API is returning data: `GET /api/v1/auctions/:id/leaderboard`
2. Verify teams have sold players (leaderboard only shows teams with purchases)
3. Check response structure matches frontend expectations
4. Test with actual auction data

**Expected API Response:**
```javascript
{
  success: true,
  data: [
    {
      _id: "teamId",
      name: "Team Name",
      logo: {...},
      budgetSpent: 8550000,
      playerCount: 8,
      remainingBudget: 1450000,
      ...
    }
  ]
}
```

---

### 2. **Recent Sales API** ✅
**Problem:**
- Sold players not showing in Recent Sales section
- Team name showing as "Unknown Team"

**Files to Check:**
- `backend/controllers/v1/auctionStatsController.js` - `getRecentSoldPlayers` function (Line ~190)
- `frontend/src/auction/AuctionLiveView.js` - Line ~462-490

**Current Debug:**
- Added `console.log(teamId)` in `getTeamName` function (line 155)
- Changed to use `getTeamName(player.team)` instead of `player.team?.name`

**Questions to Answer:**
1. Is `player.team` returning an ID (string) or populated object?
2. Is the `.populate('team', 'name logo')` working in backend?
3. Are there any sold players in the database?

**Backend Code to Review:**
```javascript
// Line 217-220 in auctionStatsController.js
const recentSold = await AuctionPlayerModel.find({ 
  auction: id,
  auctionStatus: 'sold'
})
  .populate('team', 'name logo')  // ← Is this working?
  .sort({ soldNumber: -1 })
  .limit(limit)
```

---

### 3. **UI Adjustments** 🎨
**Location:** Live View Page (`frontend/src/auction/AuctionLiveView.js`)

**Changes Needed:**
- [ ] Minor layout adjustments (details to be discussed)
- [ ] Spacing/alignment tweaks
- [ ] Responsive improvements if needed

---

## 🛠️ Team Logo Cleanup/Load Script

### **Task:** Create utility script for team logos

**Purpose:**
- Cleanup old/orphaned logo files from `backend/public/uploads/teams/`
- Migrate existing team logos from AWS S3 to local storage (if needed)
- Load/sync logos from FileModel to public folder

**Script Location:** 
`backend/scripts/teamLogoCleanup.js` (to be created)

**Features Needed:**
1. **Cleanup:**
   - Remove logo files for deleted teams
   - Remove duplicate/old logo files
   - Clean up files not in database

2. **Migration (if needed):**
   - Migrate logos from AWS S3 to local storage
   - Update `logoUrl` field in AuctionTeamModel
   - Store base64 in FileModel as backup

3. **Sync:**
   - Sync FileModel records with actual files
   - Regenerate missing files from FileModel base64 data
   - Update missing FileModel records from existing files

**Files to Reference:**
- `backend/controllers/auctionController.js` - `saveTeamLogo` function (line ~650)
- `backend/models/fileModel.js` - FileModel schema
- `backend/models/auctionTeamModel.js` - Team model with logoUrl field

**Example Script Structure:**
```javascript
// backend/scripts/teamLogoCleanup.js
const fs = require('fs');
const path = require('path');
const AuctionTeamModel = require('../models/auctionTeamModel');
const FileModel = require('../models/fileModel');

async function cleanupTeamLogos() {
  // 1. Get all teams
  // 2. Get all files in uploads/teams/
  // 3. Remove files not matching any team
  // 4. Verify FileModel records
  // 5. Log results
}

async function syncLogosFromDatabase() {
  // Regenerate files from FileModel base64 data
}

async function syncLogosToDatabase() {
  // Create FileModel records from existing files
}
```

---

## 📝 Notes

### Current State:
- ✅ Live view redesign complete
- ✅ Quick links in navbar added
- ✅ Config loading optimized
- ✅ Team logo storage implemented (database + public folder)
- ⚠️ APIs need debugging
- ⚠️ Logo cleanup script needed

### Testing Checklist:
- [ ] Test leaderboard with auction that has sold players
- [ ] Test recent sales with recent auction activity
- [ ] Verify team logos display correctly
- [ ] Check console for errors
- [ ] Test on mobile and desktop

---

## 🔍 Quick Reference

**Backend API Endpoints:**
- Leaderboard: `GET /api/v1/auctions/:id/leaderboard`
- Recent Sales: `GET /api/v1/auctions/:id/recent-sold?limit=10`

**Key Files:**
- Backend: `backend/controllers/v1/auctionStatsController.js`
- Frontend: `frontend/src/auction/AuctionLiveView.js`
- Logo Storage: `backend/public/uploads/teams/`
- File Model: `backend/models/fileModel.js`

**Current Debug:**
- `console.log` added in `getTeamName` function to debug team lookup

---

**Priority:** 🔴 High - Work on these issues tomorrow
**Estimated Time:** 2-3 hours for API fixes + 1 hour for cleanup script

