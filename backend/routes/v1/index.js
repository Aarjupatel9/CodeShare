const express = require('express');
const router = express.Router();

// Import all v1 routes
const authRoutes = require('./auth.route');
const documentRoutes = require('./documents.route');
const auctionRoutes = require('./auctions.route');
const auctionTeamRoutes = require('./auction-teams.route');
const auctionPlayerRoutes = require('./auction-players.route');
const auctionSetRoutes = require('./auction-sets.route');

// Mount routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/auctions', auctionRoutes);

// Nested auction routes
router.use('/auctions/:auctionId/teams', auctionTeamRoutes);
router.use('/auctions/:auctionId/players', auctionPlayerRoutes);
router.use('/auctions/:auctionId/sets', auctionSetRoutes);

module.exports = router;

