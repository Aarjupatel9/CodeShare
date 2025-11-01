import apiClient from './apiClient';

/**
 * File API Service
 * Handles all file-related API calls (files are independent from documents)
 */

class FileApi {
  /**
   * Get all files for current user
   */
  async getFiles() {
    try {
      const response = await apiClient.get('/api/v1/files');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file (independent from documents)
   */
  async uploadFile(formData) {
    try {
      const fileSize = formData.get('fileSize');
      
      const response = await apiClient.uploadFile(
        '/api/v1/files',
        formData,
        {
          headers: {
            filesize: fileSize,
          },
        }
      );
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download file
   */
  async downloadFile(fileId) {
    try {
      // Use fetch directly for blob downloads
      await apiClient.init();
      const baseURL = apiClient.baseURL;
      const url = `${baseURL}/api/v1/files/${fileId}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Create a blob URL and trigger download
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId) {
    try {
      const response = await apiClient.delete(`/api/v1/files/${fileId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.message) {
      return error.message;
    }
    return error.toString();
  }
}

const fileApi = new FileApi();
export default fileApi;

