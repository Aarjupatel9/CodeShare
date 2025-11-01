/**
 * Migration Script: Set Default Values for User Fields
 * 
 * This script sets default values for existing users who don't have:
 * - role field (defaults to 'user')
 * - isActive field (defaults to true)
 * 
 * Usage:
 *   node backend/scripts/migrateUserDefaults.js
 * 
 * Or with MongoDB connection:
 *   MONGO_URI=your_mongo_uri node backend/scripts/migrateUserDefaults.js
 */

const mongoose = require('mongoose');
const UserModel = require('../models/userModels');

// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function migrateUserDefaults() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI or MONGO_URI environment variable is required');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find users without role field and set default to 'user'
    const roleUpdateResult = await UserModel.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    console.log(`✅ Updated ${roleUpdateResult.modifiedCount} users without role field (set to 'user')`);

    // Find users without isActive field and set default to true
    const isActiveUpdateResult = await UserModel.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✅ Updated ${isActiveUpdateResult.modifiedCount} users without isActive field (set to true)`);

    // Optional: Set isActive to true for users where isActive is null
    const nullActiveUpdateResult = await UserModel.updateMany(
      { isActive: null },
      { $set: { isActive: true } }
    );
    if (nullActiveUpdateResult.modifiedCount > 0) {
      console.log(`✅ Updated ${nullActiveUpdateResult.modifiedCount} users with null isActive (set to true)`);
    }

    // Summary
    const totalUpdated = roleUpdateResult.modifiedCount + isActiveUpdateResult.modifiedCount + nullActiveUpdateResult.modifiedCount;
    console.log(`\n✅ Migration complete! Total documents updated: ${totalUpdated}`);

    // Verify: Count users with defaults
    const usersWithDefaults = await UserModel.countDocuments({
      role: { $exists: true },
      isActive: { $exists: true, $ne: null }
    });
    const totalUsers = await UserModel.countDocuments({});
    console.log(`\n📊 Verification: ${usersWithDefaults}/${totalUsers} users have both role and isActive fields`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateUserDefaults();
}

module.exports = migrateUserDefaults;

