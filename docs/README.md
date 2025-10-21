# CodeShare Documentation

**Last Updated**: October 2025  
**Version**: 2.0

---

## 📖 Welcome to CodeShare

CodeShare is a collaborative platform featuring:
- 📝 **Code Editor**: Real-time collaborative editing
- 🎯 **Auction Management**: Complete IPL-style auction system
- 📺 **Live View**: Public spectator page with real-time updates
- 📊 **Analytics**: Viewer tracking and auction statistics

---

## 🗂️ Documentation Index

### 🚀 [Getting Started](./01-getting-started/)
Quick start guide, installation, and deployment instructions.

### 🏗️ [Architecture](./02-architecture/)
System design, database schema, and server architecture (2-server setup).

### 🔌 [API Reference](./03-api/)
REST API endpoints, Socket.IO events, and authentication.

### ✨ [Features](./04-features/)
Detailed guides for auction bidding, live view, analytics, and more.

### ⚡ [Performance](./05-performance/)
Optimization strategies, capacity analysis, and server sizing.

### 🔄 [Migration](./06-migration/)
API migration guides and breaking changes.

### 💻 [Development](./07-development/)
Contributing guidelines, testing, and troubleshooting.

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone <repo-url>

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../socketServer && npm install

# 3. Configure environment
cp backend/.env.example backend/.env
cp socketServer/.env.example socketServer/.env
# Edit .env files with your configuration

# 4. Start servers
cd backend && npm start          # Port 8080
cd socketServer && npm start     # Port 8081
cd frontend && npm start         # Port 3000

# 5. Access application
# http://localhost:3000
```

See [Getting Started Guide](./01-getting-started/README.md) for details.

---

## 🏗️ Architecture Overview

### **2-Server Setup:**

```
┌─────────────────────────────────────────┐
│ Frontend (Nginx - Port 80)              │
│ - React application                     │
│ - Static file serving                   │
└─────────────────────────────────────────┘
            ↓ HTTP/REST API
┌─────────────────────────────────────────┐
│ Backend Server (Port 8080)              │
│ - Express.js REST API                   │
│ - MongoDB integration                   │
│ - Authentication & authorization        │
└─────────────────────────────────────────┘
            
            ↓ HTTP (analytics)
            
┌─────────────────────────────────────────┐
│ Socket Server (Port 8081)               │
│ - Socket.IO for real-time updates       │
│ - Viewer tracking                       │
│ - Bidding broadcasts                    │
└─────────────────────────────────────────┘
```

See [System Design](./02-architecture/SYSTEM_DESIGN.md) for details.

---

## 📊 Key Features

### 🎯 Auction Management
- Team management with logo uploads
- Player management with Excel import
- Set-based bidding system
- Real-time bidding interface

### 📺 Live View
- Public spectator page
- Real-time viewer count
- Leaderboard and recent sales
- Team rosters with player search

### 📊 Analytics
- Optional viewer tracking (1-minute snapshots)
- Peak, average, minimum viewers
- Trend visualization
- 90-day data retention

### 📝 Document Editor
- Real-time collaboration
- Syntax highlighting
- File management

---

## 🚀 Performance

### **Server Capacity (t2.micro - 1GB RAM):**

**Single Server**: 500-800 concurrent viewers  
**2-Server Setup**: 1000-1600 concurrent viewers

See [Capacity Analysis](./05-performance/CAPACITY_ANALYSIS.md) for details.

---

## 🔗 Important Links

- [API Documentation](./03-api/)
- [Database Schema](./02-architecture/DATABASE_SCHEMA.md)
- [Testing Guide](./07-development/TESTING.md)
- [Performance Optimization](./05-performance/OPTIMIZATION_SUMMARY.md)

---

## 📞 Support

For issues, questions, or contributions:
- See [Contributing Guide](./07-development/CONTRIBUTING.md)
- Check [Troubleshooting](./07-development/TROUBLESHOOTING.md)
- Review [Testing Guide](./07-development/TESTING.md)

---

**Happy Coding!** 🚀
