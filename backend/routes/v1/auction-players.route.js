const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :auctionId
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const activityLogger = require('../../middleware/activityLogger');
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
router.get("/", activityLogger('player_get', 'auction'), getPlayers);
router.post("/", activityLogger('player_create', 'auction'), createPlayers);
router.put("/", activityLogger('player_update', 'auction'), updatePlayers); // Batch update
router.delete("/", activityLogger('player_delete', 'auction'), deletePlayers); // Batch delete

// Bulk import
router.post("/import", activityLogger('player_import', 'auction'), importPlayers);

// Template download
router.get("/template", activityLogger('player_import_template', 'auction'), generatePlayerTemplate);

module.exports = router;

