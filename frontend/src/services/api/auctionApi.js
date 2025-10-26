import apiClient from './apiClient';

/**
 * Auction API Service
 * Handles all auction-related API calls
 */

class AuctionApi {
  /**
   * Get all auctions
   * @param {boolean} includeSummary - Include team/player counts
   */
  async getAuctions(includeSummary = false) {
    try {
      const url = includeSummary ? '/api/v1/auctions?include=summary' : '/api/v1/auctions';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get auction statistics
   */
  async getAuctionStats() {
    try {
      const response = await apiClient.get('/api/v1/auctions/stats');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get auction summary with stats
   */
  async getAuctionSummary(auctionId) {
    try {
      const response = await apiClient.get(`/api/v1/auctions/${auctionId}/summary`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent sold players (public)
   */
  async getRecentSoldPlayers(auctionId, limit = 10) {
    try {
      const response = await apiClient.get(`/api/v1/auctions/${auctionId}/recent-sold?limit=${limit}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get auction leaderboard (public)
   */
  async getAuctionLeaderboard(auctionId) {
    try {
      const response = await apiClient.get(`/api/v1/auctions/${auctionId}/leaderboard`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get unified live view data (public)
   * Returns auction info, teams, leaderboard, recent sales, stats, and team-player mapping in one call
   */
  async getLiveViewData(auctionId) {
    try {
      const response = await apiClient.get(`/api/v1/auctions/${auctionId}/live-data`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get viewer analytics for an auction
   * @param {string} auctionId - Auction ID
   * @param {string} timeRange - 'hour', 'day', or 'all' (optional)
   */
  async getViewerAnalytics(auctionId, timeRange = 'all') {
    try {
      const response = await apiClient.get(
        `/api/v1/auctions/${auctionId}/analytics/viewers?timeRange=${timeRange}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get auction details
   */
  async getAuction(auctionId, isPublic = false) {
    try {
      const endpoint = isPublic
        ? `/api/v1/auctions/public/${auctionId}`
        : `/api/v1/auctions/${auctionId}`;
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create auction
   */
  async createAuction(data) {
    try {
      const response = await apiClient.post('/api/v1/auctions', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update auction
   */
  async updateAuction(auctionId, data) {
    try {
      const response = await apiClient.put(`/api/v1/auctions/${auctionId}`, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete auction
   */
  async deleteAuction(auctionId) {
    try {
      const response = await apiClient.delete(`/api/v1/auctions/${auctionId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login to auction
   */
  async loginAuction(auctionId, password) {
    try {
      const response = await apiClient.post(`/api/v1/auctions/${auctionId}/login`, {
        password,
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout from auction
   */
  async logoutAuction(auctionId) {
    try {
      const response = await apiClient.post(`/api/v1/auctions/${auctionId}/logout`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== Team Management =====

  /**
   * Get teams for auction
   * @param {boolean} includeStats - Include player counts and budget stats
   */
  async getTeams(auctionId, includeStats = false) {
    try {
      const url = includeStats 
        ? `/api/v1/auctions/${auctionId}/teams?include=stats` 
        : `/api/v1/auctions/${auctionId}/teams`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create team
   */
  async createTeam(auctionId, data) {
    try {
      const response = await apiClient.post(`/api/v1/auctions/${auctionId}/teams`, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update team
   */
  async updateTeam(auctionId, teamId, data) {
    try {
      const response = await apiClient.put(
        `/api/v1/auctions/${auctionId}/teams/${teamId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete team
   */
  async deleteTeam(auctionId, teamId) {
    try {
      const response = await apiClient.delete(`/api/v1/auctions/${auctionId}/teams/${teamId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload team logo (MongoDB storage with public folder caching)
   */
  async uploadTeamLogo(auctionId, teamId, formData) {
    try {
      const response = await apiClient.uploadFile(
        `/api/v1/auctions/${auctionId}/teams/${teamId}/logo`,
        formData
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== Player Management =====

  /**
   * Get players for auction
   */
  async getPlayers(auctionId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const queryString = queryParams.toString();
      
      const response = await apiClient.get(
        `/api/v1/auctions/${auctionId}/players${queryString ? '?' + queryString : ''}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create players (batch)
   */
  async createPlayers(auctionId, players) {
    try {
      const response = await apiClient.post(`/api/v1/auctions/${auctionId}/players`, {
        players,
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update players (batch)
   */
  async updatePlayers(auctionId, players) {
    try {
      const response = await apiClient.put(`/api/v1/auctions/${auctionId}/players`, {
        players,
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete players (batch)
   */
  async deletePlayers(auctionId, playerIds) {
    try {
      const response = await apiClient.delete(`/api/v1/auctions/${auctionId}/players`, {
        body: JSON.stringify({ playerIds }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Import players from data
   */
  async importPlayers(auctionId, playerData) {
    try {
      const response = await apiClient.post(
        `/api/v1/auctions/${auctionId}/players/import`,
        { playerData }
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download player template Excel file
   */
  async downloadPlayerTemplate(auctionId) {
    try {
      const response = await apiClient.get(
        `/api/v1/auctions/${auctionId}/players/template`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== Set Management =====

  /**
   * Get sets for auction
   * @param {boolean} includeStats - Include player counts and completion stats
   */
  async getSets(auctionId, includeStats = false) {
    try {
      const url = includeStats 
        ? `/api/v1/auctions/${auctionId}/sets?include=stats` 
        : `/api/v1/auctions/${auctionId}/sets`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create set
   */
  async createSet(auctionId, data) {
    try {
      const response = await apiClient.post(`/api/v1/auctions/${auctionId}/sets`, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update set
   */
  async updateSet(auctionId, setId, data) {
    try {
      const response = await apiClient.put(
        `/api/v1/auctions/${auctionId}/sets/${setId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete set
   */
  async deleteSet(auctionId, setId) {
    try {
      const response = await apiClient.delete(`/api/v1/auctions/${auctionId}/sets/${setId}`);
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

const auctionApi = new AuctionApi();
export default auctionApi;

