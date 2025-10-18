/**
 * Integration Tests for Player Management
 */

const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');
const fixtures = require('../helpers/fixtures');
const AuctionPlayerModel = require('../../models/auctionPlayerModel');

describe('Player Management API (v1)', () => {
  let authenticatedUser, userToken, auction, auctionToken;

  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    
    const auth = await authHelper.createAuthenticatedUser();
    authenticatedUser = auth.user;
    userToken = auth.token;

    const auctionAuth = await authHelper.createAuthenticatedAuction();
    auction = auctionAuth.auction;
    auctionToken = auctionAuth.token;
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/auctions/:auctionId/players', () => {
    it('should create multiple players', async () => {
      const playersData = {
        players: [
          fixtures.getSamplePlayer(auction._id, { playerNumber: 'P001', name: 'Player 1' }),
          fixtures.getSamplePlayer(auction._id, { playerNumber: 'P002', name: 'Player 2' }),
        ],
      };

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/players`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(playersData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);

      // Verify in database
      const players = await AuctionPlayerModel.find({ auction: auction._id });
      expect(players.length).toBe(2);
    });

    it('should reject duplicate player number', async () => {
      const playersData = {
        players: [
          fixtures.getSamplePlayer(auction._id, { playerNumber: 'P001' }),
          fixtures.getSamplePlayer(auction._id, { playerNumber: 'P001' }), // Duplicate
        ],
      };

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/players`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(playersData);

      // Should create first, fail second
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/auctions/:auctionId/players', () => {
    it('should get all players for auction', async () => {
      // Create players
      await AuctionPlayerModel.create([
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P001', name: 'Player 1' }),
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P002', name: 'Player 2' }),
      ]);

      const response = await request(app)
        .get(`/api/v1/auctions/${auction._id}/players`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter players by status', async () => {
      await AuctionPlayerModel.create([
        fixtures.getSamplePlayer(auction._id, { 
          playerNumber: 'P001', 
          auctionStatus: 'sold' 
        }),
        fixtures.getSamplePlayer(auction._id, { 
          playerNumber: 'P002', 
          auctionStatus: 'idle' 
        }),
      ]);

      const response = await request(app)
        .get(`/api/v1/auctions/${auction._id}/players?status=sold`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].auctionStatus).toBe('sold');
    });
  });

  describe('PUT /api/v1/auctions/:auctionId/players', () => {
    it('should update multiple players', async () => {
      const players = await AuctionPlayerModel.create([
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P001' }),
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P002' }),
      ]);

      const updateData = {
        players: [
          { _id: players[0]._id, basePrice: 300000000 },
          { _id: players[1]._id, basePrice: 400000000 },
        ],
      };

      const response = await request(app)
        .put(`/api/v1/auctions/${auction._id}/players`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify updates
      const updated1 = await AuctionPlayerModel.findById(players[0]._id);
      expect(updated1.basePrice).toBe(300000000);
    });
  });

  describe('DELETE /api/v1/auctions/:auctionId/players', () => {
    it('should delete multiple players', async () => {
      const players = await AuctionPlayerModel.create([
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P001' }),
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P002' }),
        fixtures.getSamplePlayer(auction._id, { playerNumber: 'P003' }),
      ]);

      const deleteData = {
        playerIds: [players[0]._id, players[1]._id],
      };

      const response = await request(app)
        .delete(`/api/v1/auctions/${auction._id}/players`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(deleteData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('2 player(s) deleted');

      // Verify only 1 player remains
      const remainingPlayers = await AuctionPlayerModel.find({ auction: auction._id });
      expect(remainingPlayers.length).toBe(1);
      expect(remainingPlayers[0]._id.toString()).toBe(players[2]._id.toString());
    });
  });

  describe('POST /api/v1/auctions/:auctionId/players/import', () => {
    it('should import players from Excel data', async () => {
      const importData = {
        playerData: fixtures.getSamplePlayerImportData(auction._id),
      };

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/players/import`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(importData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.imported).toBeGreaterThan(0);

      // Verify players in database
      const players = await AuctionPlayerModel.find({ auction: auction._id });
      expect(players.length).toBe(2);
    });

    it('should skip duplicate players during import', async () => {
      const importData = {
        playerData: fixtures.getSamplePlayerImportData(auction._id),
      };

      // Import first time
      await request(app)
        .post(`/api/v1/auctions/${auction._id}/players/import`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(importData);

      // Import again (should skip)
      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/players/import`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(importData);

      expect(response.status).toBe(200);
      expect(response.body.data.skipped).toBeInstanceOf(Array);
      expect(response.body.data.skipped.length).toBe(2);
    });
  });
});

