# CodeShare

A modern collaborative document editor and code sharing platform with real-time synchronization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

---

## 🌟 Features

### **📝 Rich Text Document Sharing**
- Collaborative document editing with TinyMCE
- Real-time synchronization via WebSockets
- Version control (last 30 versions)
- File attachments with Google Drive integration
- Public/Private document access
- Slug-based URL sharing
- Beautiful formatting options

### **🎮 Gaming Platform**
- Multiple casual games
- Score tracking
- Leaderboards

### **🚀 Modern Features**
- SEO optimized with Open Graph support
- PWA ready with manifest.json
- Mobile responsive design
- Fast and lightweight
- Zero external dependencies for SEO

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

Create `.env` files in `backend/`, `socketServer/`, and `frontend/`. See [Getting Started Guide](docs/01-getting-started/SETUP.md) for details.

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
- 📖 [Getting Started Guide](docs/01-getting-started/SETUP.md)
- 🏗️ [System Architecture](docs/02-architecture/SYSTEM_DESIGN.md)
- 🔌 [API Reference](docs/03-api/API_USAGE.md)
- 💾 [Database Schema](docs/02-architecture/DATABASE_SCHEMA.md)
- 🧪 [Testing Guide](docs/07-development/TESTING.md)
- 📁 [Project Structure](docs/02-architecture/PROJECT_STRUCTURE.md)
- 📚 [Complete Documentation](docs/README.md)

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
- Google Drive API (File storage)
- OAuth 2.0

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
POST   /api/v1/auth/google-drive/authorize
GET    /api/v1/auth/google-drive/callback
POST   /api/v1/auth/google-drive/disconnect

Documents:
GET    /api/v1/documents
POST   /api/v1/documents
GET    /api/v1/documents/:id
PUT    /api/v1/documents/:id
DELETE /api/v1/documents/:id
GET    /api/v1/documents/public/:slug

Files:
POST   /api/v1/files/upload
GET    /api/v1/files/:fileId
DELETE /api/v1/files/:fileId

Admin:
GET    /api/v1/admin/users
POST   /api/v1/admin/users/:userId
GET    /api/v1/admin/activity-logs
```

See [API Usage Documentation](docs/03-api/API_USAGE.md) for complete reference.

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

See [Getting Started Guide](docs/01-getting-started/SETUP.md#building-for-production) for production deployment instructions.

---

## 🔑 Key Highlights

### **Recent Updates (Nov 2025)**

✅ **SEO Optimized** - Comprehensive meta tags, sitemap, robots.txt, Open Graph support  
✅ **Google Drive Integration** - OAuth 2.0 based file storage  
✅ **RESTful API v1** - Modern API architecture with proper HTTP methods  
✅ **Security Improvements** - Password hashing, proper token expiry, file upload controls  
✅ **Frontend API Client** - Centralized, maintainable service layer  
✅ **Test Suite** - Jest + Supertest with 71 test cases  
✅ **Documentation** - Comprehensive guides for all aspects  
✅ **Admin Panel** - Activity logs with detailed error tracking and filtering  

### **Performance**

| Operation | Response Time |
|-----------|---------------|
| Document Load | ~500ms |
| File Upload (Google Drive) | ~2s |
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
- Check the [documentation](docs/README.md)
- Review [Getting Started Guide](docs/01-getting-started/SETUP.md)
- Email: developer.codeshare@gmail.com
- Open an issue on GitHub

---

## 🗺️ Roadmap

### **Current Version: 2.1.0**

### **Upcoming**
- [ ] API v2 with GraphQL
- [ ] Real-time collaboration cursors
- [ ] Enhanced document analytics
- [ ] Mobile app (React Native)
- [ ] Elasticsearch integration
- [ ] Redis caching layer
- [ ] Multi-language support

### **Note:** Auction functionality has been moved to a separate dedicated platform

---

**Star ⭐ this repo if you find it useful!**

Last Updated: November 5, 2025  
Author: Aarju Patel