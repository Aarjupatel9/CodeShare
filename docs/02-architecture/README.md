# Architecture Overview

## 🏗️ System Architecture

CodeShare uses a **microservices architecture** with separate servers for different concerns.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Internet                         │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │   Nginx (Port 80)     │
         │   - Reverse Proxy     │
         │   - Load Balancer     │
         │   - SSL Termination   │
         └───────────┬───────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────┐          ┌──────────────┐
│ Backend      │          │ Socket       │
│ Server       │◄────────►│ Server       │
│ (Port 8080)  │   HTTP   │ (Port 8081)  │
└──────┬───────┘          └──────────────┘
       │                         │
       │                         │
       ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ MongoDB      │          │ Client       │
│ Database     │          │ Browsers     │
└──────────────┘          └──────────────┘
```

---

## 🖥️ Server Components

### **1. Frontend (React + Nginx)**

**Technology Stack:**
- React 18
- TailwindCSS
- React Router
- Socket.IO Client

**Responsibilities:**
- User interface
- Client-side routing
- State management
- API consumption

**Deployment:**
- Nginx serves static files
- Reverse proxy to backend
- Gzip compression

---

### **2. Backend Server (Node.js + Express)**

**Port**: 8080

**Technology Stack:**
- Node.js v18+
- Express.js
- MongoDB (Mongoose)
- JWT authentication

**Responsibilities:**
- REST API endpoints
- Database operations
- Authentication & authorization
- Business logic
- File storage

**API Versions:**
- `/api/v1/*` - Modern RESTful API ✅
- `/api/auction/*` - Legacy API (deprecated)
- `/api/auth/*` - Legacy Auth (deprecated)
- `/api/data/*` - Legacy Data (deprecated)

---

### **3. Socket Server (Socket.IO)**

**Port**: 8081

**Technology Stack:**
- Node.js
- Socket.IO v4
- Axios (for HTTP calls)

**Responsibilities:**
- Real-time bidding updates
- Viewer count tracking
- Player sold notifications
- Analytics data collection

**Namespaces:**
- `/socket/` - Document collaboration
- `/auction/` - Auction live updates

---

### **4. Database (MongoDB)**

**Collections:**
- `users` - User accounts
- `auctionmodels` - Auctions
- `auctionteammodels` - Teams
- `auctionplayermodels` - Players
- `auctionsetmodels` - Sets
- `datamodels` - Documents/pages
- `files` - Uploaded files
- `vieweranalytics` - Viewer tracking (90-day TTL)

See [Database Schema](./DATABASE_SCHEMA.md) for details.

---

## 🔄 Data Flow

### Auction Bidding Flow:
```
Admin places bid
  ↓
Frontend → POST /api/auction/player/update
  ↓
Backend Server:
  - Update player in MongoDB
  - Return updated auction data
  ↓
Backend → Socket Server (HTTP/Socket emit)
  ↓
Socket Server broadcasts:
  - playerBiddingUpdate event
  ↓
All live view clients receive update
  ↓
UI updates in real-time
```

### Viewer Analytics Flow:
```
User opens live view
  ↓
Socket connection → Socket Server
  ↓
viewerCount++ → Broadcast to all
  ↓
Every 5 seconds: Sample count (in memory)
  ↓
Every 1 minute: Aggregate & HTTP POST to backend
  ↓
Backend: Check enableViewerAnalytics flag
  ↓
If enabled: Save to MongoDB
```

---

## 🌐 Deployment Architecture

### Development:
- Backend: localhost:8080
- Socket: localhost:8081
- Frontend: localhost:3000

### Production (AWS):
```
┌─────────────────────────────────────┐
│ EC2 Instance #1 (t2.micro)          │
│ - Backend Server (Port 8080)        │
│ - Nginx (Port 80/443)               │
│ - Frontend (Static files)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ EC2 Instance #2 (t2.micro)          │
│ - Socket Server (Port 8081)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ MongoDB Atlas (Free Tier)           │
│ - Managed database                  │
│ - Auto backups                      │
└─────────────────────────────────────┘
```

**Capacity**: 1000-1600 concurrent viewers

---

## 🔐 Security

### Authentication:
- JWT tokens (httpOnly cookies)
- Password hashing (bcrypt)
- Session management

### Authorization:
- Auction organizer verification
- Private route protection
- Internal API key (socket ↔ backend)

### Data Protection:
- CORS configuration
- Input validation
- SQL injection prevention (Mongoose)
- XSS protection

---

## 📚 Learn More

- [System Design Details](./SYSTEM_DESIGN.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Two-Server Setup](./TWO_SERVER_SETUP.md)

---

**Ready to dive deeper?** Explore the specific documentation sections!

