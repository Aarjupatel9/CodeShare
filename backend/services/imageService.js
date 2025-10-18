const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const MAX_LOGO_SIZE = 50 * 1024; // 50KB
const MAX_DIMENSION = 200; // 200x200 pixels max
const PUBLIC_LOGOS_DIR = path.join(__dirname, '../public/team-logos');

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
      console.log('✅ Team logos directory initialized');
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
        publicPath: `/team-logos/${filename}`,
        filepath
      };
    } catch (error) {
      console.error('Error saving to public folder:', error);
      throw error;
    }
  }

  /**
   * Get team logo from public folder
   * @param {string} teamId - Team ID
   * @returns {Object|null} - File data or null
   */
  async getFromPublicFolder(teamId) {
    try {
      const filename = `${teamId}.webp`;
      const filepath = path.join(PUBLIC_LOGOS_DIR, filename);
      
      // Check if file exists
      await fs.access(filepath);
      
      const buffer = await fs.readFile(filepath);
      const stats = await fs.stat(filepath);
      
      return {
        buffer,
        mimeType: 'image/webp',
        size: stats.size,
        publicPath: `/team-logos/${filename}`
      };
    } catch (error) {
      // File doesn't exist
      return null;
    }
  }

  /**
   * Delete team logo from public folder
   * @param {string} teamId - Team ID
   */
  async deleteFromPublicFolder(teamId) {
    try {
      const filename = `${teamId}.webp`;
      const filepath = path.join(PUBLIC_LOGOS_DIR, filename);
      
      await fs.unlink(filepath);
      console.log(`✅ Deleted cached logo for team ${teamId}`);
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

  /**
   * Cleanup old cached logos (older than 30 days)
   */
  async cleanupOldCache() {
    try {
      const files = await fs.readdir(PUBLIC_LOGOS_DIR);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      let cleaned = 0;
      for (const file of files) {
        const filepath = path.join(PUBLIC_LOGOS_DIR, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtimeMs < thirtyDaysAgo) {
          await fs.unlink(filepath);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} old cached logos`);
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }
}

// Initialize and export singleton
const imageService = new ImageService();
imageService.init();

// Cleanup old cache every 24 hours
setInterval(() => {
  imageService.cleanupOldCache();
}, 24 * 60 * 60 * 1000);

module.exports = imageService;

