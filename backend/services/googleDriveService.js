const { google } = require('googleapis');
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.serviceAccountKeyPath = null;
    this.folderId = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Drive client
   * FREE API - No charges for this or any calls
   */
  async initialize() {
    if (this.initialized && this.drive) {
      return this.drive;
    }

    // Get configuration from environment variables
    const keyPath = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

    if (!keyPath) {
      throw new Error('GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH is not set in environment variables');
    }

    // Resolve absolute path
    this.serviceAccountKeyPath = path.isAbsolute(keyPath)
      ? keyPath
      : path.join(process.cwd(), keyPath);

    try {
      // Authenticate using service account (FREE)
      const auth = new google.auth.GoogleAuth({
        keyFile: this.serviceAccountKeyPath,
        scopes: [
          'https://www.googleapis.com/auth/drive.file', // Read/write files only
        ],
      });

      // Create Drive client (FREE API)
      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;

      console.log('✅ Google Drive API initialized (FREE)');
      return this.drive;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
      throw new Error(`Google Drive initialization failed: ${error.message}`);
    }
  }

  /**
   * Upload file to Google Drive
   * FREE API call - No charges
   * 
   * @param {Buffer} fileBuffer - File content as buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type (e.g., 'image/png', 'application/pdf')
   * @returns {Promise<Object>} File metadata with ID and URLs
   */
  async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      await this.initialize();

      // File metadata (FREE API call)
      const fileMetadata = {
        name: `${Date.now()}_${fileName}`, // Add timestamp to avoid conflicts
        parents: this.folderId ? [this.folderId] : undefined, // Optional: specific folder
      };

      // File content (FREE API call)
      const media = {
        mimeType: mimeType,
        body: fileBuffer, // Buffer stream
      };

      console.log(`📤 Uploading to Google Drive (FREE): ${fileName}`);

      // Upload file (FREE - no charges)
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, mimeType, webViewLink, webContentLink, createdTime',
      });

      const fileData = response.data;

      console.log(`✅ File uploaded (FREE API): ${fileData.id}`);

      return {
        fileId: fileData.id,
        fileName: fileData.name,
        url: fileData.webViewLink, // View in browser
        downloadUrl: fileData.webContentLink, // Direct download
        size: parseInt(fileData.size || '0'),
        mimeType: fileData.mimeType,
        createdTime: fileData.createdTime,
      };
    } catch (error) {
      console.error('❌ Google Drive upload error:', error);
      
      // Handle specific errors
      if (error.code === 401) {
        throw new Error('Google Drive authentication failed. Check service account credentials.');
      } else if (error.code === 403) {
        throw new Error('Google Drive access denied. Check service account permissions.');
      }
      
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from Google Drive
   * FREE API call - No charges
   * 
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<Stream>} File stream
   */
  async downloadFile(fileId) {
    try {
      await this.initialize();

      console.log(`📥 Downloading from Google Drive (FREE): ${fileId}`);

      // Get file stream (FREE - no charges)
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media', // Download file content
        },
        { responseType: 'stream' }
      );

      console.log(`✅ File stream ready (FREE API)`);
      return response.data;
    } catch (error) {
      console.error('❌ Google Drive download error:', error);
      
      // Handle 404 (file not found)
      if (error.code === 404) {
        throw new Error('File not found in Google Drive');
      }
      
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete file from Google Drive
   * FREE API call - No charges
   * 
   * @param {string} fileId - Google Drive file ID
   */
  async deleteFile(fileId) {
    try {
      await this.initialize();

      console.log(`🗑️ Deleting from Google Drive (FREE): ${fileId}`);

      // Delete file (FREE - no charges)
      await this.drive.files.delete({
        fileId: fileId,
      });

      console.log(`✅ File deleted (FREE API)`);
    } catch (error) {
      console.error('❌ Google Drive delete error:', error);
      
      // Handle 404 (file already deleted)
      if (error.code === 404) {
        console.warn('⚠️ File not found (may already be deleted)');
        return; // Not an error if already deleted
      }
      
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   * FREE API call - No charges
   * 
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(fileId) {
    try {
      await this.initialize();

      // Get file info (FREE - no charges)
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, mimeType, createdTime, modifiedTime, webViewLink, webContentLink',
      });

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        size: parseInt(response.data.size || '0'),
        mimeType: response.data.mimeType,
        createdTime: response.data.createdTime,
        modifiedTime: response.data.modifiedTime,
        url: response.data.webViewLink,
        downloadUrl: response.data.webContentLink,
      };
    } catch (error) {
      console.error('❌ Google Drive metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * FREE API call - No charges
   * 
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(fileId) {
    try {
      await this.getFileMetadata(fileId);
      return true;
    } catch (error) {
      if (error.message.includes('not found') || error.code === 404) {
        return false;
      }
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new GoogleDriveService();

