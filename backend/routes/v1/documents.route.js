const express = require("express");
const router = express.Router();
const authenticateUser = require('../../middleware/Authmiddleware');
const activityLogger = require('../../middleware/activityLogger');
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
router.get("/", activityLogger('document_get', 'document'), getDocuments);
router.get("/:id", activityLogger('document_get', 'document'), getDocument);
router.post("/", activityLogger('document_create', 'document'), createDocument);
router.put("/:id", activityLogger('document_update', 'document'), updateDocument);
router.delete("/:id", activityLogger('document_delete', 'document'), deleteDocument);

// Document versions
router.get("/:id/versions", activityLogger('document_versions', 'document'), getDocumentVersions);

// Document management
router.patch("/:id/rename", activityLogger('document_rename', 'document'), renameDocument);
router.patch("/reorder", activityLogger('document_reorder', 'document'), reorderDocuments);
router.patch("/:id/pin", activityLogger('document_pin', 'document'), togglePinDocument);

// File management
// Use memory storage to support both S3 and Google Drive
// Note: For S3, we'll need to handle this in the controller or use a middleware
router.post("/:id/files", validateFile, memoryStorage.single("file"), activityLogger('file_upload', 'file'), uploadFile);
router.get("/:id/files/:fileId", activityLogger('file_download', 'file'), downloadFile);  // NEW: Download endpoint
router.delete("/:id/files/:fileId", activityLogger('file_delete', 'file'), deleteFile);

module.exports = router;

