# Auction Index Migration Guide

## Overview

This document provides manual steps to fix the auction name uniqueness constraint in the database.

### Problem
- **Before**: Auction names were globally unique (across all users)
- **After**: Auction names are unique per organizer (each user can have their own "test1", "IPL 2025", etc.)

### Changes Made
- ✅ Updated `backend/models/auctionModel.js` - Removed global unique constraint
- ✅ Updated `backend/controllers/v1/auctionController.js` - Check uniqueness per organizer
- ✅ Updated `backend/controllers/auctionController.js` - Check uniqueness per organizer
- ✅ Added compound index: `(name + organizer)` for uniqueness per user

---

## Migration Steps

### Option 1: Automated Script (Recommended)

**Prerequisites:**
- MongoDB must be running
- Node.js installed

**Steps:**

1. **Start MongoDB** (if using Docker):
   ```bash
   cd /path/to/CodeShare
   docker-compose up -d mongodb
   ```

2. **Run migration script**:
   ```bash
   cd backend
   node scripts/fix-auction-unique-index.js
   ```

3. **Expected output**:
   ```
   Connecting to MongoDB...
   ✅ Connected to MongoDB
   
   📋 Current indexes:
   { ... }
   
   🗑️  Dropping old unique index on "name" field...
   ✅ Successfully dropped old "name" index
   
   ✨ Ensuring compound unique index on (name + organizer)...
   ✅ Compound unique index created/verified
   
   📋 Final indexes:
   { ... }
   
   ✅ Migration completed successfully!
   ```

4. **Restart your application**:
   ```bash
   docker-compose restart backend
   # or
   npm restart
   ```

---

### Option 2: Manual MongoDB Commands

**Using MongoDB Shell:**

1. **Connect to MongoDB**:
   ```bash
   # If using Docker
   docker exec -it <mongodb-container-name> mongosh
   
   # Or connect directly
   mongosh mongodb://localhost:27017/code_share
   ```

2. **Switch to database**:
   ```javascript
   use code_share
   ```

3. **Check current indexes**:
   ```javascript
   db.auctionmodels.getIndexes()
   ```

4. **Drop old unique index**:
   ```javascript
   db.auctionmodels.dropIndex("name_1")
   ```

5. **Create new compound unique index**:
   ```javascript
   db.auctionmodels.createIndex(
     { name: 1, organizer: 1 }, 
     { unique: true, name: "name_organizer_unique" }
   )
   ```

6. **Verify indexes**:
   ```javascript
   db.auctionmodels.getIndexes()
   ```

7. **Exit MongoDB shell**:
   ```javascript
   exit
   ```

---

### Option 3: MongoDB Compass (GUI)

1. **Connect to database** using MongoDB Compass
   - Connection string: `mongodb://localhost:27017/code_share`

2. **Navigate to**:
   - Database: `code_share`
   - Collection: `auctionmodels`
   - Tab: `Indexes`

3. **Drop old index**:
   - Find index named `name_1`
   - Click trash icon to delete

4. **Create new index**:
   - Click "CREATE INDEX"
   - Fields:
     ```json
     {
       "name": 1,
       "organizer": 1
     }
     ```
   - Options:
     - ✅ Check "Create unique index"
     - Name: `name_organizer_unique`
   - Click "CREATE"

5. **Verify**:
   - Should see new index `name_organizer_unique` in list

---

### Option 4: Drop Collection (If No Important Data)

⚠️ **WARNING: This deletes ALL auction data!**

Only use if you don't have important auctions.

```bash
# MongoDB shell
use code_share
db.auctionmodels.drop()
exit

# Restart app - new indexes will be created automatically
docker-compose restart backend
```

---

## Verification

### Test the Fix

1. **Create auction with name "test1"** as User A
   - Should succeed ✅

2. **Create auction with name "test1"** as User B
   - Should succeed ✅ (different organizer)

3. **Create another auction with name "test1"** as User A
   - Should fail ❌ (duplicate for same organizer)
   - Error: "You already have an auction with this name. Please choose a different name."

### Check Indexes

**Via MongoDB Shell:**
```javascript
use code_share
db.auctionmodels.getIndexes()
```

**Expected output:**
```json
[
  {
    "v": 2,
    "key": { "_id": 1 },
    "name": "_id_"
  },
  {
    "v": 2,
    "key": { "name": 1, "organizer": 1 },
    "name": "name_organizer_unique",
    "unique": true
  }
]
```

**Should NOT see:** `name_1` index

---

## Troubleshooting

### Error: "Index already exists with different options"

**Solution:**
```bash
# Force drop and recreate
db.auctionmodels.dropIndex("name_1")
db.auctionmodels.reIndex()
```

### Error: "Cannot drop index: namespace not found"

**Cause:** Index doesn't exist or collection is empty

**Solution:** Just restart the app - new index will be created automatically

### Migration script fails to connect

**Check:**
1. Is MongoDB running?
   ```bash
   docker ps | grep mongo
   # or
   sudo systemctl status mongod
   ```

2. Is `MONGODB_URI` correct in `.env` file?

3. Try manual connection:
   ```bash
   mongosh $MONGODB_URI
   ```

---

## Rolling Back (If Needed)

If you need to revert to global unique names:

1. **Update schema** (`backend/models/auctionModel.js`):
   ```javascript
   name: {
     type: String,
     required: true,
     unique: true,  // Add back
   }
   ```

2. **Remove compound index**:
   ```javascript
   // Comment out or remove this line
   // auctionSchema.index({ name: 1, organizer: 1 }, { unique: true });
   ```

3. **Drop compound index**:
   ```bash
   db.auctionmodels.dropIndex("name_organizer_unique")
   ```

4. **Restart app** - global unique index will be recreated

---

## Related Files

- `backend/models/auctionModel.js` - Schema definition
- `backend/controllers/v1/auctionController.js` - New API controller
- `backend/controllers/auctionController.js` - Legacy controller
- `backend/scripts/fix-auction-unique-index.js` - Migration script
- `frontend/src/auction/AuctionHome.js` - Updated UI

---

## Notes

- Migration is **one-time only**
- After migration, the constraint works automatically
- No code changes needed after running migration
- Safe to run migration script multiple times (idempotent)
- Compound index provides better data integrity than global unique

---

## Support

If you encounter issues:
1. Check MongoDB logs
2. Verify connection string
3. Ensure user has database permissions
4. Check if collection has data conflicts

For questions, refer to the main project documentation or create an issue.

