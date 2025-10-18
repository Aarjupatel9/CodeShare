/**
 * Jest Setup File
 * Runs before each test suite
 */

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '8080';
process.env.ALLOWED_ORIGIN = 'http://localhost:3000';
process.env.HOST_ORIGIN_IP = '127.0.0.1';
process.env.TOKEN_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_SEC = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXP = '7d';
process.env.MAX_FILE_SIZE = '9999999';
process.env.ALLOW_FILE_LIMIT = 'test';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
//   warn: jest.fn(),
// };

// Global test utilities
global.testUtils = {
  generateRandomEmail: () => `test-${Date.now()}@example.com`,
  generateRandomString: (length = 8) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

console.log('🧪 Jest test environment initialized');

