const mongoose = require('mongoose');

const viewerAnalyticsSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionModel',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  viewerCount: {
    type: Number,
    required: true,
    default: 0
  },
  avgViewers: {
    type: Number,
    default: 0
  },
  peakViewers: {
    type: Number,
    default: 0
  },
  minViewers: {
    type: Number,
    default: 0
  },
  sampleCount: {
    type: Number,
    default: 0,
    comment: 'Number of 5-second samples in this minute'
  }
}, {
  timestamps: true
});

// TTL index - auto-delete after 90 days
viewerAnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Compound index for efficient queries
viewerAnalyticsSchema.index({ auction: 1, timestamp: -1 });

const ViewerAnalytics = mongoose.model('ViewerAnalytics', viewerAnalyticsSchema);
module.exports = ViewerAnalytics;

