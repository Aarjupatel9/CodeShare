const express = require("express");
const DataModel = require("../models/dataModels");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const activityLogger = require('../middleware/activityLogger');
const { saveData, getData, saveFileNew, saveFile, removeFile, validateFile, removePage } = require("../controllers/userController");
const { multerUpload } = require("../services/s3BucketService");

router.route("/getData").post(activityLogger('document_get', 'document'), getData);
router.route("/saveData").post(activityLogger('document_update', 'document'), saveData);
router.route("/removeFile").post(activityLogger('file_delete', 'file'), removeFile);
router.route("/p/getData").post(authenticateUser(), activityLogger('document_get', 'document'), getData);
router.route("/p/removePage").post(authenticateUser(), activityLogger('document_delete', 'document'), removePage);
router.route("/p/saveData").post(authenticateUser(), activityLogger('document_update', 'document'), saveData);
router.route("/p/saveFile").post(authenticateUser(), validateFile, multerUpload.single("file"), activityLogger('file_upload', 'file'), saveFileNew);
router.route("/p/removeFile").post(authenticateUser(), activityLogger('file_delete', 'file'), removeFile);

module.exports = router;