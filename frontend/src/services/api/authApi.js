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
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
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

const authApi = new AuthApi();
export default authApi;

