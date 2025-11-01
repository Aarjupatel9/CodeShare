const express = require("express");
const router = express.Router();
const authenticateUser = require('../../middleware/Authmiddleware');
const activityLogger = require('../../middleware/activityLogger');
const { 
    uploadFile, 
    downloadFile,
    deleteFile, 
    getFiles,
    validateFile,
} = require("../../controllers/v1/fileController");
const multer = require("multer");

// Memory storage for Google Drive (files go through server as buffer)
// Note: File size limit is now checked in validateFile middleware using user's limit
// Setting a high limit here to allow validateFile to enforce per-user limits
const memoryStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max (validateFile will enforce per-user limit)
});

// All file routes require authentication
router.use(authenticateUser());

// File management (independent from documents)
router.get("/", activityLogger('file_get', 'file'), getFiles); // Get all files for user
router.post("/", validateFile, memoryStorage.single("file"), activityLogger('file_upload', 'file'), uploadFile); // Upload file (no document required)
router.get("/:fileId", activityLogger('file_download', 'file'), downloadFile); // Download file
router.delete("/:fileId", activityLogger('file_delete', 'file'), deleteFile); // Delete file

module.exports = router;

