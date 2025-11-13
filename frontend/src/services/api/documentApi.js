import apiClient from './apiClient';

/**
 * Document API Service
 * Handles all document/data-related API calls
 */

class DocumentApi {
  /**
   * Get document by slug or ID
   */
  async getDocument(identifier, options = {}) {
    try {
      const { version, flag, isPrivate = false } = options;
      
      const queryParams = new URLSearchParams();
      if (version) queryParams.append('version', version);
      if (flag) queryParams.append('flag', flag);
      
      const queryString = queryParams.toString();
      const endpoint = isPrivate
        ? `/api/v1/documents/${identifier}${queryString ? '?' + queryString : ''}`
        : `/api/v1/documents/public/${identifier}${queryString ? '?' + queryString : ''}`;
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all documents for current user
   * @param {Object} options - Optional parameters
   * @param {string|string[]} options.fields - Comma-separated field names or array of fields to fetch
   *                                          Use '*' for all fields, or omit for default minimal fields
   *                                          Example: 'unique_name,createdAt' or ['unique_name', 'createdAt']
   * @returns {Promise} API response with documents
   */
  async getDocuments(options = {}) {
    try {
      const { fields } = options;
      
      const queryParams = new URLSearchParams();
      if (fields) {
        // Support both string and array formats
        const fieldsString = Array.isArray(fields) ? fields.join(',') : fields;
        queryParams.append('fields', fieldsString);
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/v1/documents${queryString ? '?' + queryString : ''}`;
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new document
   */
  async createDocument(data) {
    try {
      const response = await apiClient.post('/api/v1/documents', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update document (add new version)
   */
  async updateDocument(identifier, data) {
    try {
      const response = await apiClient.put(`/api/v1/documents/${identifier}`, data);
      
      if (response.success && response.data) {
        return {
          success: true,
          message: response.message,
          newData: response.data,
        };
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId) {
    try {
      const response = await apiClient.delete(`/api/v1/documents/${documentId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get document versions with pagination
   * @param {string} identifier - Document ID or slug
   * @param {Object} options - Optional parameters
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @returns {Promise} API response with versions and pagination info
   */
  async getDocumentVersions(identifier, options = {}) {
    try {
      const { page, limit } = options;
      
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const endpoint = `/api/v1/documents/${identifier}/versions${queryString ? '?' + queryString : ''}`;
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // NOTE: File upload/delete methods have been moved to fileApi.js
  // Files are now independent from documents - use fileApi.uploadFile() and fileApi.deleteFile()

  /**
   * Rename document
   */
  async renameDocument(documentId, newName) {
    try {
      const response = await apiClient.patch(`/api/v1/documents/${documentId}/rename`, { newName });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reorder documents
   */
  async reorderDocuments(newOrder) {
    try {
      const response = await apiClient.patch('/api/v1/documents/reorder', { newOrder });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle pin status of document
   */
  async togglePinDocument(documentId, isPinned) {
    try {
      const response = await apiClient.patch(`/api/v1/documents/${documentId}/pin`, { isPinned });
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

const documentApi = new DocumentApi();
export default documentApi;

