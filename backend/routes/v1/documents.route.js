const express = require("express");
const router = express.Router();
const authenticateUser = require('../../middleware/Authmiddleware');
const { 
    getDocument, 
    getDocuments,
    createDocument, 
    updateDocument, 
    deleteDocument,
    getDocumentVersions,
    uploadFile, 
    downloadFile,  // NEW
    deleteFile, 
    validateFile,
    renameDocument,
    reorderDocuments,
    togglePinDocument
} = require("../../controllers/v1/documentController");
const multer = require("multer");

// Memory storage for Google Drive (files go through server as buffer)
const memoryStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }, // 5MB default
});

// Public document routes
router.get("/public/:slug", getDocument);

// Protected document routes (require authentication)
router.use(authenticateUser());

// Document CRUD
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.post("/", createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// Document versions
router.get("/:id/versions", getDocumentVersions);

// Document management
router.patch("/:id/rename", renameDocument);
router.patch("/reorder", reorderDocuments);
router.patch("/:id/pin", togglePinDocument);

// File management
// Use memory storage to support both S3 and Google Drive
// Note: For S3, we'll need to handle this in the controller or use a middleware
router.post("/:id/files", validateFile, memoryStorage.single("file"), uploadFile);
router.get("/:id/files/:fileId", downloadFile);  // NEW: Download endpoint
router.delete("/:id/files/:fileId", deleteFile);

module.exports = router;

