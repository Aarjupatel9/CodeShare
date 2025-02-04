const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const { checkPublicAvailability, auctionLogin, createNewAuctionTeam, updateNewAuction, updateNewAuctionSet, auctionDataImports, createNewAuction, getAuctionDetails, createNewAuctionPlayer, removeNewAuctionPlayer, updateNewAuctionPlayer, createNewAuctionSet, removeNewAuctionTeam, removeNewAuctionSet, saveTeamLogo, auctionLogout } = require("../controllers/auctionController");
const { multerUpload } = require("../services/s3BucketService");
const authenticateAuction = require('../middleware/AuctionMiddleware');


router.route("/login").post(authenticateUser(), auctionLogin);
router.route("/logout").post(auctionLogout);

router.route("/public/get").post(checkPublicAvailability(), getAuctionDetails);
router.route("/get").post(authenticateUser(), authenticateAuction(), getAuctionDetails);
router.route("/dataImports").post(authenticateUser(), authenticateAuction(), auctionDataImports);

router.route("/create").post(authenticateUser(), createNewAuction);
router.route("/update").post(authenticateUser(), authenticateAuction(), updateNewAuction);

router.route("/team/create").post(authenticateUser(), authenticateAuction(), createNewAuctionTeam);
router.route("/team/remove").post(authenticateUser(), authenticateAuction(), removeNewAuctionTeam);
router.route("/team/logo").post(authenticateUser(), authenticateAuction(), multerUpload.single("file"), saveTeamLogo);

router.route("/player/create").post(authenticateUser(), authenticateAuction(), createNewAuctionPlayer);
router.route("/player/remove").post(authenticateUser(), authenticateAuction(), removeNewAuctionPlayer);
router.route("/player/update").post(authenticateUser(), authenticateAuction(), updateNewAuctionPlayer);

router.route("/set/create").post(authenticateUser(), authenticateAuction(), createNewAuctionSet);
router.route("/set/update").post(authenticateUser(), authenticateAuction(), updateNewAuctionSet);
router.route("/set/remove").post(authenticateUser(), authenticateAuction(), removeNewAuctionSet);

module.exports = router;