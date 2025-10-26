const fs = require('fs').promises;
const path = require('path');

const PUBLIC_LOGOS_DIR = path.join(__dirname, '../public/uploads/teams');

// Get max size from environment variable (default: 50MB)
// For testing: Set LOGO_FOLDER_MAX_SIZE_MB=1 in .env
const MAX_DIR_SIZE_MB = parseInt(process.env.LOGO_FOLDER_MAX_SIZE_MB || '50');
const MAX_DIR_SIZE = MAX_DIR_SIZE_MB * 1024 * 1024;
const CLEANUP_THRESHOLD_MB = Math.floor(MAX_DIR_SIZE_MB * 0.9); // Start cleanup at 90% of max

/**
 * Calculate total size of directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<number>} - Total size in bytes
 */
async function getDirectorySize(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating directory size:', error);
    return 0;
  }
}

/**
 * Get file stats with last modified time
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} - Array of { filePath, size, mtime }
 */
async function getFilesWithStats(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const filesWithStats = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        filesWithStats.push({
          filePath,
          filename: file,
          size: stats.size,
          mtime: stats.mtime, // Last modified time
        });
      }
    }

    // Sort by oldest first (for cleanup)
    return filesWithStats.sort((a, b) => a.mtime - b.mtime);
  } catch (error) {
    console.error('Error getting files with stats:', error);
    return [];
  }
}

/**
 * Cleanup old logo files to stay under 50MB limit
 * @returns {Promise<Object>} - Cleanup results
 */
async function cleanupLogoFolder() {
  try {
    console.log('🧹 Starting logo folder cleanup...');

    // Get current directory size
    const currentSize = await getDirectorySize(PUBLIC_LOGOS_DIR);
    console.log(`📊 Current folder size: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);

    // If within limit, no cleanup needed
    if (currentSize <= MAX_DIR_SIZE) {
      console.log(`✅ Folder size is within limit (${MAX_DIR_SIZE_MB}MB). No cleanup needed.`);
      return {
        cleaned: false,
        initialSize: currentSize,
        finalSize: currentSize,
        filesRemoved: 0,
      };
    }

    console.log(`⚠️ Folder size (${(currentSize / 1024 / 1024).toFixed(2)}MB) exceeds limit (${MAX_DIR_SIZE_MB}MB). Starting cleanup...`);

    // Get all files sorted by oldest first
    const files = await getFilesWithStats(PUBLIC_LOGOS_DIR);
    
    if (files.length === 0) {
      console.log('ℹ️ No files to clean.');
      return {
        cleaned: false,
        initialSize: currentSize,
        finalSize: currentSize,
        filesRemoved: 0,
      };
    }

    // Calculate target size (aim for 80% of max to have buffer)
    const TARGET_SIZE = Math.floor(MAX_DIR_SIZE * 0.8); // 80% of max size
    let currentTotal = currentSize;
    let filesRemoved = 0;

    // Remove oldest files until we're under target
    for (const file of files) {
      if (currentTotal <= TARGET_SIZE) {
        break;
      }

      try {
        await fs.unlink(file.filePath);
        currentTotal -= file.size;
        filesRemoved++;
        console.log(`🗑️ Removed: ${file.filename} (${(file.size / 1024).toFixed(2)}KB)`);
      } catch (error) {
        console.error(`❌ Error removing file ${file.filename}:`, error.message);
      }
    }

    const finalSize = currentTotal;
    console.log(`✅ Cleanup complete! Removed ${filesRemoved} files.`);
    console.log(`📊 Final folder size: ${(finalSize / 1024 / 1024).toFixed(2)}MB`);

    return {
      cleaned: true,
      initialSize: currentSize,
      finalSize,
      filesRemoved,
    };

  } catch (error) {
    console.error('❌ Error during logo cleanup:', error);
    throw error;
  }
}

/**
 * Check if logo exists in public folder
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} - True if logo exists
 */
async function logoExists(teamId) {
  try {
    console.log('🔍 Checking logo existence...');
    
    // List files and check if any starts with teamId
    const files = await fs.readdir(PUBLIC_LOGOS_DIR);
    const logoFile = files.find(file => file.startsWith(`${teamId}.`));
    
    if (logoFile) {
      console.log(`✅ Logo exists: ${logoFile}`);
      return true;
    }
    
    console.log(`❌ Logo not found for team ${teamId}`);
    return false;
  } catch (error) {
    console.log('❌ Error checking logo existence:', error);
    return false;
  }
}

/**
 * Run cleanup if needed and check logo availability
 * This can be called on auction login to ensure disk space is available
 * @param {string} teamId - Team ID to check logo for
 * @returns {Promise<boolean>} - True if logo exists or cleanup was run
 */
async function ensureLogoAndCleanup(teamId) {
  try {
    console.log('🧹 Ensuring logo and cleanup...');
    // First, check current folder size
    const currentSize = await getDirectorySize(PUBLIC_LOGOS_DIR);
    const currentSizeMB = currentSize / 1024 / 1024;
    console.log(`📊 Current folder size: ${(currentSizeMB).toFixed(2)}MB`);
    // If over 90% of max size, run cleanup early to avoid issues
    if (currentSizeMB > CLEANUP_THRESHOLD_MB) {
      console.log(`⚠️ Approaching ${MAX_DIR_SIZE_MB}MB limit (${currentSizeMB.toFixed(2)}MB). Running cleanup...`);
      await cleanupLogoFolder();
    }

    // Check if requested team logo exists
    return await logoExists(teamId);
  } catch (error) {
    console.error('Error in ensureLogoAndCleanup:', error);
    return false;
  }
}

module.exports = {
  cleanupLogoFolder,
  logoExists,
  ensureLogoAndCleanup,
  getDirectorySize,
};

