# Project Structure

Complete file structure and organization of the CodeShare project.

---

## 📂 Root Directory

```
CodeShare/
├── frontend/                    # React SPA
├── backend/                     # Express API
├── socketServer/                # Socket.IO server
├── docs/                        # Documentation
├── docker-compose.yaml          # Multi-container setup
├── LICENSE                      # MIT License
└── README.md                    # Project overview
```

---

## 🎨 Frontend Structure

```
frontend/
├── public/
│   ├── config.json             # Runtime configuration
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   └── tinymce/                # TinyMCE assets
│
├── src/
│   ├── App.js                  # Main app component
│   ├── App.css                 # Global styles
│   ├── index.js                # Entry point
│   │
│   ├── pages/                  # Route components
│   │   ├── MainPage.jsx        # Document editor
│   │   ├── PrivatePages.jsx    # Auth wrapper
│   │   ├── PublicPages.jsx     # Public wrapper
│   │   ├── LoginComponent.jsx
│   │   ├── RegisterComponent.jsx
│   │   ├── ForgetPasswordComponent.jsx
│   │   └── TmceEditor.jsx      # TinyMCE wrapper
│   │
│   ├── services/               # API Layer
│   │   ├── api/                # New API clients
│   │   │   ├── apiClient.js    # Base HTTP client
│   │   │   ├── authApi.js      # Auth operations
│   │   │   ├── documentApi.js  # Document CRUD
│   │   │   ├── auctionApi.js   # Auction operations
│   │   │   └── index.js        # Exports
│   │   ├── authService.jsx     # Legacy auth
│   │   ├── userService.jsx     # Legacy user
│   │   ├── auctionService.jsx  # Legacy auction
│   │   └── systemService.jsx   # System utilities
│   │
│   ├── auction/                # Auction Features
│   │   ├── AuctionHome.js      # Auction list
│   │   ├── AuctionMain.js      # Auction dashboard
│   │   ├── AuctionDetailsManage.js  # Management
│   │   ├── AuctionBidding.js   # Bidding interface
│   │   ├── AuctionLiveUpdate.js     # Live view
│   │   ├── AuctionTeamView.jsx      # Team display
│   │   ├── generatePdf.jsx     # PDF export
│   │   ├── Utility.jsx         # Helpers
│   │   ├── Widgets.jsx         # UI components
│   │   ├── auction.css         # Styles
│   │   └── auction.theams.jsx  # Themes
│   │
│   ├── gamePlugin/             # Games Feature
│   │   ├── GamePage.jsx        # Game container
│   │   ├── games.json          # Game definitions
│   │   └── games/              # Individual games
│   │
│   ├── common/                 # Shared Components
│   │   ├── functions.jsx       # Utility functions
│   │   └── Modals.jsx          # Modal components
│   │
│   ├── context/                # React Context
│   │   └── UserContext.jsx     # User state
│   │
│   ├── hooks/                  # Custom Hooks
│   │   └── keyKeys.jsx         # Keyboard shortcuts
│   │
│   └── assets/                 # Static Assets
│       ├── svgs.jsx            # SVG icons
│       └── heart-beat-sound.mp3
│
├── build/                      # Production build
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind CSS config
├── Dockerfile                  # Container config
└── nginx.conf                  # Nginx config
```

---

## 🔧 Backend Structure

```
backend/
├── src/
│   └── app.js                  # Express application
│
├── routes/
│   ├── v1/                     # New RESTful Routes
│   │   ├── index.js            # Main v1 router
│   │   ├── auth.route.js       # Auth endpoints
│   │   ├── documents.route.js  # Document CRUD
│   │   ├── auctions.route.js   # Auction CRUD
│   │   ├── auction-teams.route.js
│   │   ├── auction-players.route.js
│   │   └── auction-sets.route.js
│   ├── public.route.js         # Public endpoints
│   ├── authRoute.js            # Legacy auth
│   ├── userRoute.js            # Legacy user
│   └── auctionRoute.js         # Legacy auction
│
├── controllers/
│   ├── v1/                     # New Controllers
│   │   ├── auctionController.js
│   │   ├── auctionTeamController.js
│   │   ├── auctionPlayerController.js
│   │   ├── auctionSetController.js
│   │   └── documentController.js
│   ├── publicController.js     # Public endpoints
│   ├── authController.js       # Auth logic
│   ├── userController.js       # User/document logic
│   └── auctionController.js    # Auction logic (legacy)
│
├── models/                     # Mongoose Models
│   ├── userModels.js           # User schema
│   ├── dataModels.js           # Document schema
│   ├── auctionModel.js         # Auction schema
│   ├── auctionTeamModel.js     # Team schema
│   ├── auctionPlayerModel.js   # Player schema
│   └── auctionSetModel.js      # Set schema
│
├── services/                   # Business Logic
│   ├── authService.js          # JWT, password hashing
│   ├── s3BucketService.js      # AWS S3 operations
│   └── imageService.js         # Image processing
│
├── middleware/                 # Middleware
│   ├── Authmiddleware.js       # User auth
│   └── AuctionMiddleware.js    # Auction auth
│
├── DB/
│   └── conn.js                 # MongoDB connection
│
├── public/                     # Static Files
│   └── team-logos/             # Cached team logos
│       └── .gitkeep
│
├── tests/                      # Test Suite
│   ├── setup.js                # Global test config
│   ├── helpers/
│   │   ├── testDb.js           # Test database
│   │   ├── authHelper.js       # Auth utilities
│   │   └── fixtures.js         # Test data
│   ├── unit/
│   │   └── services/
│   │       └── imageService.test.js
│   └── integration/
│       ├── auth.test.js
│       ├── documents.test.js
│       ├── auctions.test.js
│       ├── teams.test.js
│       ├── teamLogos.test.js
│       └── players.test.js
│
├── scripts/                    # Utility Scripts
│   └── cleanup-team-logos.js   # Cache cleanup
│
├── views/                      # EJS Templates
│   └── resetPassword.ejs       # Password reset page
│
├── server.js                   # Entry point
├── package.json                # Dependencies
├── jest.config.js              # Test configuration
├── Dockerfile                  # Container config
└── .env                        # Environment variables
```

---

## 🔌 Socket Server Structure

```
socketServer/
├── app.js                      # Socket.IO server
│   ├── Main IO (/socket/)      # Document sync
│   └── Auction IO (/auction/)  # Auction updates
│
├── socket_usage.log            # Usage logs
├── package.json
├── Dockerfile
└── .env
```

---

## 📚 Documentation Structure

```
docs/
├── README.md                   # Documentation index
│
├── api/                        # API Documentation
│   ├── API_RESTRUCTURE.md      # v1 API guide
│   └── TEAM_LOGO_SYSTEM.md     # Logo endpoints
│
├── architecture/               # System Architecture
│   ├── OVERVIEW.md             # Project overview
│   ├── DATABASE_SCHEMA.md      # MongoDB models
│   └── SYSTEM_DESIGN.md        # Architecture
│
├── development/                # Developer Guides
│   ├── GETTING_STARTED.md      # Setup guide
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── SESSION_SUMMARY.md
│
└── testing/                    # Testing Docs
    ├── TESTING_GUIDE.md        # How to test
    └── TESTS_SUMMARY.md        # Test results
```

---

## 🎯 Key Directories

### **Configuration Files**

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `.env` | Environment variables |
| `jest.config.js` | Test configuration |
| `tailwind.config.js` | CSS framework config |
| `docker-compose.yaml` | Multi-container setup |

### **Entry Points**

| File | Purpose |
|------|---------|
| `backend/server.js` | Backend entry |
| `frontend/src/index.js` | Frontend entry |
| `socketServer/app.js` | Socket entry |

### **Important Files**

| File | Purpose |
|------|---------|
| `backend/src/app.js` | Express app & routing |
| `frontend/src/App.js` | React routing |
| `backend/DB/conn.js` | Database connection |

---

## 📦 Node Modules Organization

### **Backend Dependencies**

**Core:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing

**Middleware:**
- `cors` - Cross-origin requests
- `cookie-parser` - Cookie handling
- `morgan` - HTTP logging
- `multer` - File uploads

**Services:**
- `@aws-sdk/client-s3` - S3 uploads
- `sharp` - Image processing
- `nodemailer` - Email sending
- `socket.io` - WebSockets

**Development:**
- `nodemon` - Auto-restart
- `jest` - Testing
- `supertest` - HTTP testing

### **Frontend Dependencies**

**Core:**
- `react` - UI library
- `react-router-dom` - Routing
- `react-hot-toast` - Notifications

**UI/Styling:**
- `tailwindcss` - CSS framework
- `flowbite` - UI components
- `@tinymce/tinymce-react` - Rich text editor

**Utilities:**
- `socket.io-client` - Real-time
- `axios` - HTTP client (planned)
- `xlsx` - Excel parsing
- `jspdf` - PDF generation

---

## 🗂️ File Naming Conventions

### **Backend**

| Type | Pattern | Example |
|------|---------|---------|
| Models | `*Model.js` or `*Models.js` | `auctionModel.js` |
| Controllers | `*Controller.js` | `authController.js` |
| Routes | `*Route.js` or `*.route.js` | `auth.route.js` |
| Services | `*Service.js` | `imageService.js` |
| Middleware | `*middleware.js` or `*Middleware.js` | `Authmiddleware.js` |
| Tests | `*.test.js` | `auth.test.js` |

### **Frontend**

| Type | Pattern | Example |
|------|---------|---------|
| Components | `*Component.jsx` | `LoginComponent.jsx` |
| Pages | `*Page.jsx` or `*Pages.jsx` | `MainPage.jsx` |
| Services | `*Service.jsx` or `*Api.js` | `authApi.js` |
| Hooks | `*.jsx` in `/hooks` | `keyKeys.jsx` |
| Context | `*Context.jsx` | `UserContext.jsx` |

---

## 🔍 Where to Find Things

### **"I need to..."**

**Add a new API endpoint**
→ `backend/routes/v1/[resource].route.js`
→ `backend/controllers/v1/[resource]Controller.js`

**Add a new database model**
→ `backend/models/[name]Model.js`

**Add a new frontend page**
→ `frontend/src/pages/[Name]Page.jsx`
→ Update `frontend/src/App.js` routes

**Add a new service/utility**
→ Backend: `backend/services/[name]Service.js`
→ Frontend: `frontend/src/services/api/[name]Api.js`

**Add authentication**
→ Backend: `backend/middleware/Authmiddleware.js`
→ Frontend: `frontend/src/services/api/authApi.js`

**Add tests**
→ Unit: `backend/tests/unit/[category]/[name].test.js`
→ Integration: `backend/tests/integration/[feature].test.js`

---

## 📊 File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `frontend/src` | ~40 | React components |
| `backend/routes` | 16 | API routing |
| `backend/controllers` | 10 | Request handlers |
| `backend/models` | 6 | Database schemas |
| `backend/services` | 3 | Business logic |
| `backend/tests` | 11 | Test suites |
| `docs/` | 10+ | Documentation |

**Total Project Files:** ~200 files (excluding node_modules)

---

## 🎯 Critical Files

### **Must Not Delete**

| File | Reason |
|------|--------|
| `backend/DB/conn.js` | Database connection |
| `backend/src/app.js` | Express app |
| `backend/server.js` | Backend entry |
| `frontend/src/App.js` | React routing |
| `frontend/public/config.json` | Runtime config |
| `.env` files | Configuration |

### **Can Regenerate**

| Directory | Reason |
|-----------|--------|
| `node_modules/` | npm install |
| `frontend/build/` | npm run build |
| `backend/public/team-logos/` | Cache (regenerated) |
| `coverage/` | Test coverage |

---

## 🔄 Build Artifacts

### **Frontend Build**

```
frontend/build/
├── index.html
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   └── main.[hash].js
│   └── media/
│       └── [assets]
└── asset-manifest.json
```

### **Test Coverage**

```
backend/coverage/
├── lcov-report/        # HTML report
├── lcov.info          # Coverage data
└── coverage-summary.json
```

---

## 🔒 Ignored Files (.gitignore)

### **Should be ignored:**
```
node_modules/
.env
*.log
build/
coverage/
.DS_Store
backend/public/team-logos/*.webp
```

### **Should be tracked:**
```
backend/public/team-logos/.gitkeep
*.md (documentation)
package.json
package-lock.json
```

---

## 📖 Related Documentation

- [Getting Started](development/GETTING_STARTED.md) - Setup guide
- [System Design](architecture/SYSTEM_DESIGN.md) - Architecture
- [Database Schema](architecture/DATABASE_SCHEMA.md) - Data models

---

Last Updated: October 18, 2025

