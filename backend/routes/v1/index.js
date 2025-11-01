const express = require('express');
const router = express.Router();

// Import all v1 routes
const authRoutes = require('./auth.route');
const documentRoutes = require('./documents.route');
const fileRoutes = require('./files.route'); // NEW: Independent file routes
const auctionRoutes = require('./auctions.route');
const auctionTeamRoutes = require('./auction-teams.route');
const auctionPlayerRoutes = require('./auction-players.route');
const auctionSetRoutes = require('./auction-sets.route');
const adminRoutes = require('./admin.route');

// Mount routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/files', fileRoutes); // NEW: Files are independent from documents
router.use('/auctions', auctionRoutes);
router.use('/admin', adminRoutes);

// Nested auction routes
router.use('/auctions/:auctionId/teams', auctionTeamRoutes);
router.use('/auctions/:auctionId/players', auctionPlayerRoutes);
router.use('/auctions/:auctionId/sets', auctionSetRoutes);

module.exports = router;

