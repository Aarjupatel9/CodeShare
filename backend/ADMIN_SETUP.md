# Admin Panel Setup Guide

## Initial Admin User Setup (Manual Database Edit)

### Step 1: Find Your User ID

1. Connect to your MongoDB database
2. Find your user account:
```javascript
db.userModals.findOne({ email: "your-email@example.com" })
```

3. Note the `_id` field (this is your user ID)

### Step 2: Update User Role to Admin

Run this MongoDB command to set your user as admin:

```javascript
db.userModals.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      role: "admin",
      isActive: true
    } 
  }
)
```

Or update by `_id`:

```javascript
db.userModals.updateOne(
  { _id: ObjectId("your-user-id-here") },
  { 
    $set: { 
      role: "admin",
      isActive: true
    } 
  }
)
```

### Step 3: Verify

Check that the update worked:

```javascript
db.userModals.findOne({ email: "your-email@example.com" })
```

You should see:
- `role: "admin"`
- `isActive: true`

### Step 4: Access Admin Panel

1. Log in to your account (or refresh if already logged in)
2. Navigate to: `http://localhost:3000/admin` (or your domain + `/admin`)
3. You should now see the Admin Dashboard

---

## Admin Roles

- **`admin`**: Full access to all admin features
- **`moderator`**: Limited admin access (future use)
- **`user`**: Regular user (default)

---

## Available Admin Routes

### Frontend Routes:
- `/admin` - Admin Dashboard
- `/admin/users` - User Management

### Backend API Routes (all under `/api/v1/admin/`):
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete/deactivate user
- `POST /users/:id/reset-password` - Reset user password
- `GET /users/:id/activity` - Get user activity
- `GET /activity` - Get activity logs
- `GET /activity/stats` - Get activity statistics
- `GET /statistics/overview` - Get overview statistics
- `GET /documents` - List all documents
- `DELETE /documents/:id` - Delete document
- `GET /settings` - Get system settings
- `PATCH /settings/:key` - Update setting

---

## Features Implemented

✅ User Management
- View all users with pagination
- Search and filter users
- Edit user details (username, email, role, status)
- Delete/deactivate users
- Reset user passwords

✅ Activity Monitoring
- Activity logging middleware
- View activity logs
- Activity statistics

✅ Statistics Dashboard
- Overview statistics (users, documents, files)
- Active user counts
- Recent activity feed

✅ Admin Authentication
- Admin middleware protection
- Role-based access control

---

## Next Steps

The following features are planned but not yet implemented:
- Admin Activity page (full activity logs view)
- Admin Statistics page (detailed analytics)
- Admin Documents page (document management)
- Admin Settings page (system configuration)
- More detailed activity logging integration

---

## Activity Log Retention

Activity logs are automatically cleaned up after a retention period to prevent database growth.

### Configuration

Add to your `.env` file:
```env
# Activity Log Retention (days)
# Default: 90 days
# Logs older than this will be automatically deleted
ACTIVITY_LOG_RETENTION_DAYS=90
```

### Storage Impact

- **Optimized**: Each log entry is ~100-130 bytes (compressed)
- **Auto-cleanup**: Logs older than retention period are automatically deleted
- **Maximum size**: Database size stabilizes after retention period
- **Example**: With 90-day retention, max size is ~90-900 MB (depending on traffic)

For more details, see: `docs/development/ACTIVITY_LOG_OPTIMIZATION.md`

---

## Troubleshooting

### Can't Access Admin Panel
- Check your user role is set to `"admin"` in database
- Make sure you're logged in
- Check browser console for errors

### API Returns 403 Forbidden
- Verify your user has `role: "admin"` in database
- Try logging out and logging back in
- Check that middleware is properly configured

### Activity Logs Not Showing
- Activity logging is integrated but needs to be added to more endpoints
- Check that ActivityLog model is created in database
- Verify activity logger middleware is being used

---

## Notes

- Activity logging middleware is created but not yet integrated into all endpoints
- Future updates will add activity logging to document and file operations
- Admin panel is fully functional for user management
- More admin features coming in future phases

