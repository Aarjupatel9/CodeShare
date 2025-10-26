# Database Schema Documentation

## MongoDB Collections

---

## 📝 User & Document Models

### **usermodals**

Stores user account information and their pages.

```javascript
{
  _id: ObjectId,
  username: String (required),
  email: String (required, unique),
  password: String (required, bcrypt hashed),
  isVerified: Boolean (default: false),
  pages: [{
    pageId: ObjectId (ref: 'datamodels'),
    right: String // 'read', 'write', 'delete', 'owner'
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

---

### **datamodels**

Stores documents with version control.

```javascript
{
  _id: ObjectId,
  unique_name: String (required, indexed),
  data: String, // Legacy field
  dataVersion: [{
    time: Date (required),
    data: String, // Document content
    user: ObjectId
  }],
  files: [{
    name: String (required),
    url: String (required, AWS S3),
    key: String (required, S3 key),
    type: String (required, MIME type),
    others: Object // S3 metadata
  }],
  language: String,
  access: String (required), // 'public' or 'private'
  sharedAccess: [{
    user: ObjectId (ref: 'usermodels'),
    right: String // 'read', 'write', 'delete', 'owner'
  }],
  owner: ObjectId (ref: 'usermodels'),
  isDeleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `unique_name`

**Version Control:**
- Keeps last 30 versions
- Each version has timestamp and user ID
- Versions are never deleted (soft delete on document)

---

## 🏏 Auction Models

### **auctionmodels**

Stores auction configuration and state.

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  organizer: String (required),
  password: String (required, bcrypt hashed),
  state: String (default: 'setup'), // 'setup', 'running', 'completed'
  budgetPerTeam: Number (default: 0),
  maxTeamMember: Number (default: 0),
  minTeamMember: Number (default: 0),
  auctionLiveEnabled: Number (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` (unique)

**Methods:**
- `comparePassword(candidatePassword)` - Verify password (bcrypt)

**Hooks:**
- `pre('save')` - Hash password before saving

---

### **auctionteammodels**

Stores teams participating in auction.

```javascript
{
  _id: ObjectId,
  name: String (required),
  owner: String,
  auction: ObjectId (required, ref: 'auctionmodels'),
  budget: Number (default: 0),
  remainingBudget: Number (default: 0),
  logo: {
    data: String,         // base64 encoded WebP image
    mimeType: String,     // 'image/webp'
    filename: String,     // Original filename
    size: Number,         // File size in bytes (<50KB)
    publicPath: String,   // '/team-logos/:teamId.webp'
    uploadedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ auction: 1, name: 1 }` (unique composite)

**Logo Storage:**
- Stored as base64 in MongoDB
- Cached in `/backend/public/team-logos/`
- Public URL: `/api/public/team-logos/:teamId`

---

### **auctionplayermodels**

Stores player information for auction.

```javascript
{
  _id: ObjectId,
  name: String (required),
  playerNumber: String (required),
  contactNumber: String,
  shift: String,
  role: String (required), // 'Batsman', 'Bowler', 'All-rounder', 'WK'
  bowlingHand: String,
  bowlingType: String,
  battingHand: String,
  battingPossition: String,
  battingType: String,
  teamCode: String,
  team: ObjectId (ref: 'auctionteammodels'),
  auction: ObjectId (required, ref: 'auctionmodels'),
  auctionSet: ObjectId (ref: 'auctionsetmodels'),
  marquee: Boolean (default: false),
  category: String,
  auctionStatus: String, // 'idle', 'bidding', 'sold', 'unsold'
  soldNumber: Number (auto-incremented),
  basePrice: Number (in rupees),
  soldPrice: Number,
  commnets: String,
  applicationLink: String,
  businessUnit: String,
  bidding: [{
    team: ObjectId (ref: 'auctionteammodels'),
    price: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ auction: 1, playerNumber: 1 }` (unique composite)

**Hooks:**
- `pre('save')` - Auto-increment soldNumber when sold
- `pre('findOneAndUpdate')` - Update soldNumber on status change
- `pre('updateOne')` - Prevent updates to sold players

---

### **auctionsetmodels**

Stores auction sets (grouping of players).

```javascript
{
  _id: ObjectId,
  name: String (required),
  order: Number,
  state: String (default: 'idle'), // 'idle', 'running', 'completed'
  auction: ObjectId (required, ref: 'auctionmodels'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ auction: 1, name: 1 }` (unique composite)

**Special Sets:**
- "unsold" set auto-created when all sets completed
- Players moved from 'unsold' status to 'unsold' set

---

## 📊 Relationships

```
User (1) ──────── (*) Documents
                      │
                      ├── (1) Document ──── (*) Versions
                      └── (1) Document ──── (*) Files

Auction (1) ──────── (*) Teams
Auction (1) ──────── (*) Players
Auction (1) ──────── (*) Sets

Team (1) ─────────── (*) Players
Set (1) ──────────── (*) Players
```

---

## 💾 Storage Strategy

### **Document Content**
- **Location**: MongoDB
- **Format**: HTML string
- **Versioning**: Last 30 versions kept
- **Size**: Unlimited (practical limit ~16MB per document)

### **Document Files**
- **Location**: AWS S3
- **Size Limit**: 20MB per file
- **Types**: Any file type
- **Access**: Private (owner only)

### **Team Logos**
- **Primary**: MongoDB (base64, <50KB)
- **Cache**: `/backend/public/team-logos/` (binary WebP)
- **Serving**: Public endpoint (no auth)
- **Format**: WebP (optimized)

---

## 🔒 Access Control

### **Documents**
```javascript
access: 'public' | 'private'

sharedAccess: [{
  user: ObjectId,
  right: 'read' | 'write' | 'delete' | 'owner'
}]
```

### **Auctions**
- Password-protected
- Owner can enable public live view
- Separate session tokens

---

## 🔍 Indexes & Performance

### **Frequently Queried Fields**

| Collection | Indexed Fields | Reason |
|------------|----------------|--------|
| usermodals | `email` | Login lookup |
| datamodels | `unique_name` | Document retrieval |
| auctionteammodels | `{auction, name}` | Team lookup |
| auctionplayermodels | `{auction, playerNumber}` | Player lookup |
| auctionsetmodels | `{auction, name}` | Set lookup |

---

## 📈 Data Growth Estimates

### **Typical Usage (1 year)**

```
Users:            1,000 users
Documents:        10,000 documents
  - Size:         ~500MB (with versions)
  - Files:        ~5GB (S3)

Auctions:         50 auctions
Teams:            500 teams
  - Logos:        ~25MB (MongoDB)
  - Cache:        ~25MB (public folder)
Players:          5,000 players
  - Size:         ~50MB

Total MongoDB:    ~575MB
Total S3:         ~5GB
Total Cache:      ~25MB
```

---

## 🔄 Migration & Backup

### **MongoDB Atlas**
- Automatic backups (daily)
- Point-in-time recovery
- Cross-region replication

### **Backup Strategy**
```bash
# Export all collections
mongodump --uri="mongodb+srv://..." --out=backup/

# Export specific collection
mongodump --uri="..." --collection=datamodels --out=backup/

# Restore
mongorestore --uri="..." backup/
```

---

## 🚀 Optimization

### **Current Optimizations**
- Indexed fields for fast lookups
- Version limit (30 versions)
- Logo caching (3-tier)
- Aggregation pipelines for complex queries

### **Future Optimizations**
- [ ] Archive old document versions
- [ ] Pagination for large lists
- [ ] Search indexes (text search)
- [ ] Sharding for large datasets

---

## 📖 Related Documentation

- [System Design](SYSTEM_DESIGN.md) - Architecture diagrams
- [API Reference](../03-api/API_RESTRUCTURE.md) - API endpoints
- [Getting Started](../01-getting-started/SETUP_COMPLETE.md) - Setup guide

---

Last Updated: October 18, 2025

