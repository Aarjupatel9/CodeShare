const { google } = require('googleapis');
const crypto = require('crypto');

/**
 * Google Drive OAuth 2.0 Service
 * Handles OAuth flow and token management
 */

class GoogleDriveOAuthService {
  constructor() {
    this.clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_DRIVE_OAUTH_REDIRECT_URI || 'http://localhost:8080/api/v1/auth/google-drive/callback';
    
    // Encryption key for storing tokens (use environment variable in production)
    this.encryptionKey = process.env.GOOGLE_DRIVE_ENCRYPTION_KEY || 'your-32-char-encryption-key-here-change-in-prod';
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Get OAuth2 client
   */
  getOAuth2Client() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Get authorization URL
   * @param {string} userId - User ID for state parameter (security)
   * @returns {string} Authorization URL
   */
  getAuthUrl(userId) {
    const oauth2Client = this.getOAuth2Client();
    
    const scopes = [
      'https://www.googleapis.com/auth/drive.file', // Read/write files only
    ];

    const state = this.encryptState(userId);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: scopes,
      state: state, // Pass user ID securely
      prompt: 'consent', // Force consent screen to get refresh token
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code from callback
   * @param {string} state - State parameter (encrypted user ID)
   * @returns {Object} Tokens and user ID
   */
  async getTokensFromCode(code, state) {
    try {
      const userId = this.decryptState(state);
      if (!userId) {
        throw new Error('Invalid state parameter');
      }

      const oauth2Client = this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      return {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Encrypted refresh token
   * @returns {Object} New tokens
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decryptedRefreshToken = this.decrypt(refreshToken);
      const oauth2Client = this.getOAuth2Client();
      oauth2Client.setCredentials({
        refresh_token: decryptedRefreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      return {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || decryptedRefreshToken, // Keep existing if not provided
        expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Get authenticated OAuth2 client for a user
   * @param {Object} user - User object with encrypted tokens
   * @returns {Object} OAuth2 client
   */
  async getAuthenticatedClient(user) {
    const oauth2Client = this.getOAuth2Client();
    
    if (!user.googleDriveAccessToken) {
      throw new Error('User has not connected Google Drive');
    }

    let accessToken = this.decrypt(user.googleDriveAccessToken);
    let tokenExpiry = user.googleDriveTokenExpiry;

    // Check if token is expired
    if (tokenExpiry && new Date() >= tokenExpiry) {
      // Refresh token
      if (!user.googleDriveRefreshToken) {
        throw new Error('Refresh token not available. User needs to reconnect.');
      }

      const newTokens = await this.refreshAccessToken(user.googleDriveRefreshToken);
      accessToken = newTokens.accessToken;
      tokenExpiry = newTokens.expiryDate;
      
      // Update user tokens (caller should save to DB)
      return {
        client: oauth2Client,
        tokens: newTokens,
        needsUpdate: true,
      };
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    return {
      client: oauth2Client,
      tokens: null,
      needsUpdate: false,
    };
  }

  /**
   * Encrypt sensitive data (tokens, state)
   */
  encrypt(text) {
    if (!text) return null;
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey.substring(0, 32), 'utf8'),
        iv
      );
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedText) {
    if (!encryptedText) return null;
    try {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey.substring(0, 32), 'utf8'),
        iv
      );
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt state (user ID) for OAuth flow
   */
  encryptState(userId) {
    return this.encrypt(userId);
  }

  /**
   * Decrypt state to get user ID
   */
  decryptState(state) {
    return this.decrypt(state);
  }

  /**
   * Revoke access (disconnect Google Drive)
   */
  async revokeAccess(refreshToken) {
    try {
      const decryptedToken = this.decrypt(refreshToken);
      const oauth2Client = this.getOAuth2Client();
      await oauth2Client.revokeToken(decryptedToken);
    } catch (error) {
      console.error('Error revoking token:', error);
      // Don't throw - user might have already revoked from Google
    }
  }
}

module.exports = new GoogleDriveOAuthService();

