/**
 * Integration Tests for Auction Endpoints
 */

const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');
const fixtures = require('../helpers/fixtures');
const AuctionModel = require('../../models/auctionModel');

describe('Auction API (v1)', () => {
  let authenticatedUser;
  let userToken;

  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    const auth = await authHelper.createAuthenticatedUser();
    authenticatedUser = auth.user;
    userToken = auth.token;
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/auctions', () => {
    it('should create a new auction', async () => {
      const auctionData = {
        name: 'IPL 2025',
        password: 'ipl2025',
      };

      const response = await request(app)
        .post('/api/v1/auctions')
        .set('Cookie', `token=${userToken}`)
        .send(auctionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(auctionData.name);
      expect(response.body.data).not.toHaveProperty('password'); // Password should be excluded

      // Verify in database
      const auction = await AuctionModel.findOne({ name: auctionData.name });
      expect(auction).not.toBeNull();
      expect(auction.password).not.toBe(auctionData.password); // Should be hashed
    });

    it('should reject duplicate auction name', async () => {
      const auctionData = { name: 'IPL 2025', password: 'test' };

      // Create first auction
      await request(app)
        .post('/api/v1/auctions')
        .set('Cookie', `token=${userToken}`)
        .send(auctionData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/auctions')
        .set('Cookie', `token=${userToken}`)
        .send(auctionData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auctions')
        .send({ name: 'Test', password: 'test' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auctions/:id/login', () => {
    it('should login to auction with valid password', async () => {
      const auctionPassword = 'test123';
      const { auction } = await authHelper.createAuthenticatedAuction({ password: auctionPassword });

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/login`)
        .set('Cookie', `token=${userToken}`)
        .send({ password: auctionPassword });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).not.toHaveProperty('password');

      // Check auction token is set
      const cookies = authHelper.parseCookies(response);
      expect(cookies).toHaveProperty('auction_token');
    });

    it('should reject invalid password', async () => {
      const { auction } = await authHelper.createAuthenticatedAuction({ password: 'correct' });

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/login`)
        .set('Cookie', `token=${userToken}`)
        .send({ password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auctions/:id', () => {
    it('should get auction details with teams, players, sets', async () => {
      const { auction, token: auctionToken } = await authHelper.createAuthenticatedAuction();

      const response = await request(app)
        .get(`/api/v1/auctions/${auction._id}`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('auction');
      expect(response.body.data).toHaveProperty('teams');
      expect(response.body.data).toHaveProperty('players');
      expect(response.body.data).toHaveProperty('sets');
    });

    it('should require auction authentication', async () => {
      const { auction } = await authHelper.createAuthenticatedAuction();

      const response = await request(app)
        .get(`/api/v1/auctions/${auction._id}`)
        .set('Cookie', `token=${userToken}`); // No auction token

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auctions/:id', () => {
    it('should update auction details', async () => {
      const { auction, token: auctionToken } = await authHelper.createAuthenticatedAuction();

      const updateData = {
        budgetPerTeam: 120000000,
        maxTeamMember: 16,
      };

      const response = await request(app)
        .put(`/api/v1/auctions/${auction._id}`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify in database
      const updated = await AuctionModel.findById(auction._id);
      expect(updated.budgetPerTeam).toBe(updateData.budgetPerTeam);
      expect(updated.maxTeamMember).toBe(updateData.maxTeamMember);
    });
  });

  describe('GET /api/v1/auctions/public/:id', () => {
    it('should get public auction details when enabled', async () => {
      const { auction } = await authHelper.createAuthenticatedAuction({
        auctionLiveEnabled: 1,
      });

      const response = await request(app)
        .get(`/api/v1/auctions/public/${auction._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.auction).toHaveProperty('name');
    });

    it('should reject public access when not enabled', async () => {
      const { auction } = await authHelper.createAuthenticatedAuction({
        auctionLiveEnabled: 0,
      });

      const response = await request(app)
        .get(`/api/v1/auctions/public/${auction._id}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});

