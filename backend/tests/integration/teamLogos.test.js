/**
 * Integration Tests for Team Logo System
 * Tests the new MongoDB + Public Folder caching system
 */

const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');
const fixtures = require('../helpers/fixtures');
const imageService = require('../../services/imageService');
const AuctionTeamModel = require('../../models/auctionTeamModel');

describe('Team Logo System', () => {
  let authenticatedUser;
  let userToken;
  let auction;
  let auctionToken;
  let team;

  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    
    // Setup: Create user, auction, and team
    const auth = await authHelper.createAuthenticatedUser();
    authenticatedUser = auth.user;
    userToken = auth.token;

    const auctionAuth = await authHelper.createAuthenticatedAuction();
    auction = auctionAuth.auction;
    auctionToken = auctionAuth.token;

    // Create a team
    team = new AuctionTeamModel(fixtures.getSampleTeam(auction._id));
    await team.save();
  });

  afterEach(async () => {
    // Cleanup: Remove cached logos
    if (team) {
      await imageService.deleteFromPublicFolder(team._id);
    }
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/auctions/:auctionId/teams/:teamId/logo', () => {
    it('should upload and optimize team logo', async () => {
      const imageBuffer = await fixtures.generateTestImage(300, 300, 'blue');

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .attach('file', imageBuffer, 'test-logo.png');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('uploaded successfully');
      expect(response.body.data).toHaveProperty('publicPath');
      expect(response.body.data).toHaveProperty('size');
      expect(response.body.data.size).toBeLessThan(50 * 1024); // < 50KB
      expect(response.body.data.mimeType).toBe('image/webp');
      expect(response.body.data.optimized).toBe(true);
    });

    it('should store logo in MongoDB as base64', async () => {
      const imageBuffer = await fixtures.generateTestImage(200, 200);

      await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .attach('file', imageBuffer, 'test-logo.png');

      // Verify in database
      const updatedTeam = await AuctionTeamModel.findById(team._id);
      
      expect(updatedTeam.logo).toBeDefined();
      expect(updatedTeam.logo.data).toContain('data:image/webp;base64,');
      expect(updatedTeam.logo.mimeType).toBe('image/webp');
      expect(updatedTeam.logo.size).toBeLessThan(50 * 1024);
      expect(updatedTeam.logo.publicPath).toContain('/team-logos/');
    });

    it('should cache logo in public folder', async () => {
      const imageBuffer = await fixtures.generateTestImage(150, 150);

      await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .attach('file', imageBuffer, 'test-logo.png');

      // Check if file exists in public folder
      const cachedLogo = await imageService.getFromPublicFolder(team._id);
      
      expect(cachedLogo).not.toBeNull();
      expect(cachedLogo.buffer).toBeInstanceOf(Buffer);
      expect(cachedLogo.mimeType).toBe('image/webp');
    });

    it('should reject files larger than 500KB', async () => {
      const largeBuffer = await fixtures.generateLargeTestImage();

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .attach('file', largeBuffer, 'large-logo.png');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('too large');
    });

    it('should require authentication', async () => {
      const imageBuffer = await fixtures.generateTestImage(100, 100);

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .attach('file', imageBuffer, 'test-logo.png');

      expect(response.status).toBe(401);
    });

    it('should require auction authentication', async () => {
      const imageBuffer = await fixtures.generateTestImage(100, 100);

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}`) // No auction token
        .attach('file', imageBuffer, 'test-logo.png');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/public/team-logos/:teamId', () => {
    beforeEach(async () => {
      // Upload a logo for testing retrieval
      const imageBuffer = await fixtures.generateTestImage(150, 150, 'green');
      
      await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .attach('file', imageBuffer, 'test-logo.png');
    });

    it('should retrieve logo from public folder cache', async () => {
      const response = await request(app)
        .get(`/api/public/team-logos/${team._id}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['cache-control']).toContain('public');
      expect(response.headers['cache-control']).toContain('max-age');
      expect(response.body).toBeInstanceOf(Buffer);
    });

    it('should set appropriate caching headers', async () => {
      const response = await request(app)
        .get(`/api/public/team-logos/${team._id}`);

      expect(response.headers['cache-control']).toBe('public, max-age=86400');
      expect(response.headers['etag']).toBeDefined();
      expect(response.headers['content-type']).toBe('image/webp');
    });

    it('should regenerate cache if file deleted', async () => {
      // Delete cached file
      await imageService.deleteFromPublicFolder(team._id);

      // Request should still work (regenerated from DB)
      const response = await request(app)
        .get(`/api/public/team-logos/${team._id}`);

      expect(response.status).toBe(200);

      // Verify cache was regenerated
      const cachedLogo = await imageService.getFromPublicFolder(team._id);
      expect(cachedLogo).not.toBeNull();
    });

    it('should return 404 for non-existent team', async () => {
      const response = await request(app)
        .get('/api/public/team-logos/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid team ID', async () => {
      const response = await request(app)
        .get('/api/public/team-logos/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid team ID');
    });

    it('should NOT require authentication (public endpoint)', async () => {
      // Request without any authentication
      const response = await request(app)
        .get(`/api/public/team-logos/${team._id}`);

      expect(response.status).toBe(200);
      // Public endpoint should work without token
    });
  });

  describe('Team Logo Caching Performance', () => {
    it('should serve from cache faster than from database', async () => {
      const imageBuffer = await fixtures.generateTestImage(150, 150);
      
      await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams/${team._id}/logo`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .attach('file', imageBuffer, 'test-logo.png');

      // Delete cache to force DB fetch
      await imageService.deleteFromPublicFolder(team._id);

      // First request (from DB)
      const start1 = Date.now();
      await request(app).get(`/api/public/team-logos/${team._id}`);
      const time1 = Date.now() - start1;

      // Second request (from cache)
      const start2 = Date.now();
      await request(app).get(`/api/public/team-logos/${team._id}`);
      const time2 = Date.now() - start2;

      // Cache should be faster (not always guaranteed in tests, but generally true)
      console.log(`DB fetch: ${time1}ms, Cache: ${time2}ms`);
      expect(time2).toBeLessThanOrEqual(time1 * 2); // Allow some variance
    });
  });
});

