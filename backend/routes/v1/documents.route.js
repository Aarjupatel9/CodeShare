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
    deleteFile, 
    validateFile 
} = require("../../controllers/v1/documentController");
const { multerUpload } = require("../../services/s3BucketService");

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

// File management
router.post("/:id/files", validateFile, multerUpload.single("file"), uploadFile);
router.delete("/:id/files/:fileId", deleteFile);

module.exports = router;

