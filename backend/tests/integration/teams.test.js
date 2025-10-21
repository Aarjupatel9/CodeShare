/**
 * Integration Tests for Team Management
 */

const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');
const fixtures = require('../helpers/fixtures');
const AuctionTeamModel = require('../../models/auctionTeamModel');
const AuctionPlayerModel = require('../../models/auctionPlayerModel');

describe('Team Management API (v1)', () => {
  let authenticatedUser, userToken, auction, auctionToken;

  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    
    const auth = await authHelper.createAuthenticatedUser();
    authenticatedUser = auth.user;
    userToken = auth.token;

    const auctionAuth = await authHelper.createAuthenticatedAuction({
      budgetPerTeam: 100000000,
    });
    auction = auctionAuth.auction;
    auctionToken = auctionAuth.token;
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/auctions/:auctionId/teams', () => {
    it('should create a new team', async () => {
      const teamData = {
        name: 'Mumbai Indians',
        owner: 'Mukesh Ambani',
      };

      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(teamData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(teamData.name);
      expect(response.body.data.budget).toBe(auction.budgetPerTeam);
      expect(response.body.data.remainingBudget).toBe(auction.budgetPerTeam);
    });

    it('should reject duplicate team name in same auction', async () => {
      const teamData = { name: 'Mumbai Indians', owner: 'Owner' };

      // Create first team
      await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(teamData);

      // Try to create duplicate
      const response = await request(app)
        .post(`/api/v1/auctions/${auction._id}/teams`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(teamData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/v1/auctions/:auctionId/teams', () => {
    it('should get all teams for an auction', async () => {
      // Create multiple teams
      await AuctionTeamModel.create([
        fixtures.getSampleTeam(auction._id, { name: 'Team 1' }),
        fixtures.getSampleTeam(auction._id, { name: 'Team 2' }),
        fixtures.getSampleTeam(auction._id, { name: 'Team 3' }),
      ]);

      const response = await request(app)
        .get(`/api/v1/auctions/${auction._id}/teams`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
    });
  });

  describe('PUT /api/v1/auctions/:auctionId/teams/:teamId', () => {
    it('should update team details', async () => {
      const team = await AuctionTeamModel.create(
        fixtures.getSampleTeam(auction._id)
      );

      const updateData = {
        owner: 'New Owner',
        name: 'Updated Team Name',
      };

      const response = await request(app)
        .put(`/api/v1/auctions/${auction._id}/teams/${team._id}`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.owner).toBe(updateData.owner);
    });
  });

  describe('DELETE /api/v1/auctions/:auctionId/teams/:teamId', () => {
    it('should delete team without players', async () => {
      const team = await AuctionTeamModel.create(
        fixtures.getSampleTeam(auction._id)
      );

      const response = await request(app)
        .delete(`/api/v1/auctions/${auction._id}/teams/${team._id}`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deleted
      const deletedTeam = await AuctionTeamModel.findById(team._id);
      expect(deletedTeam).toBeNull();
    });

    it('should reject delete if team has players', async () => {
      const team = await AuctionTeamModel.create(
        fixtures.getSampleTeam(auction._id)
      );

      // Add player to team
      const player = new AuctionPlayerModel(
        fixtures.getSamplePlayer(auction._id, { team: team._id })
      );
      await player.save();

      const response = await request(app)
        .delete(`/api/v1/auctions/${auction._id}/teams/${team._id}`)
        .set('Cookie', `token=${userToken}; auction_token=${auctionToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('players');
    });
  });
});

