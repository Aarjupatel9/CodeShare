const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :auctionId
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const { 
    getPlayers,
    createPlayers, 
    updatePlayers,
    deletePlayers,
    importPlayers,
    generatePlayerTemplate
} = require("../../controllers/v1/auctionPlayerController");

// All routes require authentication
router.use(authenticateUser());
router.use(authenticateAuction());

// Player CRUD
router.get("/", getPlayers);
router.post("/", createPlayers);
router.put("/", updatePlayers); // Batch update
router.delete("/", deletePlayers); // Batch delete

// Bulk import
router.post("/import", importPlayers);

// Template download
router.get("/template", generatePlayerTemplate);

module.exports = router;

