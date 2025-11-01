const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const activityLogger = require('../middleware/activityLogger');
const { checkPublicAvailability, auctionLogin, createNewAuctionTeam, updateNewAuctionTeam, updateNewAuction, updateNewAuctionSet, auctionDataImports, createNewAuction, getAuctionDetails, createNewAuctionPlayer, removeNewAuctionPlayer, updateNewAuctionPlayer, createNewAuctionSet, removeNewAuctionTeam, removeNewAuctionSet, saveTeamLogo, auctionLogout } = require("../controllers/auctionController");
const { multerUpload } = require("../services/s3BucketService");
const authenticateAuction = require('../middleware/AuctionMiddleware');


router.route("/login").post(authenticateUser(), activityLogger('auction_login', 'auction'), auctionLogin);
router.route("/logout").post(activityLogger('auction_logout', 'auction'), auctionLogout);

router.route("/public/get").post(checkPublicAvailability(), activityLogger('auction_get', 'auction'), getAuctionDetails);
router.route("/get").post(authenticateUser(), authenticateAuction(), activityLogger('auction_get', 'auction'), getAuctionDetails);
router.route("/dataImports").post(authenticateUser(), authenticateAuction(), activityLogger('player_import', 'auction'), auctionDataImports);

router.route("/create").post(authenticateUser(), activityLogger('auction_create', 'auction'), createNewAuction);
router.route("/update").post(authenticateUser(), authenticateAuction(), activityLogger('auction_update', 'auction'), updateNewAuction);

router.route("/team/create").post(authenticateUser(), authenticateAuction(), activityLogger('team_create', 'auction'), createNewAuctionTeam);
router.route("/team/update").post(authenticateUser(), authenticateAuction(), activityLogger('team_update', 'auction'), updateNewAuctionTeam);
router.route("/team/remove").post(authenticateUser(), authenticateAuction(), activityLogger('team_delete', 'auction'), removeNewAuctionTeam);
router.route("/team/logo/upload").post(authenticateUser(), authenticateAuction(), activityLogger('team_logo_upload', 'auction'), saveTeamLogo);

router.route("/player/create").post(authenticateUser(), authenticateAuction(), activityLogger('player_create', 'auction'), createNewAuctionPlayer);
router.route("/player/remove").post(authenticateUser(), authenticateAuction(), activityLogger('player_delete', 'auction'), removeNewAuctionPlayer);
router.route("/player/update").post(authenticateUser(), authenticateAuction(), activityLogger('player_update', 'auction'), updateNewAuctionPlayer);

router.route("/set/create").post(authenticateUser(), authenticateAuction(), activityLogger('set_create', 'auction'), createNewAuctionSet);
router.route("/set/update").post(authenticateUser(), authenticateAuction(), activityLogger('set_update', 'auction'), updateNewAuctionSet);
router.route("/set/remove").post(authenticateUser(), authenticateAuction(), activityLogger('set_delete', 'auction'), removeNewAuctionSet);

module.exports = router;