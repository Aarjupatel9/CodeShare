/**
 * Test Database Helper
 * Manages test database connection and cleanup
 */

const mongoose = require('mongoose');

class TestDatabase {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to test database
   * Uses the same MongoDB instance but with a test database
   */
  async connect() {
    try {
      // Close existing connection if any
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }

      // Use test database
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const testDbName = 'code_share_test';

      await mongoose.connect(MONGODB_URI, {
        dbName: testDbName,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
      });

      this.connection = mongoose.connection;
      console.log('✅ Test database connected');
    } catch (error) {
      console.error('❌ Test database connection failed:', error);
      throw error;
    }
  }

  /**
   * Clear all collections
   */
  async clearDatabase() {
    try {
      const collections = mongoose.connection.collections;

      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }

      console.log('🧹 Test database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('✅ Test database disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  }

  /**
   * Drop test database
   */
  async dropDatabase() {
    try {
      await mongoose.connection.dropDatabase();
      console.log('🗑️  Test database dropped');
    } catch (error) {
      console.error('Error dropping database:', error);
      throw error;
    }
  }
}

module.exports = new TestDatabase();

