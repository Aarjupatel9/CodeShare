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
   */
  async getDocuments() {
    try {
      const response = await apiClient.get('/api/v1/documents');
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
   * Get document versions
   */
  async getDocumentVersions(identifier) {
    try {
      const response = await apiClient.get(`/api/v1/documents/${identifier}/versions`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file to document
   */
  async uploadFile(documentId, formData) {
    try {
      const slug = formData.get('slug');
      const fileSize = formData.get('fileSize');
      
      const response = await apiClient.uploadFile(
        `/api/v1/documents/${documentId}/files`,
        formData,
        {
          headers: {
            slug: slug,
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
   * Delete file from document
   */
  async deleteFile(documentId, fileId) {
    try {
      const response = await apiClient.delete(
        `/api/v1/documents/${documentId}/files/${fileId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

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

