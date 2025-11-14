# Features Documentation

Comprehensive guides for all CodeShare features.

---

## 📝 Document Editor

### Real-Time Collaboration
- Multiple users editing simultaneously
- Real-time synchronization via Socket.IO
- Auto-save functionality
- Version history (last 30 versions)
- Public/private document access
- Slug-based URL sharing

### Rich Text Editing
- TinyMCE rich text editor
- Syntax highlighting support
- Custom formatting options
- Document organization (pin, rename, reorder)

---

## 📁 File Management

### Google Drive Integration
- OAuth 2.0 authentication
- Secure file uploads
- Per-user file controls
- Configurable file size limits
- Drag-and-drop uploads

### File Operations
- Upload files to Google Drive
- Search and filter files
- Rename and delete files
- Pin important files
- File organization

---

## 🔔 Real-Time Updates

### Socket.IO Events:
- Document synchronization (`room_message`)
- Real-time collaboration updates
- Connection/disconnection tracking

---

## 🔒 Security & Admin

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Secure session management

### Admin Panel
- User management
- Activity logging
- Document management
- Detailed error tracking

---

## 📚 Detailed Guides

For more information, see:
- [API Usage Guide](../03-api/API_USAGE.md) - API endpoints
- [System Architecture](../02-architecture/README.md) - System design

---

**Explore the features!** 🚀

