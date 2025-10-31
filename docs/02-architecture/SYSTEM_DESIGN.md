# System Design & Architecture

## 🏗️ High-Level Architecture

CodeShare follows a **microservices architecture** with three independent services.

---

## 📐 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  React SPA (Port 3000)                             │     │
│  │  - Document Editor                                 │     │
│  │  - Auction Interface                               │     │
│  │  - Games                                           │     │
│  │  - User Dashboard                                  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Backend API         │  │  Socket Server       │        │
│  │  Express.js:8080     │  │  Socket.IO:8081      │        │
│  │  - RESTful API v1    │  │  - Document sync     │        │
│  │  - Authentication    │  │  - Auction updates   │        │
│  │  - Business Logic    │  │  - Real-time events  │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  MongoDB Atlas     │  │  Public Folder     │            │
│  │  - User data       │  │  - Cached logos    │            │
│  │  - Documents       │  │  - Static assets   │            │
│  │  - Auction data    │  │                    │            │
│  │  - Team logos (b64)│  │                    │            │
│  └────────────────────┘  └────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagrams

### **Document Editing Flow**

```
┌──────────┐
│  User    │
│  Types   │
└────┬─────┘
     │
     ↓ (onChange)
┌────────────────┐
│  React State   │
│  Update        │
└────┬───────────┘
     │
     ↓ (debounced)
┌──────────────────┐
│  Socket.IO Emit  │
│  'room_message'  │
└────┬─────────────┘
     │
     ↓
┌──────────────────────┐
│  Socket Server       │
│  Broadcast to room   │
└────┬─────────────────┘
     │
     ↓
┌──────────────────────┐
│  Other Users         │
│  Receive update      │
│  Editor updates      │
└──────────────────────┘

     User Saves (Ctrl+S)
     │
     ↓
┌──────────────────────┐
│  POST /api/v1/       │
│  documents/:id       │
└────┬─────────────────┘
     │
     ↓
┌──────────────────────┐
│  MongoDB             │
│  Add version         │
│  {time, data, user}  │
└──────────────────────┘
```

---

### **Team Logo Upload & Caching Flow**

```
┌─────────────┐
│ User Upload │
│  Image File │
└──────┬──────┘
       │
       ↓
┌──────────────────────────┐
│  POST /api/v1/auctions/  │
│  :id/teams/:teamId/logo  │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────┐
│  Multer              │
│  (Memory Storage)    │
│  Max 500KB           │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Sharp               │
│  - Resize 200x200    │
│  - Convert WebP      │
│  - Compress <50KB    │
└──────┬───────────────┘
       │
       ├─────────────────────┬───────────────────┐
       │                     │                   │
       ↓                     ↓                   ↓
┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
│  MongoDB     │  │  Public Folder  │  │  Response    │
│  (base64)    │  │  (binary cache) │  │  to User     │
│  Permanent   │  │  Fast serving   │  │  Public URL  │
└──────────────┘  └─────────────────┘  └──────────────┘

Later Retrieval:
┌──────────────────────────┐
│ GET /api/public/         │
│ team-logos/:teamId       │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────┐
│  Check Public        │
│  Folder Cache        │
└──────┬───────────────┘
       │
   Found? ┌──No──┐
       │         │
      Yes        ↓
       │    ┌─────────────────┐
       │    │  Fetch from     │
       │    │  MongoDB        │
       │    └────┬────────────┘
       │         │
       │         ↓
       │    ┌─────────────────┐
       │    │  Regenerate     │
       │    │  Cache File     │
       │    └────┬────────────┘
       │         │
       └─────────┴────────────┐
                              │
                              ↓
                    ┌─────────────────┐
                    │  Serve Image    │
                    │  Cache Headers  │
                    │  - max-age:     │
                    │    86400        │
                    │  - ETag         │
                    └─────────────────┘
```

---

## 🔐 Authentication Flow

### **User Authentication**

```
┌─────────────────┐
│  POST /api/v1/  │
│  auth/login     │
│  {email, pass}  │
└────┬────────────┘
     │
     ↓
┌──────────────────┐
│  Find User       │
│  by email        │
└────┬─────────────┘
     │
     ↓
┌──────────────────┐
│  Bcrypt Compare  │
│  Password        │
└────┬─────────────┘
     │
 Valid? ┌─No──────────┐
     │              │
    Yes             ↓
     │         ┌─────────────┐
     ↓         │  401 Error  │
┌──────────────┐└─────────────┘
│  Generate    │
│  JWT Token   │
│  (7 days)    │
└────┬─────────┘
     │
     ↓
┌──────────────────┐
│  Set Cookie      │
│  httpOnly: true  │
│  secure: prod    │
└────┬─────────────┘
     │
     ↓
┌──────────────────┐
│  Return User     │
│  Data (no pass)  │
└──────────────────┘
```

---

## 🎯 API Architecture

### **Layered Architecture**

```
┌──────────────────────────────────────┐
│         Routes Layer                  │
│  - Route definitions                  │
│  - Middleware mounting                │
│  - Parameter validation               │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│       Middleware Layer                │
│  - Authentication                     │
│  - Authorization                      │
│  - Request validation                 │
│  - Error handling                     │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│      Controllers Layer                │
│  - Request handling                   │
│  - Response formatting                │
│  - Business logic orchestration       │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│       Services Layer                  │
│  - Business logic                     │
│  - External API calls                 │
│  - Image processing                   │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│        Models Layer                   │
│  - Data validation                    │
│  - Database operations                │
│  - Hooks & methods                    │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│         Database                      │
│  - MongoDB Atlas                      │
└──────────────────────────────────────┘
```

---

## 🔌 Socket.IO Architecture

### **Dual Socket Servers**

```
Main IO (path: /socket/)
├── Room: document-slug
│   ├── Events:
│   │   ├── room_message (content sync)
│   │   └── newPlayerBiddingUpdate
│   └── Auto-join by slug

Auction IO (path: /auction/)
├── Room: auction-id
│   ├── Events:
│   │   ├── newPlayerBiddingUpdate
│   │   ├── playerSoldUpdate
│   │   └── playerBiddingUpdate
│   └── Auto-join by slug
```

---

## 💾 Caching Strategy

### **Multi-Level Caching**

```
Level 1: Browser Cache
  - Team logos: 24 hours
  - Static assets: 7 days
  - API responses: No cache

Level 2: Server Memory
  - None currently
  - Future: Redis for sessions

Level 3: Public Folder
  - Team logos: Indefinite (manual cleanup)
  - Response time: ~5ms

Level 4: Database
  - All data: Permanent
  - Response time: ~50-200ms
```

---

## 🔒 Security Architecture

### **Defense Layers**

```
┌──────────────────────────────────────┐
│  1. Network Layer                     │
│     - CORS (whitelist origins)       │
│     - Rate limiting (planned)        │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│  2. Application Layer                 │
│     - JWT token validation           │
│     - Cookie httpOnly + secure       │
│     - Input validation               │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│  3. Business Logic Layer              │
│     - Authorization checks           │
│     - Owner validation               │
│     - Resource access control        │
└────────────┬─────────────────────────┘
             ↓
┌──────────────────────────────────────┐
│  4. Data Layer                        │
│     - Password hashing (bcrypt)      │
│     - Mongoose validation            │
│     - Soft deletes                   │
└──────────────────────────────────────┘
```

---

## 📊 Scalability Considerations

### **Current Capacity**

| Resource | Limit | Bottleneck |
|----------|-------|------------|
| Concurrent Users | ~1,000 | Socket connections |
| Documents | Unlimited | MongoDB storage |
| API Requests/sec | ~100 | Single Node process |
| File Uploads | ~50/min | S3 bandwidth |
| Team Logos | ~10,000 | MongoDB 16MB doc limit* |

*Each team is a separate document, so effectively unlimited

### **Scaling Strategy**

#### **Horizontal Scaling**
```
Load Balancer
    ├── Backend Instance 1
    ├── Backend Instance 2
    └── Backend Instance 3

Shared:
├── MongoDB Atlas (auto-scaling)
├── Redis (sessions - future)
└── S3 (file storage)

Note: Public folder cache needs shared filesystem
      or Redis for multi-instance deployment
```

#### **Vertical Scaling**
- Current: 1 CPU, 1GB RAM
- Recommended: 2 CPU, 4GB RAM for 1000+ users

---

## 🔄 Data Consistency

### **Version Control Strategy**

```
Document Versions:
├── Store last 30 versions
├── Each version: {time, data, user}
├── Aggregation pipeline for latest version
└── Soft delete for documents

Auction State:
├── Optimistic locking (planned)
├── Transaction support for budget updates
└── Event sourcing for bidding history
```

---

## 🚀 Deployment Architecture

### **Development**
```
Developer Machine
├── Frontend:      localhost:3000 (React dev server)
├── Backend:       localhost:8080 (Node.js)
├── Socket Server: localhost:8081 (Socket.IO)
└── Database:      MongoDB Atlas (cloud)
```

### **Production (Docker Compose)**
```
Docker Host
├── code_share_frontend (Nginx:80)
├── code_share_backend (Node:8080)
├── code_share_socket_server (Node:8081)
└── MongoDB Atlas (external)

Networks:
└── codeshare_network (internal)
```

---

## 📡 API Versioning Strategy

### **Current Implementation**

```
/api/v1/*         - New RESTful API (active)
/api/auth/*       - Legacy auth (backward compat)
/api/data/*       - Legacy data (backward compat)
/api/auction/*    - Legacy auction (backward compat)
/api/public/*     - Public resources (no auth)
```

### **Future Versions**

```
/api/v2/*         - Breaking changes allowed
/api/v3/*         - Future enhancements

Migration Path:
v1 → v2: 6 months deprecation notice
v2 → v3: 6 months deprecation notice
```

---

## 🔍 Monitoring & Logging

### **Current Logging**

```
Backend:
├── Morgan (HTTP request logging)
├── Console logs (development)
└── File logs (planned)

Socket Server:
├── Connection logs
├── Usage logs (socket_usage.log)
└── Every 10 seconds: connection count
```

### **Future Monitoring**

```
Planned:
├── Winston (structured logging)
├── ELK Stack (log aggregation)
├── Prometheus (metrics)
├── Grafana (dashboards)
└── Sentry (error tracking)
```

---

## 🛡️ Error Handling Strategy

### **Error Flow**

```
Error Occurs
    ↓
Try/Catch in Controller
    ↓
Log error (console.error)
    ↓
Return standardized response:
{
  success: false,
  message: "User-friendly message",
  error: "Technical details" (dev only)
}
    ↓
Global Error Handler
  ├── Multer errors → 400
  ├── JSON errors → 400
  ├── JWT errors → 401
  ├── Validation errors → 400
  └── Unknown errors → 500
```

---

## 💡 Design Patterns Used

### **Backend Patterns**

| Pattern | Usage | Location |
|---------|-------|----------|
| **Singleton** | Image service, API client | `services/imageService.js` |
| **Factory** | Test data generation | `tests/helpers/fixtures.js` |
| **Middleware Chain** | Auth, validation | `middleware/*.js` |
| **Repository** | Data access | `models/*.js` |
| **Service Layer** | Business logic | `services/*.js` |

### **Frontend Patterns**

| Pattern | Usage | Location |
|---------|-------|----------|
| **Singleton** | API client | `services/api/apiClient.js` |
| **Context API** | User state | `context/UserContext.jsx` |
| **Custom Hooks** | Keyboard shortcuts | `hooks/keyKeys.jsx` |
| **HOC** | Route protection | `PrivatePages.jsx` |

---

## 🎨 Frontend Architecture

### **Component Hierarchy**

```
App.jsx
├── Routes
│   ├── PublicPages
│   │   └── MainPage (viewer)
│   │
│   ├── PrivatePages (auth required)
│   │   └── MainPage (editor)
│   │
│   ├── Auth Pages
│   │   ├── LoginComponent
│   │   ├── RegisterComponent
│   │   └── ForgetPasswordComponent
│   │
│   ├── Auction Pages
│   │   ├── AuctionHome
│   │   ├── AuctionMain
│   │   ├── AuctionDetailsManage
│   │   ├── AuctionBidding
│   │   └── AuctionLiveUpdate
│   │
│   └── Game Pages
│       └── GamePage
```

---

## 🔧 Configuration Management

### **Environment Variables**

```
Backend (.env):
├── MONGODB_URI          # Database connection
├── TOKEN_SECRET         # JWT secret
├── ALLOWED_ORIGIN       # CORS whitelist
├── AWS_* variables      # S3 configuration
├── SMTP_* variables     # Email configuration
└── NODE_ENV             # Environment

Frontend (.env):
└── REACT_APP_API_URL    # Backend URL

Socket Server (.env):
└── ALLOWED_ORIGIN       # CORS whitelist

Public (config.json):
├── backend_url          # API base URL
└── backend_socket_url   # Socket server URL
```

---

## 📈 Performance Optimizations

### **Implemented**

| Optimization | Impact | Location |
|--------------|--------|----------|
| **Team Logo Caching** | 10-40x faster | `services/imageService.js` |
| **WebP Compression** | 70% smaller files | Image service |
| **MongoDB Indexes** | 100x faster queries | All models |
| **Socket.IO Rooms** | Isolated broadcasts | `socketServer/app.js` |
| **Aggregation Pipelines** | Efficient version queries | `controllers/documentController.js` |

### **Planned**

- [ ] Redis caching for API responses
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Lazy loading for large lists
- [ ] Image lazy loading
- [ ] Code splitting in frontend

---

## 🔐 Security Measures

### **Implemented**

✅ **Authentication:**
- JWT tokens (secure, httpOnly cookies)
- Bcrypt password hashing (salt rounds: 10)
- Token expiration (7 days / 24 hours)

✅ **Authorization:**
- Route-level middleware
- Resource ownership validation
- Separate auction sessions

✅ **Input Validation:**
- File size limits
- Image format validation
- Slug validation
- MongoDB injection prevention (Mongoose)

✅ **Data Protection:**
- Soft deletes (not permanent)
- Password exclusion in responses
- Separate test database

---

## 🔮 Future Enhancements

### **Planned Features**

**Infrastructure:**
- [ ] Redis for caching
- [ ] Elasticsearch for search
- [ ] CDN integration
- [ ] Load balancing
- [ ] Auto-scaling

**Features:**
- [ ] Real-time presence indicators
- [ ] Document collaboration cursors
- [ ] Comment system
- [ ] Document sharing permissions
- [ ] API rate limiting
- [ ] 2FA authentication

**Developer Experience:**
- [ ] Swagger/OpenAPI documentation
- [ ] GraphQL API
- [ ] SDK libraries
- [ ] Webhook support

---

## 📚 Related Documentation

- [Project Overview](OVERVIEW.md) - High-level description
- [Database Schema](DATABASE_SCHEMA.md) - Data models
- [API Reference](../03-api/API_USAGE.md) - API endpoints
- [Getting Started](../01-getting-started/SETUP.md) - Setup guide

---

Last Updated: October 18, 2025

