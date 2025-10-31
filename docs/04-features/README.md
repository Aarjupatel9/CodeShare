# Features Documentation

Comprehensive guides for all CodeShare features.

---

## 🎯 Auction Features

### Auction Bidding
Complete guide to the live bidding system:
- Set-based auction flow
- Real-time bidding interface
- Admin controls
- Player management
- Sold/Unsold handling
- See [API Usage Guide](../03-api/API_USAGE.md) for details

### [Live View](./LIVE_VIEW.md)
Public spectator page features:
- Real-time viewer count
- Current bidding display
- Team leaderboard
- Recent sales feed
- Team rosters with search
- Player search functionality

### [Viewer Analytics](./VIEWER_ANALYTICS.md)
Track and analyze viewership:
- Real-time viewer count
- 1-minute snapshots
- Peak/average/minimum tracking
- Historical trend analysis
- Analytics dashboard

---

## 👥 Team Management

### Teams
- Create unlimited teams
- Set budget per team
- Upload team logos
- Track remaining budget
- View team rosters

### Team Logos
- Upload as images
- Stored in MongoDB + public folder
- Cached for performance
- Automatic cleanup

---

## 🎯 Player Management

### Players
- Excel import support
- Manual player addition
- Bulk operations
- Set assignment
- Role categorization

### Player Search
- Search by name or number
- Filter by status (sold/unsold/pending)
- Filter by team
- Real-time filtering

---

## 📊 Sets System

### Auction Sets
- Create multiple sets
- Assign players to sets
- Track set progress
- Set-based bidding flow

---

## 📝 Document Editor

### Collaboration
- Real-time editing
- Syntax highlighting
- Multiple editors
- Auto-save
- Version history

---

## 🔔 Real-Time Updates

### Socket.IO Events:
- Player bidding updates
- Player sold notifications
- Viewer count changes
- Document synchronization

---

## 📚 Detailed Guides

Each feature has its own detailed documentation:

- [LIVE_VIEW.md](./LIVE_VIEW.md) - Live view features
- [VIEWER_ANALYTICS.md](./VIEWER_ANALYTICS.md) - Analytics tracking

**Note**: Auction bidding, team management, and player management features are documented in the [API Usage Guide](../03-api/API_USAGE.md) and [System Architecture](../02-architecture/).

---

**Explore the features!** 🚀

