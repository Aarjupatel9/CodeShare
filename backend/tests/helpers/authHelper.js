/**
 * Authentication Helper for Tests
 * Provides utility functions for generating tokens and test users
 */

const { genJWTToken, generateHashPassword } = require('../../services/authService');
const UserModel = require('../../models/userModels');
const AuctionModel = require('../../models/auctionModel');

class AuthHelper {
  /**
   * Create a test user
   */
  async createTestUser(userData = {}) {
    const defaultUser = {
      username: userData.username || `testuser_${Date.now()}`,
      email: userData.email || `test_${Date.now()}@example.com`,
      password: await generateHashPassword(userData.password || 'password123'),
      isVerified: true,
    };

    const user = new UserModel(defaultUser);
    await user.save();
    
    // Return user without hashed password for testing
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    };
  }

  /**
   * Generate JWT token for test user
   */
  generateUserToken(user) {
    const payload = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };
    
    return genJWTToken(payload);
  }

  /**
   * Create authenticated test user with token
   */
  async createAuthenticatedUser(userData = {}) {
    const user = await this.createTestUser(userData);
    const token = this.generateUserToken(user);
    
    return { user, token };
  }

  /**
   * Create test auction
   */
  async createTestAuction(auctionData = {}) {
    const defaultAuction = {
      name: auctionData.name || `Test Auction ${Date.now()}`,
      organizer: auctionData.organizer || 'test_organizer',
      password: auctionData.password || 'test123',
      budgetPerTeam: auctionData.budgetPerTeam || 100000000,
      maxTeamMember: auctionData.maxTeamMember || 15,
      minTeamMember: auctionData.minTeamMember || 11,
    };

    const auction = new AuctionModel(defaultAuction);
    await auction.save();
    
    return auction;
  }

  /**
   * Generate auction token
   */
  generateAuctionToken(auction) {
    const payload = {
      _id: auction._id,
      organizer: auction.organizer,
    };
    
    return genJWTToken(payload);
  }

  /**
   * Create authenticated auction with token
   */
  async createAuthenticatedAuction(auctionData = {}) {
    const auction = await this.createTestAuction(auctionData);
    const token = this.generateAuctionToken(auction);
    
    return { auction, token };
  }

  /**
   * Parse cookies from response
   */
  parseCookies(response) {
    const cookies = {};
    const setCookieHeader = response.headers['set-cookie'];
    
    if (setCookieHeader) {
      setCookieHeader.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        cookies[name.trim()] = value;
      });
    }
    
    return cookies;
  }

  /**
   * Get cookie string for requests
   */
  getCookieString(cookies) {
    return Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
}

module.exports = new AuthHelper();

