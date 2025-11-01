const UserModel = require("../../models/userModels");
const googleDriveOAuth = require("../../services/googleDriveOAuthService");
const logger = require("../../utils/loggerUtility");

/**
 * Get Google Drive OAuth authorization URL
 * GET /api/v1/auth/google-drive/authorize
 */
exports.getAuthUrl = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const authUrl = googleDriveOAuth.getAuthUrl(user._id.toString());
    
    res.status(200).json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'googleDriveOAuthController',
      function: 'getAuthUrl',
      resourceType: 'user',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Failed to get authorization URL: " + error.message,
    });
  }
};

/**
 * OAuth callback - exchange code for tokens
 * GET /api/v1/auth/google-drive/callback
 */
exports.handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing code or state parameter",
      });
    }

    // Exchange code for tokens
    const { userId, accessToken, refreshToken, expiryDate } = await googleDriveOAuth.getTokensFromCode(code, state);

    // Find user and update tokens
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Encrypt tokens before storing
    user.googleDriveAccessToken = googleDriveOAuth.encrypt(accessToken);
    user.googleDriveRefreshToken = googleDriveOAuth.encrypt(refreshToken);
    user.googleDriveTokenExpiry = expiryDate;
    user.googleDriveConnected = true;
    
    await user.save();

    // Redirect to frontend success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings?google-drive-connected=true`);
  } catch (error) {
    logger.logError(error, req, {
      controller: 'googleDriveOAuthController',
      function: 'handleCallback',
      resourceType: 'user',
      context: { userId: req?.user?._id }
    });
    
    // Redirect to frontend error page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/settings?google-drive-error=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Get Google Drive connection status
 * GET /api/v1/auth/google-drive/status
 */
exports.getConnectionStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user with tokens
    const userWithTokens = await UserModel.findById(user._id)
      .select('googleDriveConnected googleDriveTokenExpiry');

    res.status(200).json({
      success: true,
      data: {
        connected: userWithTokens.googleDriveConnected || false,
        tokenExpiry: userWithTokens.googleDriveTokenExpiry || null,
      },
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'googleDriveOAuthController',
      function: 'getConnectionStatus',
      resourceType: 'user',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Failed to get connection status: " + error.message,
    });
  }
};

/**
 * Disconnect Google Drive
 * DELETE /api/v1/auth/google-drive/disconnect
 */
exports.disconnect = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user with tokens
    const userWithTokens = await UserModel.findById(user._id)
      .select('googleDriveRefreshToken');

    // Revoke token from Google
    if (userWithTokens.googleDriveRefreshToken) {
      await googleDriveOAuth.revokeAccess(userWithTokens.googleDriveRefreshToken);
    }

    // Clear tokens from database
    await UserModel.findByIdAndUpdate(user._id, {
      $unset: {
        googleDriveAccessToken: '',
        googleDriveRefreshToken: '',
        googleDriveTokenExpiry: '',
      },
      $set: {
        googleDriveConnected: false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Google Drive disconnected successfully",
    });
  } catch (error) {
    logger.logError(error, req, {
      controller: 'googleDriveOAuthController',
      function: 'disconnect',
      resourceType: 'user',
      context: { userId: req?.user?._id }
    });
    res.status(500).json({
      success: false,
      message: "Failed to disconnect: " + error.message,
    });
  }
};

