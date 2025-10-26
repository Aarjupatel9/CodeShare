const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const AuctionTeamModel = require("../models/auctionTeamModel");
const FileModel = require("../models/fileModel");


const MAX_LOGO_SIZE = 50 * 1024; // 50KB
const MAX_DIMENSION = 200; // 200x200 pixels max
const PUBLIC_LOGOS_DIR = path.join(__dirname, '../public/uploads/teams');

// Track ongoing sync operations per auction to prevent duplicates
// This MUST be outside the class so it persists across requests
const syncInProgress = new Set();

/**
 * Image Service for Team Logo Processing
 */
class ImageService {

  /**
   * Initialize public folder for team logos
   */
  async init() {
    try {
      await fs.mkdir(PUBLIC_LOGOS_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating team logos directory:', error);
    }
  }

  /**
   * Validate and optimize team logo
   * @param {Buffer} buffer - Image buffer
   * @param {string} originalName - Original filename
   * @returns {Object} - Optimized image data
   */
  async processTeamLogo(buffer, originalName) {
    try {
      // Get image metadata
      const metadata = await sharp(buffer).metadata();

      // Validate image format
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!allowedFormats.includes(metadata.format)) {
        throw new Error('Invalid image format. Allowed: JPEG, PNG, WebP');
      }

      // Optimize and resize image
      let optimized = sharp(buffer)
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Convert to WebP for best compression
      optimized = optimized.webp({ quality: 85 });

      const optimizedBuffer = await optimized.toBuffer();

      // Check if optimized size exceeds limit
      if (optimizedBuffer.length > MAX_LOGO_SIZE) {
        // Try with lower quality
        const furtherOptimized = await sharp(buffer)
          .resize(MAX_DIMENSION, MAX_DIMENSION, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 70 })
          .toBuffer();

        if (furtherOptimized.length > MAX_LOGO_SIZE) {
          throw new Error(`Image too large. Max size is 50KB. Optimized size: ${Math.round(furtherOptimized.length / 1024)}KB`);
        }

        return {
          buffer: furtherOptimized,
          mimeType: 'image/webp',
          size: furtherOptimized.length,
          optimized: true
        };
      }

      return {
        buffer: optimizedBuffer,
        mimeType: 'image/webp',
        size: optimizedBuffer.length,
        optimized: true
      };
    } catch (error) {
      console.error('Error processing team logo:', error);
      throw error;
    }
  }

  /**
   * Save team logo to public folder (cache)
   * @param {string} teamId - Team ID
   * @param {Buffer} buffer - Image buffer
   */
  async saveToPublicFolder(teamId, buffer) {
    try {
      const filename = `${teamId}.webp`;
      const filepath = path.join(PUBLIC_LOGOS_DIR, filename);

      await fs.writeFile(filepath, buffer);

      return {
        publicPath: `/uploads/teams/${filename}`,
        filepath
      };
    } catch (error) {
      console.error('Error saving to public folder:', error);
      throw error;
    }
  }

  /**
   * Sync team logo from MongoDB to public folder (async, non-blocking)
   * @param {string} teamId - Team ID
   * @param {string} auctionId - Auction ID to sync all team logos for
   */
  async syncTeamLogoFromDB(teamId, auctionId = null) {
    try {
      // If auctionId provided, sync all team logos for that auction
      const teamData = await AuctionTeamModel.findById(teamId).select('auction');
      if (!teamData || !teamData.auction) {
        return;
      }
      auctionId = teamData.auction;
      // Convert auctionId to string for consistent comparison
      const auctionIdStr = String(auctionId);

      // Check if sync is already in progress for this auction
      if (!syncInProgress.has(auctionIdStr)) {

        // Mark sync as in progress
        syncInProgress.add(auctionIdStr);

        if (auctionId) {
          const teams = await AuctionTeamModel.find({
            auction: auctionId
          }).select('_id logoUrl');

          const logoToSync = teams.filter(team => team.logoUrl);
          const teamIds = logoToSync.map(team => team._id.toString());

          const files = await FileModel.find({
            entityType: 'team',
            entityId: { $in: teamIds },
            fileType: 'image'
          }).select('data publicPath entityId mimeType');

          for (const file of files) {
            try {
              // Convert base64 data to buffer
              const buffer = this.base64ToBuffer(file.data);

              // Save to public folder as .webp (for consistency)
              await this.saveToPublicFolder(file.entityId.toString(), buffer);
            } catch (err) {
              console.error(`❌ [syncTeamLogoFromDB] Error syncing logo for team ${file.entityId}:`, err.message);
            }
          }
          // Remove sync lock when done
          if (auctionId) {
            const auctionIdStr = String(auctionId);
            syncInProgress.delete(auctionIdStr);
          }
        }
      } 
    } catch (error) {
      console.error('Error syncing team logos from DB:', error);
    }
  }

  /**
   * Get team logo from public folder
   * If not found, triggers async sync from MongoDB without blocking
   * @param {string} teamId - Team ID
   * @param {string} auctionId - Optional auction ID for bulk sync
   * @returns {Object|null} - File data or null
   */
  async getFromPublicFolder(teamId, auctionId = null) {
    try {
      // List files in directory and find one that starts with teamId
      const files = await fs.readdir(PUBLIC_LOGOS_DIR);
      const logoFile = files.find(file => file.startsWith(`${teamId}.`));

      if (!logoFile) {
        // Logo not found in cache - trigger async sync from DB
        // Sync in background (non-blocking) - don't await it
        this.syncTeamLogoFromDB(teamId, auctionId).catch(err => {
          console.error('Background logo sync error:', err);
        });

        return null;
      }

      const filepath = path.join(PUBLIC_LOGOS_DIR, logoFile);
      const buffer = await fs.readFile(filepath);
      const stats = await fs.stat(filepath);

      // Determine MIME type from file extension
      const ext = path.extname(logoFile).toLowerCase();
      let mimeType = 'image/webp';
      if (ext === '.jpeg' || ext === '.jpg') mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';

      return {
        buffer,
        mimeType,
        size: stats.size,
        publicPath: `/uploads/teams/${logoFile}`
      };
    } catch (error) {
      console.error('Error getting from public folder:', error);
      return null;
    }
  }

  /**
   * Delete team logo from public folder
   * @param {string} teamId - Team ID
   */
  async deleteFromPublicFolder(teamId) {
    try {
      // List files and find one that starts with teamId
      const files = await fs.readdir(PUBLIC_LOGOS_DIR);
      const logoFile = files.find(file => file.startsWith(`${teamId}.`));

      if (!logoFile) {
        return;
      }

      const filepath = path.join(PUBLIC_LOGOS_DIR, logoFile);
      await fs.unlink(filepath);
    } catch (error) {
      // File doesn't exist, ignore
      if (error.code !== 'ENOENT') {
        console.error('Error deleting from public folder:', error);
      }
    }
  }

  /**
   * Convert buffer to base64
   * @param {Buffer} buffer - Image buffer
   * @param {string} mimeType - MIME type
   * @returns {string} - Base64 string
   */
  bufferToBase64(buffer, mimeType) {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  /**
   * Convert base64 to buffer
   * @param {string} base64String - Base64 string
   * @returns {Buffer} - Image buffer
   */
  base64ToBuffer(base64String) {
    // Remove data:image/...;base64, prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

}

// Initialize and export singleton
const imageService = new ImageService();
imageService.init();

module.exports = imageService;

