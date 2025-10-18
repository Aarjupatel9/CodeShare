/**
 * Integration Tests for Document Endpoints
 */

const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');
const fixtures = require('../helpers/fixtures');
const DataModel = require('../../models/dataModels');

describe('Document API (v1)', () => {
  let authenticatedUser;
  let userToken;

  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    // Create authenticated user for tests
    const auth = await authHelper.createAuthenticatedUser();
    authenticatedUser = auth.user;
    userToken = auth.token;
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/documents', () => {
    it('should create a new document', async () => {
      const docData = {
        slug: 'test-document-create',
        data: '<p>This is a test document</p>',
      };

      const response = await request(app)
        .post('/api/v1/documents')
        .set('Cookie', `token=${userToken}`)
        .send(docData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('created');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.unique_name).toBe(docData.slug);

      // Verify in database
      const doc = await DataModel.findOne({ unique_name: docData.slug });
      expect(doc).not.toBeNull();
    });

    it('should reject duplicate slug', async () => {
      const docData = {
        slug: 'duplicate-doc',
        data: '<p>First document</p>',
      };

      // Create first document
      await request(app)
        .post('/api/v1/documents')
        .set('Cookie', `token=${userToken}`)
        .send(docData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Cookie', `token=${userToken}`)
        .send(docData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should require authentication', async () => {
      const docData = {
        slug: 'test-doc',
        data: '<p>Test</p>',
      };

      const response = await request(app)
        .post('/api/v1/documents')
        .send(docData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/documents/public/:slug', () => {
    it('should retrieve public document by slug', async () => {
      // Create a document
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: null,
        access: 'public',
        dataVersion: [{
          time: new Date(),
          data: docData.data,
        }],
      });
      await doc.save();

      const response = await request(app)
        .get(`/api/v1/documents/public/${docData.unique_name}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unique_name', docData.unique_name);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/v1/documents/public/non-existent-doc');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('should retrieve user document by ID', async () => {
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: authenticatedUser._id,
        access: 'private',
        dataVersion: [{
          time: new Date(),
          data: docData.data,
        }],
      });
      await doc.save();

      const response = await request(app)
        .get(`/api/v1/documents/${doc._id}`)
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.unique_name).toBe(docData.unique_name);
    });
  });

  describe('PUT /api/v1/documents/:id', () => {
    it('should update document and add new version', async () => {
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: authenticatedUser._id,
        access: 'private',
        dataVersion: [{
          time: new Date(),
          data: docData.data,
        }],
      });
      await doc.save();

      const updatedData = '<p>Updated content</p>';

      const response = await request(app)
        .put(`/api/v1/documents/${doc._id}`)
        .set('Cookie', `token=${userToken}`)
        .send({
          slug: doc.unique_name,
          data: updatedData,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify version was added
      const updatedDoc = await DataModel.findById(doc._id);
      expect(updatedDoc.dataVersion.length).toBe(2);
      expect(updatedDoc.dataVersion[1].data).toBe(updatedData);
    });

    it('should not create duplicate version for same content', async () => {
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: authenticatedUser._id,
        access: 'private',
        dataVersion: [{
          time: new Date(),
          data: docData.data,
        }],
      });
      await doc.save();

      const response = await request(app)
        .put(`/api/v1/documents/${doc._id}`)
        .set('Cookie', `token=${userToken}`)
        .send({
          slug: doc.unique_name,
          data: docData.data, // Same data
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('No changes');
    });
  });

  describe('DELETE /api/v1/documents/:id', () => {
    it('should delete user document', async () => {
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: authenticatedUser._id,
        access: 'private',
        dataVersion: [{
          time: new Date(),
          data: docData.data,
        }],
      });
      await doc.save();

      const response = await request(app)
        .delete(`/api/v1/documents/${doc._id}`)
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify soft delete
      const deletedDoc = await DataModel.findById(doc._id);
      expect(deletedDoc.isDeleted).toBe(true);
    });

    it('should not delete document owned by another user', async () => {
      const otherUser = await authHelper.createTestUser();
      
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: otherUser._id,
        access: 'private',
        dataVersion: [{
          time: new Date(),
          data: docData.data,
        }],
      });
      await doc.save();

      const response = await request(app)
        .delete(`/api/v1/documents/${doc._id}`)
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/documents/:id/versions', () => {
    it('should retrieve all document versions', async () => {
      const docData = fixtures.getSampleDocument();
      const doc = new DataModel({
        ...docData,
        owner: authenticatedUser._id,
        access: 'private',
        dataVersion: [
          { time: new Date(Date.now() - 3600000), data: '<p>Version 1</p>' },
          { time: new Date(Date.now() - 1800000), data: '<p>Version 2</p>' },
          { time: new Date(), data: '<p>Version 3</p>' },
        ],
      });
      await doc.save();

      const response = await request(app)
        .get(`/api/v1/documents/${doc._id}/versions`)
        .set('Cookie', `token=${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dataVersion).toBeInstanceOf(Array);
    });
  });
});

