# Getting Started with CodeShare

## 📋 Prerequisites

- **Node.js**: v14+ (recommended: v18+)
- **MongoDB**: v4.4+ or MongoDB Atlas account
- **npm**: v6+
- **Git**: Latest version

---

## 🚀 Quick Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd CodeShare
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Socket Server
cd ../socketServer
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env

# Edit .env:
PORT=8080
MONGODB_URI=mongodb://localhost:27017/codeshare
JWT_SECRET=your-secret-key
INTERNAL_API_KEY=your-internal-key-123
ALLOWED_ORIGIN=http://localhost:3000
```

**Socket Server (.env):**
```bash
cd socketServer
cp .env.example .env

# Edit .env:
PORT=8081
BACKEND_API_URL=http://localhost:8080
INTERNAL_API_KEY=your-internal-key-123  # Same as backend
ALLOWED_ORIGIN=http://localhost:3000
```

**Frontend (config.json):**
```bash
cd frontend/public

# Edit config.json:
{
  "backend_url": "http://localhost:8080",
  "backend_socket_url": "http://localhost:8081"
}
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm start
# Should see: 🚀 Server started on PORT --> 8080

# Terminal 2 - Socket Server
cd socketServer
npm start
# Should see: 🚀 Socket Server running on port 8081

# Terminal 3 - Frontend
cd frontend
npm start
# Opens browser at http://localhost:3000
```

---

## ✅ Verify Installation

### 1. Check Backend:
```bash
curl http://localhost:8080/
# Should return: {"message": "server is up and running 🛠", ...}
```

### 2. Check Socket Server:
```bash
# Check logs for: "Socket Server running on port 8081"
```

### 3. Check Frontend:
- Open http://localhost:3000
- Should see login page
- No console errors

---

## 👤 Create First User

1. Go to http://localhost:3000/auth/register
2. Register a new account
3. Login with credentials
4. Start creating documents!

---

## 📝 Create First Document

1. Login to your account
2. Click "New Document" or "+" button
3. Start typing in the rich text editor
4. Use formatting tools (bold, italic, lists, etc.)
5. Save your document
6. Share via public link or keep it private

---

## 📁 Setup Google Drive (Optional)

For file upload functionality:

1. Get Google OAuth credentials (see SETUP.md)
2. Add credentials to backend .env
3. Go to Profile → Connect Google Drive
4. Upload files to your documents

---

## 🔧 Troubleshooting

### MongoDB Connection Error:
```bash
# Make sure MongoDB is running:
mongod --version
# Or use MongoDB Atlas connection string
```

### Port Already in Use:
```bash
# Change PORT in .env files
# Or kill existing process:
lsof -ti:8080 | xargs kill
```

### Socket Connection Failed:
- Check `backend_socket_url` in frontend/public/config.json
- Verify socket server is running on correct port
- Check CORS settings in socket server

---

## 📚 Next Steps

- [System Architecture](../02-architecture/SYSTEM_DESIGN.md)
- [API Documentation](../03-api/README.md)
- [Feature Guides](../04-features/README.md)
- [Development Guide](../07-development/README.md)

---

**Need help?** See [Development README](../07-development/README.md)

