/**
 * Migration Script: Fix Auction Unique Index
 * 
 * Problem: Auction names were globally unique (across all users)
 * Solution: Make auction names unique per organizer
 * 
 * This script ONLY handles indexes - does NOT modify data
 * Backward compatibility is handled in the controllers
 * 
 * Run: node backend/scripts/fix-auction-unique-index.js
 */

const mongoose = require('mongoose');
const AuctionModel = require('../models/auctionModel');

// Load environment variables
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_share';

async function fixAuctionIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      dbName: "code_share",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await AuctionModel.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the old 'name' unique index if it exists
    console.log('\n🗑️  Dropping old unique index on "name" field...');
    try {
      await AuctionModel.collection.dropIndex('name_1');
      console.log('✅ Successfully dropped old "name" index');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('⚠️  Index "name_1" not found (might already be dropped)');
      } else {
        throw error;
      }
    }

    // Ensure the new compound index exists
    console.log('\n✨ Ensuring compound unique index on (name + organizer)...');
    try {
      await AuctionModel.collection.createIndex(
        { name: 1, organizer: 1 }, 
        { unique: true }
      );
      console.log('✅ Compound unique index created');
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('✅ Compound unique index already exists');
      } else {
        throw error;
      }
    }

    // Show final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await AuctionModel.collection.getIndexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📌 Summary:');
    console.log('   - Dropped global unique constraint on "name"');
    console.log('   - Added compound unique index on (name + organizer)');
    console.log('   - Auction names are now unique per organizer, not globally');
    console.log('   - Backward compatibility handled in controllers');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
fixAuctionIndex();
