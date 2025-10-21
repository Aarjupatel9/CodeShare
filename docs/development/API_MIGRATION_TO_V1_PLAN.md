# API Migration to V1 - Complete Plan

## 🎯 Objective

Migrate all legacy routes to v1 structure for:
- ✅ Better API organization
- ✅ RESTful standards
- ✅ Production-ready structure
- ✅ Easier maintenance
- ✅ API versioning support

---

## 📊 Current State Analysis

### Backend Routes Structure:

```
backend/routes/
├── auctionRoute.js        ← LEGACY (17 endpoints)
├── authRoute.js           ← LEGACY (5 endpoints)
├── userRoute.js           ← LEGACY (6 endpoints)
├── public.route.js        ← Keep (public assets)
└── v1/
    ├── index.js           ← Main router
    ├── auctions.route.js  ← NEW V1 (already migrated)
    ├── auction-teams.route.js
    ├── auction-players.route.js
    ├── auction-sets.route.js
    ├── auth.route.js      ← NEW V1 (check if complete)
    └── documents.route.js
```

### Backend Controllers Structure:

```
backend/controllers/
├── auctionController.js   ← LEGACY (all auction logic)
├── authController.js      ← LEGACY (auth logic)
├── userController.js      ← LEGACY (document/data logic)
├── publicController.js    ← Keep
└── v1/
    ├── auctionController.js
    ├── auctionLiveViewController.js
    ├── auctionPlayerController.js
    ├── auctionSetController.js
    ├── auctionStatsController.js
    ├── auctionTeamController.js
    └── documentController.js
```

---

## 🔍 API Endpoint Mapping

### 1. Auction APIs

#### Legacy Routes (`/api/auction/*`):
```javascript
POST /api/auction/login              → /api/v1/auctions/:id/login ✅ EXISTS
POST /api/auction/logout             → /api/v1/auctions/:id/logout ✅ EXISTS
POST /api/auction/public/get         → /api/v1/auctions/public/:id ✅ EXISTS (not used)
POST /api/auction/get                → /api/v1/auctions/:id ✅ EXISTS
POST /api/auction/create             → POST /api/v1/auctions ✅ EXISTS
POST /api/auction/update             → PUT /api/v1/auctions/:id ✅ EXISTS
POST /api/auction/dataImports        → ❌ MISSING in v1

// Team APIs
POST /api/auction/team/create        → POST /api/v1/auctions/:id/teams ✅ EXISTS
POST /api/auction/team/update        → PUT /api/v1/auctions/:id/teams/:teamId ✅ EXISTS
POST /api/auction/team/remove        → DELETE /api/v1/auctions/:id/teams/:teamId ✅ EXISTS
POST /api/auction/team/logo/upload   → POST /api/v1/auctions/:id/teams/:teamId/logo ✅ EXISTS

// Player APIs
POST /api/auction/player/create      → POST /api/v1/auctions/:id/players ✅ EXISTS
POST /api/auction/player/remove      → DELETE /api/v1/auctions/:id/players ✅ EXISTS
POST /api/auction/player/update      → PUT /api/v1/auctions/:id/players ✅ EXISTS

// Set APIs
POST /api/auction/set/create         → POST /api/v1/auctions/:id/sets ✅ EXISTS
POST /api/auction/set/update         → PUT /api/v1/auctions/:id/sets/:setId ✅ EXISTS
POST /api/auction/set/remove         → DELETE /api/v1/auctions/:id/sets/:setId ✅ EXISTS
```

**Status**: ✅ **Almost complete** - Only missing `dataImports`

---

### 2. Auth APIs

#### Legacy Routes (`/api/auth/*`):
```javascript
POST /api/auth/login                 → POST /api/v1/auth/login ❓ CHECK
POST /api/auth/register              → POST /api/v1/auth/register ❓ CHECK
POST /api/auth/forgetpassword        → POST /api/v1/auth/forgot-password ❓ CHECK
POST /api/auth/reset-password/:id/:token → POST /api/v1/auth/reset-password/:id/:token ❓ CHECK
POST /api/auth/checkUserLogInStatus  → GET /api/v1/auth/me ❓ CHECK
```

**Need to check**: If v1/auth.route.js has all these endpoints

---

### 3. User/Document APIs

#### Legacy Routes (`/api/data/*`):
```javascript
POST /api/data/getData               → GET /api/v1/documents/:slug ❓ CHECK
POST /api/data/saveData              → POST /api/v1/documents ❓ CHECK
POST /api/data/removeFile            → DELETE /api/v1/documents/:id ❓ CHECK
POST /api/data/p/getData             → (protected version)
POST /api/data/p/removePage          → DELETE /api/v1/documents/:id
POST /api/data/p/saveData            → (protected version)
POST /api/data/p/saveFile            → POST /api/v1/documents/:id/files
POST /api/data/p/removeFile          → DELETE /api/v1/documents/:id/files/:fileId
```

**Need to check**: If v1/documents.route.js has all these endpoints

---

## 📋 Migration Plan

### Phase 1: Analysis (Current)

- [x] Identify all legacy endpoints
- [x] Map to v1 equivalents
- [ ] Check which v1 endpoints already exist
- [ ] Identify missing v1 endpoints
- [ ] Analyze frontend usage

### Phase 2: Backend Migration

#### Step 1: Check V1 Coverage
```bash
# Compare legacy vs v1 routes
# Identify missing endpoints
```

#### Step 2: Add Missing V1 Endpoints
- Add `dataImports` to v1 if used
- Verify auth endpoints completeness
- Verify document endpoints completeness

#### Step 3: Keep Legacy Routes (Backward Compatibility)
- Don't delete legacy routes yet
- Add deprecation warnings
- Plan gradual migration

### Phase 3: Frontend Migration

#### Step 1: Create New Service Layer
```
frontend/src/services/
├── auctionService.jsx     ← LEGACY (keep for now)
├── authService.jsx        ← LEGACY (keep for now)
├── userService.jsx        ← LEGACY (keep for now)
└── api/                   ← NEW V1
    ├── apiClient.js       ✅ EXISTS
    ├── auctionApi.js      ✅ EXISTS
    ├── documentApi.js     ✅ EXISTS
    └── authApi.js         ❓ CHECK
```

#### Step 2: Gradual Migration
- Migrate one component at a time
- Test thoroughly
- Keep both services during migration
- Remove legacy after verification

---

## 🔍 Detailed Analysis Required

### 1. Check V1 Auth Routes

<function_calls>
<invoke name="read_file">
<parameter name="target_file">/Users/aarju.boda/Development/personal/CodeShare/backend/routes/v1/auth.route.js
