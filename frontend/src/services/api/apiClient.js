/**
 * Centralized API Client
 * Handles all HTTP requests to the backend
 */

import toast from 'react-hot-toast';

class ApiClient {
  constructor() {
    this.baseURL = null;
    this.socketURL = null;
    this.configLoaded = false;
    this.configPromise = null;
  }

  /**
   * Initialize configuration (loads only once)
   */
  async init() {
    if (this.configLoaded) {
      return;
    }

    // Prevent multiple simultaneous config loads
    if (this.configPromise) {
      await this.configPromise;
      return;
    }

    this.configPromise = fetch('/config.json')
      .then(response => response.json())
      .then(config => {
        this.baseURL = config.backend_url;
        this.socketURL = config.backend_socket_url;
        this.configLoaded = true;
      })
      .catch(error => {
        console.error('Failed to load config:', error);
        // Fallback to default URLs
        this.baseURL = 'http://localhost:8080';
        this.socketURL = 'http://localhost:8081';
        this.configLoaded = true;
      });

    await this.configPromise;
    this.configPromise = null;
  }

  /**
   * Get Socket.IO server URL
   */
  async getSocketURL() {
    await this.init();
    return this.socketURL;
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint (e.g., '/api/v1/auth/login')
   * @param {object} options - Fetch options
   * @returns {Promise<object>} - Response data
   */
  async request(endpoint, options = {}) {
    await this.init();

    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      credentials: 'include', // Always include cookies
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...options.headers,
      },
    };

    // Merge options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      // Handle token expiration globally
      if (data.message === 'TokenExpiredError' || data.message === 'jwt expired') {
        this.handleTokenExpiration();
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async uploadFile(endpoint, formData, options = {}) {
    await this.init();

    const url = `${this.baseURL}${endpoint}`;
    
    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      body: formData,
      ...options,
    };

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (options.headers) {
      fetchOptions.headers = options.headers;
    }

    try {
      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      if (data.message === 'TokenExpiredError' || data.message === 'jwt expired') {
        this.handleTokenExpiration();
      }

      return data;
    } catch (error) {
      console.error(`Upload Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Handle token expiration
   */
  handleTokenExpiration() {
    localStorage.removeItem('currentUser');
    toast.error("Your session has expired. Please login again to continue.", { duration: 4000 });
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 1000);
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;

