import apiClient from './apiClient';

/**
 * Admin API Service
 * Handles all admin-related API calls
 */

class AdminApi {
  /**
   * Get all users
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin/users${queryString ? '?' + queryString : ''}`;

      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(userId) {
    try {
      const response = await apiClient.get(`/api/v1/admin/users/${userId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, data) {
    try {
      const response = await apiClient.patch(`/api/v1/admin/users/${userId}`, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete/deactivate user
   */
  async deleteUser(userId, permanent = false) {
    try {
      const queryParam = permanent ? '?permanent=true' : '';
      const response = await apiClient.delete(`/api/v1/admin/users/${userId}${queryParam}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId, newPassword) {
    try {
      const response = await apiClient.post(`/api/v1/admin/users/${userId}/reset-password`, {
        newPassword
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin/users/${userId}/activity${queryString ? '?' + queryString : ''}`;

      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get filter options for activity logs (public, cached)
   */
  async getActivityFilterOptions() {
    try {
      const response = await apiClient.get('/api/v1/admin/activity/filters');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.email) queryParams.append('email', params.email);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.action) queryParams.append('action', params.action);
      if (params.resourceType) queryParams.append('resourceType', params.resourceType);
      if (params.errorLevel) queryParams.append('errorLevel', params.errorLevel);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin/activity${queryString ? '?' + queryString : ''}`;

      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days = 30) {
    try {
      const response = await apiClient.get(`/api/v1/admin/activity/stats?days=${days}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get overview statistics
   */
  async getOverviewStats() {
    try {
      const response = await apiClient.get('/api/v1/admin/statistics/overview');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all documents
   */
  async getAllDocuments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.email) queryParams.append('email', params.email);
      if (params.ownerId) queryParams.append('ownerId', params.ownerId);

      const queryString = queryParams.toString();
      const endpoint = `/api/v1/admin/documents${queryString ? '?' + queryString : ''}`;

      const response = await apiClient.get(endpoint);
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
      const response = await apiClient.delete(`/api/v1/admin/documents/${documentId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/api/v1/admin/settings');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update setting
   */
  async updateSetting(key, value, description = null) {
    try {
      const response = await apiClient.patch(`/api/v1/admin/settings/${key}`, {
        value,
        description
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server',
        status: 0
      };
    } else {
      // Error setting up request
      return {
        message: error.message || 'An error occurred',
        status: 0
      };
    }
  }
}

export default new AdminApi();

