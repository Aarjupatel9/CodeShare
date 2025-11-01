const mongoose = require("mongoose");

// Default retention period: 90 days (configurable via environment variable)
const ACTIVITY_LOG_RETENTION_DAYS = parseInt(process.env.ACTIVITY_LOG_RETENTION_DAYS || '90');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userModals',
        required: false, // Null for system events
        sparse: true, // Index only documents that have this field
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 'logout', 'register',
            'document_create', 'document_update', 'document_delete',
            'file_upload', 'file_download', 'file_delete',
            'auction_create', 'auction_join', 'auction_complete',
            'user_update', 'user_delete',
            'admin_action', // For admin-specific actions
            'system_error', 'system_warning'
        ],
        index: true, // Indexed for fast filtering
    },
    resourceType: {
        type: String, // 'document', 'file', 'auction', 'user', 'system'
        required: false,
        maxlength: 20, // Limit length to save space
    },
    resourceId: {
        type: String, // ID of the resource
        required: false,
        maxlength: 100, // Limit length
    },
    // Optimized details: store only essential info, limit size
    details: {
        type: Object,
        required: false,
        // Use mongoose schema to limit nested object size
        validate: {
            validator: function(v) {
                // Limit details object to 500 bytes (rough estimate)
                return JSON.stringify(v).length <= 500;
            },
            message: 'Details object is too large'
        }
    },
    ipAddress: {
        type: String,
        required: false,
        maxlength: 45, // IPv6 max length
    },
    // Truncate userAgent to save space (can be very long)
    userAgent: {
        type: String,
        required: false,
        maxlength: 200, // Limit to first 200 chars
        set: function(v) {
            // Truncate if longer than 200 chars
            return v ? v.substring(0, 200) : v;
        }
    }
}, { 
    timestamps: true,
    // Enable collection-level compression
    collection: 'activitylogs' // Lowercase for MongoDB best practices
});

// TTL Index: Auto-delete logs older than retention period
// This prevents database from growing indefinitely
activityLogSchema.index(
    { createdAt: 1 }, 
    { 
        expireAfterSeconds: ACTIVITY_LOG_RETENTION_DAYS * 24 * 60 * 60,
        name: 'activity_logs_ttl'
    }
);

// Compound indexes for performance (most common queries)
// Index 1: User activity lookup (most common)
activityLogSchema.index({ userId: 1, createdAt: -1 }, { 
    name: 'user_activity_idx',
    sparse: true // Only index documents with userId
});

// Index 2: Action filtering (for statistics)
activityLogSchema.index({ action: 1, createdAt: -1 }, {
    name: 'action_time_idx'
});

// Index 3: Resource lookup (less common, but useful)
activityLogSchema.index({ resourceType: 1, resourceId: 1 }, {
    name: 'resource_lookup_idx',
    sparse: true,
    partialFilterExpression: { resourceType: { $exists: true } }
});

// Remove unnecessary index (createdAt alone - covered by compound indexes)
// The TTL index on createdAt already provides time-based queries

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;

