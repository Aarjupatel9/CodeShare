# CodeShare - Project Overview

## 🎯 What is CodeShare?

CodeShare is a multi-functional web platform that provides:

1. **Rich Text Document Sharing** - Collaborative document editing with version control
2. **Cricket Auction System** - Complete IPL-style auction management platform  
3. **Gaming Platform** - Multiple casual games
4. **Real-time Collaboration** - Live document syncing via WebSockets

---

## 🏗️ Architecture

### **Technology Stack**

#### **Frontend**
```
React 18.2.0
├── React Router (routing)
├── TinyMCE (rich text editor)
├── Socket.IO Client (real-time updates)
├── Tailwind CSS (styling)
└── Flowbite (UI components)
```

#### **Backend**
```
Node.js + Express 4.18.2
├── MongoDB + Mongoose (database)
├── JWT (authentication)
├── Bcrypt (password hashing)
├── Sharp (image processing)
├── Multer (file uploads)
└── Nodemailer (emails)
```

#### **Socket Server**
```
Socket.IO 4.7.5
├── Real-time document sync
└── Live auction updates
```

---

## 📐 System Architecture

### **3-Tier Architecture**

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                   │
│           Port: 3000                         │
│  ┌─────────────────────────────────────┐   │
│  │  - Document Editor (TinyMCE)        │   │
│  │  - Auction Interface                │   │
│  │  - Games                            │   │
│  │  - User Dashboard                   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
        ┌──────────────────────────┐
        │   API Client (Axios)     │
        │   - authApi              │
        │   - documentApi          │
        │   - auctionApi           │
        └──────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        Backend API (Express)                 │
│        Port: 8080                            │
│  ┌─────────────────────────────────────┐   │
│  │  RESTful API v1                     │   │
│  │  - /api/v1/auth                     │   │
│  │  - /api/v1/documents                │   │
│  │  - /api/v1/auctions                 │   │
│  │  - /api/public/team-logos           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        Database (MongoDB Atlas)              │
│  ┌─────────────────────────────────────┐   │
│  │  Collections:                       │   │
│  │  - usermodals                       │   │
│  │  - datamodels (documents)           │   │
│  │  - auctionmodels                    │   │
│  │  - auctionteammodels                │   │
│  │  - auctionplayermodels              │   │
│  │  - auctionsetmodels                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Socket Server (Socket.IO)               │
│      Port: 8081                              │
│  ┌─────────────────────────────────────┐   │
│  │  - Document sync (real-time)        │   │
│  │  - Auction live updates             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **Document Creation Flow**

```
User types in editor
       ↓
Socket.IO broadcasts to room
       ↓
Other users receive update
       ↓
User saves (Ctrl+S)
       ↓
POST /api/v1/documents
       ↓
Store in MongoDB with version
       ↓
Success response
```

### **Team Logo Upload Flow**

```
User selects image
       ↓
POST /api/v1/auctions/:id/teams/:teamId/logo
       ↓
Validate size (<500KB)
       ↓
Optimize with Sharp
  - Resize to 200x200
  - Convert to WebP
  - Compress to <50KB
       ↓
Store in MongoDB (base64)
  AND
Cache in /public/team-logos/
       ↓
Return public URL
       ↓
GET /api/public/team-logos/:teamId
  ↓ (Browser → Cache → DB)
Serve image with cache headers
```

---

## 📦 Project Structure

```
CodeShare/
├── frontend/                # React application
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── services/api/   # API client layer
│   │   ├── auction/        # Auction features
│   │   ├── gamePlugin/     # Games
│   │   └── common/         # Shared utilities
│   └── public/
│
├── backend/                 # Express API
│   ├── src/app.js          # Express app
│   ├── server.js           # Entry point
│   ├── routes/
│   │   ├── v1/             # New RESTful routes
│   │   └── [legacy]/       # Old routes
│   ├── controllers/
│   │   └── v1/             # New controllers
│   ├── models/             # Mongoose schemas
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, validation
│   ├── public/
│   │   └── team-logos/     # Cached logos
│   ├── tests/              # Test suites
│   └── scripts/            # Utility scripts
│
├── socketServer/            # Socket.IO server
│   └── app.js
│
├── docs/                    # Documentation
│   ├── api/                # API references
│   ├── architecture/       # System design
│   ├── development/        # Dev guides
│   └── testing/            # Test docs
│
└── docker-compose.yaml     # Multi-container setup
```

---

## 🔑 Key Features

### **1. Document Sharing**
- Rich text editing (TinyMCE)
- Version control (30 versions kept)
- File attachments (AWS S3)
- Real-time collaboration
- Public/Private pages
- Slug-based URLs

### **2. Cricket Auction**
- Team management
- Player profiles with stats
- Live bidding interface
- Budget tracking
- Set-based organization
- Excel player import
- Team logos (MongoDB + cache)
- Public live view

### **3. Games**
- Multiple casual games
- Score tracking
- Leaderboards

---

## 🔐 Authentication

### **User Authentication**
- JWT-based auth
- Cookie storage (httpOnly)
- 7-day token expiry
- Email verification
- Password reset flow

### **Auction Authentication**
- Separate auction tokens
- Password-protected auctions
- 24-hour session
- Public view option

---

## 💾 Data Models

### **Core Models**
- `usermodals` - User accounts
- `datamodels` - Documents with versioning

### **Auction Models**
- `auctionmodels` - Auction details
- `auctionteammodels` - Teams with budgets
- `auctionplayermodels` - Player profiles
- `auctionsetmodels` - Player grouping

---

## 🌐 Deployment

### **Development**
```
Frontend:      localhost:3000
Backend:       localhost:8080
Socket Server: localhost:8081
MongoDB:       MongoDB Atlas
```

### **Production**
```
Frontend:      Nginx (port 80)
Backend:       Node.js (port 8080)
Socket Server: Node.js (port 8081)
Database:      MongoDB Atlas
Storage:       AWS S3 (documents only)
```

---

## 📊 Performance

| Feature | Performance |
|---------|-------------|
| Document Load | ~500ms |
| Document Save | ~200ms |
| Real-time Sync | <50ms |
| Team Logo (cached) | ~5ms |
| Team Logo (DB) | ~50ms |
| API Response (avg) | ~100ms |

---

## 🔄 Recent Updates

### **October 2025 - Major Restructuring**
- ✅ RESTful API v1 architecture
- ✅ Team logo system (AWS-free)
- ✅ Security improvements
- ✅ Frontend API client
- ✅ Test infrastructure

See [Implementation Summary](../02-architecture/README.md) for details.

---

## 📖 Where to Go Next

- **Setup Project**: [Getting Started](../01-getting-started/SETUP.md)
- **Use API**: [API Reference](../03-api/API_USAGE.md)
- **Run Tests**: [Testing Guide](../07-development/TESTING.md)
- **Understand Architecture**: [System Design](SYSTEM_DESIGN.md)

---

Last Updated: October 18, 2025

