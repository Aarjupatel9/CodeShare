# API Reference

Complete API documentation for CodeShare.

---

## 🔌 API Versions

### V1 API (Current - Production)
**Base URL**: `/api/v1`

**Status**: ✅ Active, recommended  
**Documentation**: [API Implementation Summary](./API_IMPLEMENTATION_SUMMARY.md)

### Legacy API (Deprecated)
**Base URLs**: `/api/auction`, `/api/auth`, `/api/data`

**Status**: ⚠️ Deprecated, will be removed  
**Migration Guide**: [V1 Migration](../06-migration/V1_API_MIGRATION.md)

---

## 📚 API Documentation

### [API Implementation Summary](./API_IMPLEMENTATION_SUMMARY.md)
Complete REST API reference:
- API structure overview
- Endpoint organization
- Response formats

### [Team Logo System](./TEAM_LOGO_SYSTEM.md)
Image upload and storage:
- Upload flow
- Storage (MongoDB + public folder)
- URL generation
- Caching strategy

### [Auction API Requirements](./AUCTION_API_REQUIREMENTS.md)
Auction-specific endpoints:
- Auction management
- Teams and players
- Bidding system
- Live view data

---

## 🔐 Authentication

All protected endpoints require:
```
Cookie: token=<jwt-token>
```

Auction-specific endpoints also require:
```
Cookie: auction_token=<auction-jwt>
```

---

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🚀 Quick Examples

### Get Live View Data:
```bash
curl http://localhost:8080/api/v1/auctions/{auctionId}/live-data
```

### Get Viewer Analytics:
```bash
curl -H "Cookie: token=..." \
  http://localhost:8080/api/v1/auctions/{id}/analytics/viewers
```

### Update Auction:
```bash
curl -X PUT \
  -H "Cookie: token=...; auction_token=..." \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name"}' \
  http://localhost:8080/api/v1/auctions/{id}
```

---

## 📚 Related Documentation

- [Getting Started](../01-getting-started/)
- [Architecture](../02-architecture/)
- [Migration Guide](../06-migration/)

---

**API Reference Ready!** 🔌

