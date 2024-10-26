const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const { saveData, getData, saveFileNew, saveFile, removeFile, validateFile } = require("../controllers/userController");
const { multerUpload } = require("../services/s3BucketService");

router.route("/saveData").post(saveData);
router.route("/p/saveData").post(authenticateUser(), saveData);
router.route("/saveFile").post(validateFile, multerUpload.single("file"), saveFileNew);
router.route("/removeFile").post(removeFile);
router.route("/p/removeFile").post(authenticateUser(), removeFile);
router.route("/getData").post(getData);
router.route("/p/getData").post(authenticateUser(), getData);

module.exports = router;