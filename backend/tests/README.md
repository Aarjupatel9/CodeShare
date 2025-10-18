# Backend API Test Suite

## Overview

Comprehensive test suite for the CodeShare backend API using **Jest + Supertest**.

---

## Test Structure

```
tests/
├── setup.js                          # Global test configuration
├── helpers/
│   ├── testDb.js                    # Test database management
│   ├── authHelper.js                # Authentication utilities
│   └── fixtures.js                  # Test data generators
├── unit/
│   └── services/
│       └── imageService.test.js     # Image processing tests
└── integration/
    ├── auth.test.js                 # Authentication endpoints
    ├── documents.test.js            # Document CRUD operations
    ├── auctions.test.js             # Auction management
    ├── teams.test.js                # Team management
    ├── teamLogos.test.js            # Team logo system
    └── players.test.js              # Player management
```

---

## Running Tests

### **All Tests**
```bash
npm test
```

### **Watch Mode** (Re-run on file changes)
```bash
npm run test:watch
```

### **With Coverage Report**
```bash
npm run test:coverage
```

### **Unit Tests Only**
```bash
npm run test:unit
```

### **Integration Tests Only**
```bash
npm run test:integration
```

### **Verbose Output**
```bash
npm run test:verbose
```

---

## Test Categories

### **Unit Tests**
- ✅ Image Service (optimization, caching, base64 conversion)
- Tests individual functions in isolation
- Fast execution (~1-2 seconds)

### **Integration Tests**
- ✅ Auth API (register, login, logout, token verification)
- ✅ Document API (CRUD, versioning, file management)
- ✅ Auction API (create, update, login, public access)
- ✅ Team API (create, update, delete, logo upload)
- ✅ Team Logo System (upload, caching, retrieval)
- ✅ Player API (create, update, delete, import)
- Tests complete API workflows
- Execution time: ~10-30 seconds

---

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Overall | 80% | TBD |
| Controllers | 85% | TBD |
| Services | 80% | TBD |
| Routes | 90% | TBD |
| Middleware | 85% | TBD |

---

## Test Database

### **Strategy**
- Uses the same MongoDB instance as development
- Separate database: `code_share_test`
- Automatically cleared between tests
- No impact on production/development data

### **Configuration**
Tests use environment variable `MONGODB_URI` from your `.env` file but with a different database name.

---

## Writing New Tests

### **Example Test File**

```javascript
const request = require('supertest');
const app = require('../../src/app');
const testDb = require('../helpers/testDb');
const authHelper = require('../helpers/authHelper');

describe('Your Feature', () => {
  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  describe('POST /api/v1/your-endpoint', () => {
    it('should do something', async () => {
      const { user, token } = await authHelper.createAuthenticatedUser();

      const response = await request(app)
        .post('/api/v1/your-endpoint')
        .set('Cookie', [`token=${token}`])
        .send({ data: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

---

## Test Helpers

### **testDb.js**
- `connect()` - Connect to test database
- `clearDatabase()` - Clear all collections
- `disconnect()` - Close connection
- `dropDatabase()` - Drop entire database

### **authHelper.js**
- `createTestUser()` - Create user in DB
- `generateUserToken()` - Generate JWT for user
- `createAuthenticatedUser()` - Create user + token
- `createTestAuction()` - Create auction in DB
- `createAuthenticatedAuction()` - Create auction + token
- `parseCookies()` - Extract cookies from response

### **fixtures.js**
- `getSampleUser()` - Sample user data
- `getSampleAuction()` - Sample auction data
- `getSampleTeam()` - Sample team data
- `getSamplePlayer()` - Sample player data
- `generateTestImage()` - Generate test image buffer
- `getSamplePlayerImportData()` - Excel import data

---

## Best Practices

### **1. Test Isolation**
- Each test should be independent
- Clear database between tests
- Don't rely on test execution order

### **2. Descriptive Names**
```javascript
// Good
it('should reject login with invalid credentials')

// Bad
it('test login')
```

### **3. AAA Pattern**
```javascript
it('should do something', async () => {
  // Arrange
  const user = await createTestUser();
  
  // Act
  const response = await request(app).get('/api/endpoint');
  
  // Assert
  expect(response.status).toBe(200);
});
```

### **4. Test Both Success and Failure Cases**
```javascript
it('should succeed with valid data')
it('should fail with invalid data')
it('should handle edge cases')
```

---

## Continuous Integration

### **GitHub Actions Example**

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: cd backend && npm install
      - run: cd backend && npm test
      - run: cd backend && npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Troubleshooting

### **Tests Failing?**

1. **Check MongoDB connection**
   ```bash
   echo $MONGODB_URI
   ```

2. **Clear test database manually**
   ```javascript
   use code_share_test
   db.dropDatabase()
   ```

3. **Check environment variables**
   - Tests use `.env` file
   - Make sure all required vars are set

### **Slow Tests?**

1. **Run specific test file**
   ```bash
   npm test -- auth.test.js
   ```

2. **Skip slow tests**
   ```javascript
   it.skip('slow test', async () => {
     // ...
   });
   ```

---

## Metrics

### **Test Count**
- Unit Tests: ~15 test cases
- Integration Tests: ~50+ test cases
- Total: 65+ test cases

### **Execution Time**
- Unit Tests: ~2-5 seconds
- Integration Tests: ~15-30 seconds
- Total: ~20-35 seconds

---

## Next Steps

- [ ] Add E2E workflow tests
- [ ] Add performance benchmarks
- [ ] Integrate with CI/CD
- [ ] Add test coverage badges
- [ ] Mock external services (email, S3)

---

**Status:** ✅ Test suite ready for execution

Run `npm test` to verify all tests pass!

