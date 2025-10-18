# API Restructuring Documentation

## Overview

This document outlines the major restructuring of the CodeShare API and frontend services implemented in the `feature/api-restructure` branch.

## Changes Summary

### 1. Backend API Restructuring

#### New RESTful API (v1)

The backend now has a **versioned RESTful API** structure at `/api/v1/`:

**Authentication Routes** (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/verify-token` - Verify JWT token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `GET/POST /api/v1/auth/reset-password/:id/:token` - Reset password

**Document Routes** (`/api/v1/documents`)
- `GET /api/v1/documents` - Get all user documents
- `GET /api/v1/documents/public/:slug` - Get public document
- `GET /api/v1/documents/:id` - Get document by ID
- `POST /api/v1/documents` - Create new document
- `PUT /api/v1/documents/:id` - Update document (add version)
- `DELETE /api/v1/documents/:id` - Delete document
- `GET /api/v1/documents/:id/versions` - Get document versions
- `POST /api/v1/documents/:id/files` - Upload file
- `DELETE /api/v1/documents/:id/files/:fileId` - Delete file

**Auction Routes** (`/api/v1/auctions`)
- `GET /api/v1/auctions` - Get all auctions
- `GET /api/v1/auctions/public/:id` - Get public auction
- `GET /api/v1/auctions/:id` - Get auction details
- `POST /api/v1/auctions` - Create auction
- `PUT /api/v1/auctions/:id` - Update auction
- `DELETE /api/v1/auctions/:id` - Delete auction
- `POST /api/v1/auctions/:id/login` - Login to auction
- `POST /api/v1/auctions/:id/logout` - Logout from auction

**Auction Team Routes** (`/api/v1/auctions/:auctionId/teams`)
- `GET /api/v1/auctions/:auctionId/teams` - Get all teams
- `POST /api/v1/auctions/:auctionId/teams` - Create team
- `PUT /api/v1/auctions/:auctionId/teams/:teamId` - Update team
- `DELETE /api/v1/auctions/:auctionId/teams/:teamId` - Delete team
- `POST /api/v1/auctions/:auctionId/teams/:teamId/logo` - Upload team logo

**Auction Player Routes** (`/api/v1/auctions/:auctionId/players`)
- `GET /api/v1/auctions/:auctionId/players` - Get all players
- `POST /api/v1/auctions/:auctionId/players` - Create players (batch)
- `PUT /api/v1/auctions/:auctionId/players` - Update players (batch)
- `DELETE /api/v1/auctions/:auctionId/players` - Delete players (batch)
- `POST /api/v1/auctions/:auctionId/players/import` - Import players from Excel

**Auction Set Routes** (`/api/v1/auctions/:auctionId/sets`)
- `GET /api/v1/auctions/:auctionId/sets` - Get all sets
- `POST /api/v1/auctions/:auctionId/sets` - Create set
- `PUT /api/v1/auctions/:auctionId/sets/:setId` - Update set
- `DELETE /api/v1/auctions/:auctionId/sets/:setId` - Delete set

#### Backward Compatibility

**Legacy routes are still available** for backward compatibility:
- `/api/auth/*` - Old authentication routes
- `/api/data/*` - Old document routes
- `/api/auction/*` - Old auction routes

### 2. Security Improvements

#### Auction Password Hashing
- **Before**: Auction passwords were stored in plain text
- **After**: Passwords are now hashed using bcrypt (salt rounds: 10)
- Added `comparePassword()` method to Auction model for secure comparison

#### JWT Token Expiry
- **Before**: Tokens had 114-year expiry (3600000000000ms)
- **After**: 
  - User tokens: 7 days
  - Auction tokens: 24 hours
  - Anonymous tokens: 24 hours

#### Environment-based Security
- Cookie `secure` flag now respects `NODE_ENV`
- Production mode enables secure cookies

### 3. Frontend Service Layer

#### New Centralized API Client

Created `/frontend/src/services/api/apiClient.js`:
- **Singleton pattern** - single configuration load
- **Automatic token handling** - includes credentials
- **Centralized error handling** - token expiration detection
- **Type-specific methods**: `get()`, `post()`, `put()`, `delete()`, `uploadFile()`

#### New API Services

**`authApi.js`**
- `login(credentials)`
- `register(userData)`
- `verifyToken()`
- `logout()`
- `forgotPassword(email)`

**`documentApi.js`**
- `getDocument(identifier, options)`
- `getDocuments()`
- `createDocument(data)`
- `updateDocument(identifier, data)`
- `deleteDocument(documentId)`
- `getDocumentVersions(identifier)`
- `uploadFile(documentId, formData)`
- `deleteFile(documentId, fileId)`

**`auctionApi.js`**
- All auction, team, player, and set operations
- Cleaner method signatures
- Proper REST conventions

### 4. Code Organization

#### Backend Controllers

New versioned controllers in `/backend/controllers/v1/`:
- `authController.js` (updated from legacy)
- `documentController.js` (refactored from userController)
- `auctionController.js` (core auction operations)
- `auctionTeamController.js` (team management)
- `auctionPlayerController.js` (player management)
- `auctionSetController.js` (set management)

#### Route Organization

```
backend/routes/v1/
├── index.js                  # Main v1 router
├── auth.route.js            # Auth routes
├── documents.route.js       # Document routes
├── auctions.route.js        # Auction routes
├── auction-teams.route.js   # Team routes (nested)
├── auction-players.route.js # Player routes (nested)
└── auction-sets.route.js    # Set routes (nested)
```

## Migration Guide

### For Frontend Developers

#### Using New API Services

**Before:**
```javascript
import userService from '../services/userService';

userService.getData(slug, time, flag, user)
  .then(res => { /* handle */ })
  .catch(err => { /* handle */ });
```

**After:**
```javascript
import { documentApi } from '../services/api';

documentApi.getDocument(slug, { version: time, flag, isPrivate: !!user })
  .then(res => { /* handle */ })
  .catch(err => { /* handle */ });
```

#### Authentication

**Before:**
```javascript
import authService from '../services/authService';

authService.login({ email, password })
  .then(res => { /* handle */ })
  .catch(err => { /* handle */ });
```

**After:**
```javascript
import { authApi } from '../services/api';

authApi.login({ email, password })
  .then(res => { /* handle */ })
  .catch(err => { /* handle */ });
```

### For Backend Developers

#### Creating New Endpoints

1. Add route in `/backend/routes/v1/[resource].route.js`
2. Create controller function in `/backend/controllers/v1/[resource]Controller.js`
3. Use proper HTTP methods (GET, POST, PUT, DELETE)
4. Return consistent response format:

```javascript
{
  success: true/false,
  message: "Description",
  data: { /* response data */ }
}
```

## Testing

### Backend API Endpoints

You can test the new API using curl or Postman:

```bash
# Test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test get documents (requires authentication)
curl -X GET http://localhost:8080/api/v1/documents \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

### Backward Compatibility

All old endpoints should still work:

```bash
# Old endpoint (still works)
curl -X POST http://localhost:8080/api/auth/login \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## Breaking Changes

### None (for now)

This restructuring maintains **full backward compatibility** with the old API. Both old and new endpoints work simultaneously.

### Future Deprecation Plan

1. **Phase 1** (Current): Both APIs available
2. **Phase 2** (3 months): Add deprecation warnings to old API
3. **Phase 3** (6 months): Remove old API endpoints

## Configuration

### Environment Variables

Ensure your `.env` files have:

**Backend `.env`:**
```env
NODE_ENV=development  # or production
PORT=8080
ALLOWED_ORIGIN=http://localhost:3000
TOKEN_SECRET=your_secret_key
MAX_FILE_SIZE=20000000
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:8080
```

## Benefits of This Restructuring

1. **RESTful Design**: Proper HTTP methods and resource-based URLs
2. **Better Organization**: Clear separation of concerns
3. **Scalability**: Easy to add new API versions (v2, v3, etc.)
4. **Security**: Improved password hashing and token management
5. **Maintainability**: Centralized API client reduces code duplication
6. **Developer Experience**: Clear, predictable API patterns
7. **Error Handling**: Consistent error responses across the API

## Next Steps

1. ✅ Create new API structure
2. ✅ Implement security improvements
3. ✅ Create centralized frontend API client
4. 🔲 Update frontend components to use new API
5. 🔲 Add API documentation (Swagger/OpenAPI)
6. 🔲 Add comprehensive testing
7. 🔲 Performance monitoring and optimization
8. 🔲 Add API rate limiting

## Support

For questions or issues, please contact the development team or create an issue in the repository.

---

**Last Updated**: October 18, 2025  
**Branch**: `feature/api-restructure`  
**Status**: In Progress

