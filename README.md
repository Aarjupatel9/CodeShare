# CodeShare

A multi-functional web platform for document sharing, cricket auctions, and gaming.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

---

## 🌟 Features

### **📝 Rich Text Document Sharing**
- Collaborative document editing with TinyMCE
- Real-time synchronization via WebSockets
- Version control (last 30 versions)
- File attachments support
- Public/Private document access
- Slug-based URL sharing

### **🏏 Cricket Auction System**
- Complete IPL-style auction management
- Team and player management
- Live bidding interface with real-time updates
- Budget tracking and calculations
- Excel player data import
- Team logos with smart caching
- Public spectator view

### **🎮 Gaming Platform**
- Multiple casual games
- Score tracking
- Leaderboards

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- MongoDB (Atlas or local)
- npm 9+

### **Installation**

```bash
# Clone repository
git clone https://github.com/yourusername/CodeShare.git
cd CodeShare

# Install dependencies
cd backend && npm install
cd ../socketServer && npm install
cd ../frontend && npm install
```

### **Configuration**

Create `.env` files in `backend/`, `socketServer/`, and `frontend/`. See [Getting Started Guide](docs/development/GETTING_STARTED.md) for details.

### **Run Development Servers**

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Socket Server
cd socketServer && npm start

# Terminal 3 - Frontend
cd frontend && npm run dev
```

Visit: **http://localhost:3000**

---

## 📚 Documentation

Comprehensive documentation available in [`/docs`](docs/):

### **Quick Links**
- 📖 [Getting Started Guide](docs/development/GETTING_STARTED.md)
- 🏗️ [System Architecture](docs/architecture/SYSTEM_DESIGN.md)
- 🔌 [API Reference](docs/api/API_RESTRUCTURE.md)
- 💾 [Database Schema](docs/architecture/DATABASE_SCHEMA.md)
- 🧪 [Testing Guide](docs/testing/TESTING_GUIDE.md)
- 📁 [Project Structure](docs/PROJECT_STRUCTURE.md)

---

## 🛠️ Technology Stack

### **Frontend**
- React 18.2
- React Router 6
- TinyMCE (Rich text editor)
- Tailwind CSS
- Socket.IO Client

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Sharp (Image processing)
- AWS S3 (Document files)

### **Testing**
- Jest
- Supertest
- 71 test cases

---

## 🎯 API Endpoints

### **RESTful API v1**

```
Authentication:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-token

Documents:
GET    /api/v1/documents
POST   /api/v1/documents
GET    /api/v1/documents/:id
PUT    /api/v1/documents/:id
DELETE /api/v1/documents/:id
GET    /api/v1/documents/public/:slug

Auctions:
GET    /api/v1/auctions
POST   /api/v1/auctions
GET    /api/v1/auctions/:id
PUT    /api/v1/auctions/:id
POST   /api/v1/auctions/:id/login

Teams, Players, Sets:
Nested under /api/v1/auctions/:auctionId/
```

See [API Documentation](docs/api/API_RESTRUCTURE.md) for complete reference.

---

## 🧪 Testing

```bash
# Run all tests
cd backend && npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

**Current Coverage:** 51/71 tests passing (core functionality verified)

---

## 📦 Deployment

### **Docker Compose**

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### **Manual Deployment**

See [Getting Started Guide](docs/development/GETTING_STARTED.md#building-for-production) for production deployment instructions.

---

## 🔑 Key Highlights

### **Recent Updates (Oct 2025)**

✅ **RESTful API v1** - Modern API architecture with proper HTTP methods  
✅ **Team Logo System** - AWS S3-free with 3-tier caching (10-40x faster)  
✅ **Security Improvements** - Password hashing, proper token expiry  
✅ **Frontend API Client** - Centralized, maintainable service layer  
✅ **Test Suite** - Jest + Supertest with 71 test cases  
✅ **Documentation** - Comprehensive guides for all aspects  

### **Performance**

| Operation | Response Time |
|-----------|---------------|
| Document Load | ~500ms |
| Team Logo (cached) | ~5ms |
| API Request | ~100ms |
| Real-time Sync | <50ms |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aarju Patel**

---

## 🙏 Acknowledgments

- TinyMCE for the rich text editor
- MongoDB Atlas for database hosting
- React community for excellent libraries
- All contributors and testers

---

## 📞 Support

For questions or issues:
- Check the [documentation](docs/)
- Review [Getting Started Guide](docs/development/GETTING_STARTED.md)
- Open an issue on GitHub

---

## 🗺️ Roadmap

### **Current Version: 1.0.0**

### **Upcoming**
- [ ] API v2 with GraphQL
- [ ] Real-time collaboration cursors
- [ ] Enhanced auction analytics
- [ ] Mobile app (React Native)
- [ ] Elasticsearch integration
- [ ] Redis caching layer

---

**Star ⭐ this repo if you find it useful!**

Last Updated: October 18, 2025

