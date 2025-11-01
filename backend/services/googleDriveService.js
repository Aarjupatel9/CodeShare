const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');
const googleDriveOAuth = require('./googleDriveOAuthService');
const UserModel = require('../models/userModels');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.serviceAccountKeyPath = null;
    this.folderId = null;
    this.initialized = false;
    this.useOAuth = true; // Default to OAuth (Service Account failed)
  }

  /**
   * Initialize Google Drive client
   * FREE API - No charges for this or any calls
   * Supports both keyFile (path) and direct credentials (env vars)
   */
  async initialize() {
    if (this.initialized && this.drive) {
      return this.drive;
    }

    // Get configuration from environment variables
    const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const projectId = process.env.GOOGLE_DRIVE_PROJECT_ID;
    const keyPath = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH; // Legacy support
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

    let auth;

    try {
      // Option 1: Use direct credentials from env vars (preferred)
      if (clientEmail && privateKey && projectId) {
        // Clean up private key (remove quotes, handle \n newlines)
        let cleanedKey = privateKey.trim();
        if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
          cleanedKey = cleanedKey.slice(1, -1);
        }
        // Replace \n with actual newlines
        cleanedKey = cleanedKey.replace(/\\n/g, '\n');

        // Authenticate using service account credentials directly (FREE)
        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: clientEmail,
            private_key: cleanedKey,
            project_id: projectId,
          },
          scopes: [
            'https://www.googleapis.com/auth/drive.file', // Read/write files only
          ],
        });
      }
      // Option 2: Fallback to keyFile path (legacy support)
      else if (keyPath) {
        // Resolve absolute path
        this.serviceAccountKeyPath = path.isAbsolute(keyPath)
          ? keyPath
          : path.join(process.cwd(), keyPath);

        // Authenticate using service account key file (FREE)
        auth = new google.auth.GoogleAuth({
          keyFile: this.serviceAccountKeyPath,
          scopes: [
            'https://www.googleapis.com/auth/drive.file', // Read/write files only
          ],
        });
      } else {
        throw new Error(
          'Google Drive credentials not found. ' +
          'Please set either:\n' +
          '  - GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY, GOOGLE_DRIVE_PROJECT_ID (preferred)\n' +
          '  - OR GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH (legacy)'
        );
      }

      // Create Drive client (FREE API)
      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;

      console.log('✅ Google Drive API initialized (FREE)');
      return this.drive;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
      throw error;
    }
  }

  /**
   * Find or create a folder in user's Google Drive
   * @param {Object} drive - Google Drive client
   * @param {string} folderName - Folder name (from user.fileUploadFolder)
   * @returns {Promise<string>} Folder ID
   */
  async findOrCreateFolder(drive, folderName) {
    try {
      // Escape single quotes in folder name for query
      const escapedName = folderName.replace(/'/g, "\\'");
      
      // First, try to find existing folder
      const response = await drive.files.list({
        q: `name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        // Folder exists, return its ID
        console.log(`✅ Found existing folder: ${folderName} (${response.data.files[0].id})`);
        return response.data.files[0].id;
      }

      // Folder doesn't exist, create it
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name',
      });

      console.log(`✅ Created new folder: ${folderName} (${folderResponse.data.id})`);
      return folderResponse.data.id;
    } catch (error) {
      console.error('❌ Error finding/creating folder:', error);
      throw error;
    }
  }

  /**
   * Upload file to Google Drive using OAuth (user's Drive)
   * FREE API call - No charges
   * 
   * @param {Buffer} fileBuffer - File content as buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type (e.g., 'image/png', 'application/pdf')
   * @param {string} userId - User ID for OAuth token
   * @param {string} folderName - Folder name (optional, from user.fileUploadFolder)
   * @returns {Promise<Object>} File metadata with ID and URLs
   */
  async uploadFile(fileBuffer, fileName, mimeType, userId, folderName = null) {
    try {
      if (!userId) {
        throw new Error('User ID is required for OAuth upload');
      }

      // Get user with tokens
      const user = await UserModel.findById(userId)
        .select('googleDriveAccessToken googleDriveRefreshToken googleDriveTokenExpiry googleDriveConnected');

      if (!user || !user.googleDriveConnected) {
        throw new Error('User has not connected Google Drive. Please connect Google Drive first.');
      }

      // Get authenticated OAuth client
      const { client: oauthClient, tokens: newTokens, needsUpdate } = await googleDriveOAuth.getAuthenticatedClient(user);

      // Update user tokens if refreshed
      if (needsUpdate && newTokens) {
        user.googleDriveAccessToken = googleDriveOAuth.encrypt(newTokens.accessToken);
        if (newTokens.refreshToken) {
          user.googleDriveRefreshToken = googleDriveOAuth.encrypt(newTokens.refreshToken);
        }
        user.googleDriveTokenExpiry = newTokens.expiryDate;
        await user.save({ select: false }); // Save without validation
      }

      // Create Drive client with OAuth
      const drive = google.drive({ version: 'v3', auth: oauthClient });

      // Find or create folder if folderName is provided
      let folderId = null;
      if (folderName) {
        folderId = await this.findOrCreateFolder(drive, folderName);
      } else if (this.folderId) {
        // Fallback to env folder ID if no folderName provided
        folderId = this.folderId;
      }

      // File metadata (upload to user's Drive folder or root)
      const fileMetadata = {
        name: `${Date.now()}_${fileName}`, // Add timestamp to avoid conflicts
        parents: folderId ? [folderId] : undefined, // Upload to folder if exists, else root
      };

      // Convert Buffer to Stream (Google Drive API requires a stream)
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null); // Signal end of stream

      // File content (FREE API call)
      const media = {
        mimeType: mimeType,
        body: bufferStream, // Stream (required by Google Drive API)
      };

      console.log(`📤 Uploading to Google Drive (OAuth): ${fileName}`);

      // Upload file to user's Google Drive (uses user's storage quota)
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, mimeType, webViewLink, webContentLink, createdTime',
      });

      const fileData = response.data;

      console.log(`✅ File uploaded (OAuth): ${fileData.id}`);

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
      // Let the original error pass through for better debugging
      throw error;
    }
  }

  /**
   * Download file from Google Drive using OAuth
   * FREE API call - No charges
   * 
   * @param {string} fileId - Google Drive file ID
   * @param {string} userId - User ID for OAuth token
   * @returns {Promise<Stream>} File stream
   */
  async downloadFile(fileId, userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required for OAuth download');
      }

      const user = await UserModel.findById(userId)
        .select('googleDriveAccessToken googleDriveRefreshToken googleDriveTokenExpiry googleDriveConnected');

      if (!user || !user.googleDriveConnected) {
        throw new Error('User has not connected Google Drive');
      }

      const { client: oauthClient, tokens: newTokens, needsUpdate } = await googleDriveOAuth.getAuthenticatedClient(user);

      if (needsUpdate && newTokens) {
        user.googleDriveAccessToken = googleDriveOAuth.encrypt(newTokens.accessToken);
        if (newTokens.refreshToken) {
          user.googleDriveRefreshToken = googleDriveOAuth.encrypt(newTokens.refreshToken);
        }
        user.googleDriveTokenExpiry = newTokens.expiryDate;
        await user.save({ select: false });
      }

      const drive = google.drive({ version: 'v3', auth: oauthClient });

      console.log(`📥 Downloading from Google Drive (OAuth): ${fileId}`);

      // Get file stream from user's Drive
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media', // Download file content
        },
        { responseType: 'stream' }
      );

      console.log(`✅ File stream ready (OAuth)`);
      return response.data;
    } catch (error) {
      console.error('❌ Google Drive download error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Google Drive using OAuth
   * FREE API call - No charges
   * 
   * @param {string} fileId - Google Drive file ID
   * @param {string} userId - User ID for OAuth token
   */
  async deleteFile(fileId, userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required for OAuth delete');
      }

      const user = await UserModel.findById(userId)
        .select('googleDriveAccessToken googleDriveRefreshToken googleDriveTokenExpiry googleDriveConnected');

      if (!user || !user.googleDriveConnected) {
        throw new Error('User has not connected Google Drive');
      }

      const { client: oauthClient } = await googleDriveOAuth.getAuthenticatedClient(user);
      const drive = google.drive({ version: 'v3', auth: oauthClient });

      console.log(`🗑️ Deleting from Google Drive (OAuth): ${fileId}`);

      // Delete file from user's Drive
      await drive.files.delete({
        fileId: fileId,
      });

      console.log(`✅ File deleted (OAuth)`);
    } catch (error) {
      console.error('❌ Google Drive delete error:', error);
      // Handle 404 (file already deleted) - not an error
      if (error.code === 404) {
        console.warn('⚠️ File not found (may already be deleted)');
        return;
      }
      throw error;
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
      throw error;
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

