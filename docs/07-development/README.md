# Development Guide

Guide for developers working on CodeShare.

---

## 🛠️ Development Setup

See [Getting Started](../01-getting-started/README.md) for initial setup.

---

## 📁 Project Structure

```
CodeShare/
├── backend/              # Node.js Express API
│   ├── controllers/      # Request handlers
│   │   └── v1/          # V1 API controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   │   └── v1/          # V1 API routes
│   ├── middleware/      # Auth, validation
│   ├── services/        # Business logic
│   └── socket/          # (empty - socket on separate server)
│
├── socketServer/         # Socket.IO server
│   └── app.js           # Main socket server
│
├── frontend/            # React application
│   ├── src/
│   │   ├── auction/     # Auction features
│   │   ├── pages/       # Main pages
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   │   ├── api/     # V1 API clients
│   │   │   └── *.jsx    # Legacy services
│   │   └── hooks/       # Custom React hooks
│   └── public/
│       └── config.json  # Backend URLs
│
└── docs/                # Documentation
    ├── 01-getting-started/
    ├── 02-architecture/
    ├── 03-api/
    ├── 04-features/
    ├── 05-performance/
    └── 07-development/
```

---

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow existing code style
- Add comments for complex logic
- Update documentation

### 3. Test Changes
```bash
# Backend tests
cd backend
npm test

# Frontend (manual testing)
cd frontend
npm start
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push & Create PR
```bash
git push origin feature/your-feature-name
```

---

## 📝 Coding Standards

### Backend (Node.js):
- **Style**: Standard JavaScript
- **Imports**: At top of file
- **Error Handling**: Try-catch blocks
- **Logging**: console.log/error with emojis
- **Comments**: JSDoc for functions

### Frontend (React):
- **Components**: Functional components with hooks
- **State**: useState for local, context for global
- **Styling**: TailwindCSS utility classes
- **File naming**: PascalCase for components

### API Design:
- **REST**: Use proper HTTP methods (GET, POST, PUT, DELETE)
- **Endpoints**: `/api/v1/resource/:id/sub-resource`
- **Responses**: Always `{ success, message, data }`
- **Errors**: Proper status codes (400, 401, 404, 500)

---

## 🧪 Testing

See [TESTING.md](./TESTING.md) for detailed testing guide.

### Quick Test Commands:
```bash
# Backend unit tests
cd backend && npm test

# Integration tests
npm run test:integration

# Manual testing checklist
- Login/Logout flow
- Create auction
- Add teams/players
- Start bidding
- View live page
- Check analytics
```

---

## 🐛 Debugging

### Backend Debugging:
```bash
# Enable debug logs
DEBUG=* npm start

# Or use Node inspector
node --inspect server.js
```

### Socket Server Debugging:
```bash
# Check socket_usage.log
tail -f socketServer/socket_usage.log

# Check connections
# Logs every 10 seconds
```

### Frontend Debugging:
- Use React DevTools
- Check Network tab for API calls
- Check Console for errors
- Use Redux DevTools (if using Redux)

---

## 📦 Dependencies

### Adding New Dependencies:

**Backend:**
```bash
cd backend
npm install package-name
# Update package.json
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

**Best Practices:**
- Use specific versions (not `^` or `~`)
- Document why dependency is needed
- Check bundle size impact

---

## 🔒 Security Best Practices

1. **Never commit .env files**
2. **Use environment variables** for secrets
3. **Validate all inputs** on backend
4. **Sanitize user data** before DB insertion
5. **Use prepared statements** (Mongoose does this)
6. **Check authentication** on protected routes
7. **Use HTTPS** in production
8. **Set secure cookie flags**

---

## 📚 Helpful Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Socket.IO Docs](https://socket.io/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [TailwindCSS Docs](https://tailwindcss.com/)

---

## 🆘 Need Help?

- Review [API Documentation](../03-api/README.md)
- See [Architecture Docs](../02-architecture/README.md)
- Check [Getting Started](../01-getting-started/README.md)

---

**Happy Developing!** 💻

