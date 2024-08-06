const express = require("express");
const DataModel = require("../models/dataModel");
const router = express.Router();

const {saveData, getData, saveFile, removeFile } = require("../controllers/userController")

router.route("/saveData").post(saveData);
router.route("/saveFile").post(saveFile);
router.route("/removeFile").post(removeFile);
router.route("/getData").post(getData);



module.exports = router;
