const mongoose = require("mongoose");

/**
 * File Model
 * Separate model for file storage - better performance and structure
 * Files are linked to documents but stored independently
 */
const fileSchema = new mongoose.Schema({
    // Link to owner (for quick user-based queries)
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userModals',
        required: true,
        index: true, // Index for fast owner-based queries
    },
    // File metadata
    name: {
        type: String,
        required: true,
        index: true, // Index for search by name
    },
    // Storage method: 'google_drive' (primary), 'mongodb' (for future)
    storageMethod: {
        type: String,
        enum: ['google_drive', 'mongodb'],
        default: 'google_drive',
        required: true,
    },
    // Google Drive fields
    googleDriveFileId: {
        type: String,
        required: function() { return this.storageMethod === 'google_drive'; },
        index: true, // Index for Google Drive lookups
    },
    downloadUrl: {
        type: String,
        required: false,
    },
    url: {
        type: String, // View link
        required: false,
    },
    // MongoDB GridFS fields (for future)
    gridfsId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: function() { return this.storageMethod === 'mongodb'; }
    },
    // Common fields
    type: {
        type: String, // MIME type
        required: true,
        index: true, // Index for filtering by file type
    },
    size: {
        type: Number, // File size in bytes
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true, // Index for sorting by upload date
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true, // Index for filtering non-deleted files
    },
}, { 
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'files' // Explicit collection name
});

// Compound indexes for common query patterns
// Index 1: Get all files for a user (most common query)
fileSchema.index({ owner: 1, isDeleted: 1, uploadedAt: -1 }, {
    name: 'owner_files_idx'
});

// Index 2: Search files by name
fileSchema.index({ name: 'text' }, {
    name: 'file_name_search_idx'
});

const FileModel = mongoose.model("FileModel", fileSchema);

module.exports = FileModel;

