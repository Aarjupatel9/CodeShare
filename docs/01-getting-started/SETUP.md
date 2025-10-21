# Getting Started with CodeShare

Complete guide to set up and run CodeShare locally.

---

## 📋 Prerequisites

### **Required Software**

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18+ | Backend & Frontend |
| **npm** | 9+ | Package management |
| **MongoDB** | 7.0+ | Database (or Atlas) |
| **Git** | 2.0+ | Version control |

### **Optional**
- Docker & Docker Compose (for containerized deployment)
- MongoDB Compass (database GUI)
- Postman (API testing)

---

## 🚀 Quick Start

### **1. Clone Repository**

```bash
git clone https://github.com/yourusername/CodeShare.git
cd CodeShare
```

### **2. Install Dependencies**

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

### **3. Configure Environment Variables**

#### **Backend (.env)**
Create `/backend/.env`:
```env
# Server
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Authentication
TOKEN_SECRET=your-secret-key-change-in-production
JWT_SEC=your-secret-key-change-in-production
JWT_EXP=7d

# CORS
ALLOWED_ORIGIN=http://localhost:3000,http://localhost
HOST_ORIGIN_IP=127.0.0.1

# File Upload
MAX_FILE_SIZE=20000000
ALLOW_FILE_LIMIT=test

# AWS S3 (for document files)
AWS_BUCKET_NAME=your-bucket-name
AWS_BUCKET_REGION=us-east-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
APP_EMAIL=your-email@gmail.com
APP_PASS=your-app-password
RESET_PASSWORD_LINK=http://localhost:8080/api/auth/reset-password
```

#### **Socket Server (.env)**
Create `/socketServer/.env`:
```env
ALLOWED_ORIGIN=http://localhost:3000,http://localhost
```

#### **Frontend (.env)**
Create `/frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8080
```

#### **Frontend Public Config**
Edit `/frontend/public/config.json`:
```json
{
  "backend_url": "http://localhost:8080",
  "backend_socket_url": "http://localhost:8081"
}
```

### **4. Start Services**

Open **3 terminal windows**:

#### **Terminal 1 - Backend**
```bash
cd backend
npm start
# Should see: "server started on PORT --> 8080"
# Should see: "Database service is up and running..."
```

#### **Terminal 2 - Socket Server**
```bash
cd socketServer
npm start
# Should see: "Socket Server running on port 8081"
```

#### **Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
# Should see: "webpack compiled successfully"
# Browser opens at: http://localhost:3000
```

---

## ✅ Verify Installation

### **Check Servers**

```bash
# Backend
curl http://localhost:8080/
# Should return: {"message":"server is up and running 🛠",...}

# Socket Server (check process)
lsof -i :8081
# Should show node process

# Frontend
curl http://localhost:3000/
# Should return HTML
```

### **Check Database**

```bash
# MongoDB connection test
cd backend
node -e "require('./DB/conn')" && echo "✅ DB Connected" || echo "❌ DB Failed"
```

---

## 🧪 Run Tests

```bash
cd backend

# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

---

## 🎯 Development Workflow

### **Daily Development**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
cd backend && npm install
cd frontend && npm install

# 3. Start all services (3 terminals)
cd backend && npm run dev        # Nodemon (auto-restart)
cd socketServer && npm start
cd frontend && npm run dev

# 4. Make changes and test

# 5. Run tests before committing
cd backend && npm test
```

### **Creating a Feature**

```bash
# 1. Create branch
git checkout -b feature/your-feature-name

# 2. Make changes

# 3. Run tests
cd backend && npm test

# 4. Commit
git add .
git commit -m "feat: your feature description"

# 5. Push
git push origin feature/your-feature-name

# 6. Create Pull Request
```

---

## 📁 Project Structure

```
CodeShare/
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.js           # Main app component
│   │   ├── pages/           # Route components
│   │   ├── services/api/    # API client layer
│   │   ├── auction/         # Auction features
│   │   ├── gamePlugin/      # Games
│   │   └── common/          # Shared components
│   └── public/
│       └── config.json      # Runtime configuration
│
├── backend/                  # Express API server
│   ├── src/app.js           # Express app
│   ├── server.js            # Entry point
│   ├── routes/
│   │   ├── v1/              # New RESTful routes
│   │   └── [old routes]     # Legacy compatibility
│   ├── controllers/
│   │   └── v1/              # New controllers
│   ├── models/              # Mongoose schemas
│   ├── services/            # Business logic
│   ├── middleware/          # Auth, validation
│   ├── public/
│   │   └── team-logos/      # Logo cache
│   ├── tests/               # Test suites
│   └── scripts/             # Utility scripts
│
├── socketServer/             # Socket.IO server
│   └── app.js
│
└── docs/                     # Documentation
    ├── api/
    ├── architecture/
    ├── development/
    └── testing/
```

---

## 🐛 Troubleshooting

### **Backend won't start**

```bash
# Check MongoDB connection
echo $MONGODB_URI

# Check port availability
lsof -i :8080

# Check logs
cd backend && npm start
```

### **Frontend won't start**

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check port
lsof -i :3000
```

### **Database connection fails**

```bash
# Test connection
cd backend
node -e "require('./DB/conn')"

# Check MongoDB Atlas
# 1. Is cluster running?
# 2. Is IP whitelisted?
# 3. Are credentials correct?
```

### **Tests failing**

```bash
# Clear test database
mongo code_share_test --eval "db.dropDatabase()"

# Run single test
npm test -- auth.test.js

# Check environment variables
cat .env
```

---

## 🔧 Common Tasks

### **Clean Up**

```bash
# Clear node_modules
rm -rf backend/node_modules frontend/node_modules socketServer/node_modules

# Clear caches
rm -rf backend/public/team-logos/*
rm -rf frontend/build

# Reinstall
npm install
```

### **Database Operations**

```bash
# Clear test database
mongo code_share_test --eval "db.dropDatabase()"

# Export data
mongodump --uri="your-uri" --out=backup/

# Import data
mongorestore --uri="your-uri" backup/
```

### **Logo Cache Cleanup**

```bash
# Manual cleanup
cd backend
npm run cleanup:logos

# Schedule cleanup (cron)
0 2 * * * cd /path/to/backend && npm run cleanup:logos
```

---

## 📦 Building for Production

### **Backend**

```bash
cd backend

# Run production server
NODE_ENV=production npm start

# Or with PM2
npm install -g pm2
pm2 start server.js --name codeshare-backend
```

### **Frontend**

```bash
cd frontend

# Build optimized bundle
npm run build

# Serve with static server
npx serve -s build -p 3000

# Or use Nginx (see docker-compose.yaml)
```

### **Docker Compose**

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

---

## 🌐 Accessing the Application

### **Development**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Socket Server: http://localhost:8081

### **Production**
- Application: http://your-domain.com
- API: http://your-domain.com/api
- Sockets: http://your-domain.com (Nginx proxy)

---

## 📚 Next Steps

After setup:

1. **Explore the UI**: http://localhost:3000
2. **Review API docs**: [API Reference](../api/API_RESTRUCTURE.md)
3. **Run tests**: `cd backend && npm test`
4. **Read architecture**: [System Design](../architecture/SYSTEM_DESIGN.md)

---

## 🆘 Getting Help

- Check documentation in `/docs`
- Review code examples
- Run tests to verify functionality
- Check GitHub issues

---

Last Updated: October 18, 2025

