const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :auctionId
const authenticateUser = require('../../middleware/Authmiddleware');
const authenticateAuction = require('../../middleware/AuctionMiddleware');
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
router.get("/", getSets);
router.post("/", createSet);
router.put("/:setId", updateSet);
router.delete("/:setId", deleteSet);

module.exports = router;

