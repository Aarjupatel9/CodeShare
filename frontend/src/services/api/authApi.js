import apiClient from './apiClient';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

class AuthApi {
  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/api/v1/auth/login', credentials);
      
      if (response.success && response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/api/v1/auth/register', userData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify user token (check login status)
   */
  async verifyToken() {
    try {
      const currentUser = localStorage.getItem('currentUser');
      
      if (!currentUser) {
        throw { type: 0, message: 'User not found locally' };
      }

      const user = JSON.parse(currentUser);
      const response = await apiClient.post('/api/v1/auth/verify-token', {
        email: user.email,
      });
      
      if (response.success && response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await apiClient.post('/api/v1/auth/logout');
      localStorage.removeItem('currentUser');
      return response;
    } catch (error) {
      localStorage.removeItem('currentUser');
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset link
   */
  async generateResetPasswordLink(email) {
    try {
      // Get frontend URL from window location
      const frontendUrl = window.location.origin;
      
      const response = await apiClient.post('/api/v1/auth/generate-reset-password-link', { 
        email,
        frontendUrl 
      });
      
      // Check if the response indicates an error
      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to send reset link. Please try again.');
      }
      
      return response;
    } catch (error) {
      // Extract error message properly
      const errorMessage = error instanceof Error 
        ? error.message 
        : this.handleError(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate reset token
   */
  async validateResetToken(id, token) {
    try {
      const response = await apiClient.get(`/api/v1/auth/reset-password/${id}/${token}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update password with reset token
   */
  async updatePassword(id, token, password, confirmPassword) {
    try {
      const response = await apiClient.post(`/api/v1/auth/update-password/${id}/${token}`, {
        password,
        confirmPassword,
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
    // If error has a message property (Error object or API response)
    if (error?.message) {
      return error.message;
    }
    // If error is a string, return it
    if (typeof error === 'string') {
      return error;
    }
    // For response objects with message/error fields
    if (error?.response?.message) {
      return error.response.message;
    }
    if (error?.response?.error) {
      return error.response.error;
    }
    // Fallback
    return error?.toString() || 'An unexpected error occurred. Please try again.';
  }
}

const authApi = new AuthApi();
export default authApi;

