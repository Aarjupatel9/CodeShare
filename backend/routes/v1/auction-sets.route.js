const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :auctionId
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
const activityLogger = require('../../middleware/activityLogger');
const { 
    getSets,
    createSet, 
    updateSet,
    deleteSet
} = require("../../controllers/v1/auctionSetController");

// All routes require authentication
router.use(authenticateUser());
router.use(authenticateAuction());

// Set CRUD
router.get("/", activityLogger('set_get', 'auction'), getSets);
router.post("/", activityLogger('set_create', 'auction'), createSet);
router.put("/:setId", activityLogger('set_update', 'auction'), updateSet);
router.delete("/:setId", activityLogger('set_delete', 'auction'), deleteSet);

module.exports = router;

