const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema(
  {
    // File metadata
    name: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    
    // File content (base64 encoded)
    data: {
      type: String,
      required: true,
    },
    
    // Reference information
    entityType: {
      type: String,
      enum: ['team', 'player', 'auction', 'other'],
      default: 'other',
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
    },
    
    // File type categorization
    fileType: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'other'],
      default: 'other',
    },
    
    // Additional metadata
    description: {
      type: String,
    },
    tags: [{
      type: String,
    }],
    
    // User who uploaded
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
FileSchema.index({ entityType: 1, entityId: 1 });
FileSchema.index({ fileType: 1 });
FileSchema.index({ isActive: 1 });

// Virtual for data URL
FileSchema.virtual('dataUrl').get(function() {
  if (this.data && this.mimeType) {
    return `data:${this.mimeType};base64,${this.data}`;
  }
  return null;
});

// Ensure virtuals are included in JSON
FileSchema.set('toJSON', { virtuals: true });
FileSchema.set('toObject', { virtuals: true });

const FileModel = mongoose.model("File", FileSchema);

module.exports = FileModel;

