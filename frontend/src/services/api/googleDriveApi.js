import apiClient from './apiClient';

/**
 * Google Drive OAuth API Service
 * Handles Google Drive connection and status
 */

class GoogleDriveApi {
  /**
   * Get Google Drive OAuth authorization URL
   */
  async getAuthUrl() {
    try {
      const response = await apiClient.get('/api/v1/auth/google-drive/authorize');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Google Drive connection status
   */
  async getConnectionStatus() {
    try {
      const response = await apiClient.get('/api/v1/auth/google-drive/status');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Disconnect Google Drive
   */
  async disconnect() {
    try {
      const response = await apiClient.delete('/api/v1/auth/google-drive/disconnect');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return error;
    }
    return new Error('Failed to connect to Google Drive');
  }
}

const googleDriveApi = new GoogleDriveApi();
export default googleDriveApi;

