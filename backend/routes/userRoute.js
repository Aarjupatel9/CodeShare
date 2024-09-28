const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();

const {saveData, getData, saveFileNew, saveFile, removeFile,validateFile } = require("../controllers/userController");
const { multerUpload } = require("../services/s3BucketService");

router.route("/saveData").post(saveData);
router.route("/saveFile").post(validateFile, multerUpload.single("file"), saveFileNew);
router.route("/removeFile").post(removeFile);
router.route("/getData").post(getData);

module.exports = router;
