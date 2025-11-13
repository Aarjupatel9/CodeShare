const express = require('express');
const router = express.Router();

// Import all v1 routes
const authRoutes = require('./auth.route');
const documentRoutes = require('./documents.route');
const fileRoutes = require('./files.route'); // NEW: Independent file routes
const adminRoutes = require('./admin.route');

// Mount routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/files', fileRoutes); // NEW: Files are independent from documents
router.use('/admin', adminRoutes);

module.exports = router;

