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
    renameDocument,
    reorderDocuments,
    togglePinDocument
} = require("../../controllers/v1/documentController");

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

// Note: File management has been moved to /api/v1/files (files are independent from documents)

module.exports = router;

