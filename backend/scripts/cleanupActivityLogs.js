/**
 * Activity Log Cleanup Script
 * Optional: Manual cleanup script for old activity logs
 * Run periodically via cron job or scheduled task
 * 
 * Usage: node scripts/cleanupActivityLogs.js
 */

require('dotenv').config();
require('../DB/conn');
const ActivityLog = require('../models/activityLogModel');
const mongoose = require('mongoose');

const RETENTION_DAYS = parseInt(process.env.ACTIVITY_LOG_RETENTION_DAYS || '90');
const CUTOFF_DATE = new Date();
CUTOFF_DATE.setDate(CUTOFF_DATE.getDate() - RETENTION_DAYS);

async function cleanupActivityLogs() {
  try {
    console.log(`Starting cleanup of activity logs older than ${RETENTION_DAYS} days...`);
    console.log(`Cutoff date: ${CUTOFF_DATE.toISOString()}`);

    // Count logs to be deleted
    const countBefore = await ActivityLog.countDocuments({ createdAt: { $lt: CUTOFF_DATE } });
    console.log(`Found ${countBefore} logs to delete`);

    if (countBefore === 0) {
      console.log('No logs to clean up');
      process.exit(0);
    }

    // Delete old logs
    const result = await ActivityLog.deleteMany({ 
      createdAt: { $lt: CUTOFF_DATE } 
    });

    console.log(`✅ Cleaned up ${result.deletedCount} activity logs`);
    console.log(`Remaining logs: ${await ActivityLog.countDocuments({})}`);

    // Optional: Get collection stats
    const stats = await mongoose.connection.db.collection('activitylogs').stats();
    console.log(`Collection size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupActivityLogs();

