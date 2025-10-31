# API Usage Reference

**Author**: Aarju Patel  
**Last Updated**: October 31, 2025

---

## Overview

This document lists which pages and functionality use **Legacy API** (`/api/auth`, `/api/data`) versus **V1 API** (`/api/v1/*`).

---

## Legacy API Usage (`/api/auth`, `/api/data`)

### Authentication (Legacy)

**Service**: `frontend/src/services/authService.jsx`

**Endpoints Used**:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/checkUserLogInStatus`

**Pages Using Legacy Auth API**:
- `LoginComponent.jsx` - User login
- `RegisterComponent.jsx` - User registration
- `PrivateRoute.jsx` - Authentication check
- `AuctionDashboard.js` - Session verification
- `AuctionSetup.js` - Session verification
- `AuctionHome.js` - Session verification
- `UserProfilePage.jsx` - Session verification
- `systemService.jsx` - User status checks

---

### Documents (Legacy)

**Service**: `frontend/src/services/userService.jsx`

**Endpoints Used**:
- `POST /api/data/getData` - Public documents
- `POST /api/data/p/getData` - Private documents

**Pages Using Legacy Document API**:
- `MainPage.jsx` - Document editing and management
- `PublicPages.jsx` - Public document viewing

---

## V1 API Usage (`/api/v1/*`)

### Authentication (V1 - Password Reset Only)

**Service**: `frontend/src/services/api/authApi.js`

**Endpoints Used**:
- `POST /api/v1/auth/generate-reset-password-link`
- `GET /api/v1/auth/reset-password/:id/:token`
- `POST /api/v1/auth/update-password/:id/:token`

**Pages Using V1 Auth API**:
- `ForgetPasswordComponent.jsx` - Request password reset
- `ResetPasswordComponent.jsx` - Reset password form

**Note**: Login, register, and logout still use Legacy API.

---

### Auctions (V1)

**Service**: `frontend/src/services/api/auctionApi.js`

**Endpoints Used**: All auction endpoints under `/api/v1/auctions/*`

**Pages Using V1 Auction API**:
- `AuctionHome.js` - Auction listing and stats
- `AuctionDashboard.js` - Auction management
- `AuctionSetup.js` - Auction configuration
- `AuctionBidding.js` - Bidding interface
- `AuctionLiveView.js` - Public live view

**All auction functionality uses V1 API**.

---

### Documents (V1)

**Service**: `frontend/src/services/api/documentApi.js`

**Endpoints Used**: All document endpoints under `/api/v1/documents/*`

**Note**: Currently, document pages still use Legacy API. V1 document endpoints exist but are not yet integrated into frontend pages.

---

## Summary Table

| Feature | API Version | Service File | Status |
|---------|-------------|--------------|--------|
| **User Login** | Legacy | `authService.jsx` | ✅ Active |
| **User Register** | Legacy | `authService.jsx` | ✅ Active |
| **User Logout** | Legacy | `authService.jsx` | ✅ Active |
| **Session Check** | Legacy | `authService.jsx` | ✅ Active |
| **Password Reset** | V1 | `authApi.js` | ✅ Active |
| **Auction Management** | V1 | `auctionApi.js` | ✅ Active |
| **Team Management** | V1 | `auctionApi.js` | ✅ Active |
| **Player Management** | V1 | `auctionApi.js` | ✅ Active |
| **Bidding** | V1 | `auctionApi.js` | ✅ Active |
| **Live View** | V1 | `auctionApi.js` | ✅ Active |
| **Document Operations** | Legacy | `userService.jsx` | ✅ Active |
| **Document API (V1)** | V1 | `documentApi.js` | ⚠️ Available but not used |

---

## Migration Status

### ✅ Migrated to V1
- Password reset functionality
- All auction-related features
- Team and player management
- Bidding system

### ⏳ Still Using Legacy
- User authentication (login, register, logout)
- Document operations (edit, create, view)
- Session management

---

## Notes

- **Legacy APIs** are maintained for backward compatibility but may be deprecated in future versions.
- **V1 APIs** follow RESTful conventions and are the recommended approach for new features.
- Password reset is the only auth feature using V1 API; other auth operations still use Legacy.
- All auction functionality has been migrated to V1 API.

---

**Author**: Aarju Patel  
**Contact**: developer.codeshare@gmail.com  
**Last Updated**: October 31, 2025

