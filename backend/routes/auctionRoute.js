const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const { createNewAuctionTeam,updateNewAuction,updateNewAuctionSet, auctionDataImports,createNewAuction, getAuctionDetails, createNewAuctionPlayer, removeNewAuctionPlayer, updateNewAuctionPlayer, createNewAuctionSet, removeNewAuctionTeam, removeNewAuctionSet } = require("../controllers/auctionController");
const { multerUpload } = require("../services/s3BucketService");

router.route("/get").post(getAuctionDetails);
router.route("/dataImports").post(auctionDataImports);

router.route("/create").post(createNewAuction);
router.route("/update").post(updateNewAuction);

router.route("/team/create").post(createNewAuctionTeam);
router.route("/team/remove").post(removeNewAuctionTeam);

router.route("/player/create").post(createNewAuctionPlayer);
router.route("/player/remove").post(removeNewAuctionPlayer);
router.route("/player/update").post(updateNewAuctionPlayer);

router.route("/set/create").post(createNewAuctionSet);
router.route("/set/update").post(updateNewAuctionSet);
router.route("/set/remove").post(removeNewAuctionSet);

module.exports = router;