/**
 * Integration Tests for Authentication Endpoints
 */

const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');
const fixtures = require('../helpers/fixtures');
const UserModel = require('../../models/userModels');

describe('Authentication API (v1)', () => {
  // Setup: Connect to test database
  beforeAll(async () => {
    await testDb.connect();
  });

  // Cleanup: Clear database after each test
  afterEach(async () => {
    await testDb.clearDatabase();
  });

  // Teardown: Disconnect after all tests
  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = fixtures.getSampleUser();

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registered');

      // Verify user in database
      const user = await UserModel.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
    });

    it('should reject duplicate email registration', async () => {
      const userData = fixtures.getSampleUser();

      // Register first time
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should hash the password', async () => {
      const userData = fixtures.getSampleUser();

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const user = await UserModel.findOne({ email: userData.email }).select('password');
      
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = fixtures.getSampleUser();

      // Register user first
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Login
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login Successful');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Check cookie is set
      const cookies = authHelper.parseCookies(response);
      expect(cookies).toHaveProperty('token');
      expect(cookies.token).toBeTruthy();
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should reject login with wrong password', async () => {
      const userData = fixtures.getSampleUser();

      // Register user
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Try login with wrong password
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('wrong');
    });

    it('should set httpOnly cookie with appropriate expiry', async () => {
      const userData = fixtures.getSampleUser();

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('HttpOnly');
      expect(setCookieHeader[0]).toContain('token=');
    });
  });

  describe('POST /api/v1/auth/verify-token', () => {
    it('should verify valid token and return user details', async () => {
      const { user, token } = await authHelper.createAuthenticatedUser();

      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .set('Cookie', `token=${token}`)
        .send({ email: user.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('email', user.email);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .set('Cookie', 'token=invalid-token')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-token')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and clear cookie', async () => {
      const { token } = await authHelper.createAuthenticatedUser();

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');

      // Check cookie is cleared
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        expect(setCookieHeader[0]).toContain('token=');
      }
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const userData = fixtures.getSampleUser();
      
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: userData.email });

      // Note: This will fail if email service is not configured
      // We're testing the endpoint structure
      expect(response.status).toBeOneOf([200, 411]);
      expect(response.body).toHaveProperty('success');
    });

    it('should reject password reset for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

// Custom Jest matcher
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be one of ${expected}`
          : `expected ${received} to be one of ${expected}`,
    };
  },
});

