const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const { saveData, getData, saveFileNew, saveFile, removeFile, validateFile, removePage } = require("../controllers/userController");
const { multerUpload } = require("../services/s3BucketService");

router.route("/getData").post(getData);
router.route("/saveData").post(saveData);
router.route("/removeFile").post(removeFile);
router.route("/p/getData").post(authenticateUser(), getData);
router.route("/p/removePage").post(authenticateUser(), removePage);
router.route("/p/saveData").post(authenticateUser(), saveData);
router.route("/p/saveFile").post(authenticateUser(), validateFile, multerUpload.single("file"), saveFileNew);
router.route("/p/removeFile").post(authenticateUser(), removeFile);

module.exports = router;