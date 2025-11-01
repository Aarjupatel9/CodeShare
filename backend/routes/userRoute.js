const express = require("express");
const router = express.Router();
const authenticateUser = require('../middleware/Authmiddleware');
const activityLogger = require('../middleware/activityLogger');
const { saveData, getData, removePage } = require("../controllers/userController");

// Document routes
router.route("/getData").post(activityLogger('document_get', 'document'), getData);
router.route("/saveData").post(activityLogger('document_update', 'document'), saveData);
router.route("/p/getData").post(authenticateUser(), activityLogger('document_get', 'document'), getData);
router.route("/p/removePage").post(authenticateUser(), activityLogger('document_delete', 'document'), removePage);
router.route("/p/saveData").post(authenticateUser(), activityLogger('document_update', 'document'), saveData);

// NOTE: File management routes have been removed - use /api/v1/files for file operations
// Files are now independent from documents

module.exports = router;