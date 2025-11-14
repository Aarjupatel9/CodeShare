# CodeShare Documentation

**Last Updated**: November 5, 2025  
**Version**: 2.1  
**Author**: Aarju Patel

---

## 📖 Welcome to CodeShare

CodeShare is a modern collaborative document editor and code sharing platform featuring:
- 📝 **Document Editor**: Real-time collaborative editing with TinyMCE
- 📁 **File Management**: Google Drive integration for file uploads
- 🔒 **Authentication**: Secure JWT-based auth with Google OAuth
- 🎮 **Gaming**: Built-in casual games with score tracking
- 🚀 **SEO Optimized**: Comprehensive meta tags and social media integration

---

## 🗂️ Documentation Index

### 🚀 [Getting Started](./01-getting-started/README.md)
Quick start guide, installation, and deployment instructions.

### 🏗️ [Architecture](./02-architecture/README.md)
System design, database schema, and server architecture.

### 🔌 [API Reference](./03-api/README.md)
REST API endpoints, Socket.IO events, and authentication.

### ✨ [Features](./04-features/README.md)
Detailed guides for document collaboration, file management, and more.

### ⚡ [Performance](./05-performance/CAPACITY_ANALYSIS.md)
Optimization strategies, capacity analysis, and server sizing.

### 💻 [Development](./07-development/README.md)
Contributing guidelines, testing, and troubleshooting.

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone <repo-url>

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit .env file with your configuration

# 4. Start server
cd backend && npm start          # Port 8080 (API + Socket.IO)
cd frontend && npm start         # Port 3000

# 5. Access application
# http://localhost:3000
```

See [Getting Started Guide](./01-getting-started/SETUP.md) for details.

---

## 🏗️ Architecture Overview

### **Single Server Setup:**

```
┌─────────────────────────────────────────┐
│ Frontend (Nginx - Port 80)              │
│ - React application                     │
│ - Static file serving                   │
└─────────────────────────────────────────┘
            ↓ HTTP/REST API + Socket.IO
┌─────────────────────────────────────────┐
│ Backend Server (Port 8080)              │
│ - Express.js REST API                   │
│ - Socket.IO (document collaboration)    │
│ - MongoDB integration                   │
│ - Authentication & authorization        │
└─────────────────────────────────────────┘
```

See [System Design](./02-architecture/SYSTEM_DESIGN.md) for details.

---

## 📊 Key Features

### 📝 Document Editor
- Rich text editing with TinyMCE
- Real-time collaboration via Socket.IO
- Version control (last 30 versions)
- Public/private document access
- Slug-based URL sharing

### 📁 File Management
- Google Drive OAuth 2.0 integration
- Per-user file upload controls
- File size limits
- Drag-and-drop file uploads
- Search, rename, delete, pin files

### 🔒 Security & Admin
- JWT authentication
- Password hashing with bcrypt
- Admin activity logging
- User management panel
- Detailed error tracking

### 🚀 SEO & Performance
- Comprehensive meta tags (Open Graph, Twitter Cards)
- sitemap.xml and robots.txt
- PWA support with manifest.json
- Fast and lightweight

---

## 🔗 Important Links

- [API Documentation](./03-api/README.md)
- [Database Schema](./02-architecture/DATABASE_SCHEMA.md)
- [Testing Guide](./07-development/TESTING.md)
- [Performance Optimization](./05-performance/OPTIMIZATION_SUMMARY.md)

---

## 📞 Support

For issues, questions, or contributions:
- **Email**: developer.codeshare@gmail.com
- Review [Testing Guide](./07-development/TESTING.md)
- See [Development README](./07-development/README.md)

---

**Happy Coding!** 🚀

---

**Author**: Aarju Patel  
**Contact**: developer.codeshare@gmail.com
