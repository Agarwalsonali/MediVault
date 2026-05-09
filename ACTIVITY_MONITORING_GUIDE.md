# Activity Monitoring System - Implementation Guide

## Overview

Complete real-time activity monitoring system for the Admin Dashboard with:

- Detailed activity logging with timestamps
- Search filters (user name, action, role, status)
- Activity statistics and failed login tracking
- CSV export functionality
- Real-time monitoring with 30-second auto-refresh
- Failed login detection and account locking

## What Was Implemented

### Backend Components

#### 1. ActivityLog Model (`backend/models/activityLog.js`)

```javascript
Fields:
- userId, userName, userRole - User information
- action - LOGIN, LOGOUT, LOGIN_FAILED, ACCOUNT_LOCKED, UPLOAD_FILE, DELETE_FILE, etc.
- resourceType - USER, REPORT, PATIENT, STAFF, CONTACT, SYSTEM
- resourceId, resourceName - Resource details
- details - Mixed object for additional information
- ipAddress, userAgent - Request metadata
- status - SUCCESS, FAILED, PENDING
- errorMessage - Error description if failed
- timestamp - Activity timestamp (indexed for fast queries)
- duration - Operation duration in milliseconds
```

#### 2. Activity Logger Utility (`backend/utils/activityLogger.js`)

```javascript
Functions:
- logActivity(activityData) - Log activity to database
- logActivityWithRequest(req, activityData) - Log with request context
```

#### 3. Activity Controller (`backend/controllers/activityController.js`)

```javascript
Endpoints:
- getActivityLogs() - Fetch logs with filters and pagination
- getUserActivityLogs() - Get logs for specific user
- getFailedLogins() - Get failed login attempts with grouping
- getActivityStats() - Get activity statistics by action/role/status
- exportActivityLogs() - Export logs as CSV
- deleteOldActivityLogs() - Cleanup old logs (admin task)

Features:
- Advanced filtering (action, userRole, resourceType, status)
- Text search on userName
- Date range filtering
- Sorting by multiple fields
- Pagination
- CSV conversion
```

#### 4. Activity Routes (`backend/routes/activityRoutes.js`)

```
GET  /api/activity/               - Get all logs with filters
GET  /api/activity/stats          - Get statistics
GET  /api/activity/failed-logins  - Get failed login attempts
GET  /api/activity/user/:userId   - Get user-specific logs
GET  /api/activity/export/csv     - Export as CSV
DELETE /api/activity/cleanup      - Delete old logs
```

#### 5. Enhanced Auth Logging

Updated `backend/controllers/authController.js` to log:

- LOGIN (successful)
- LOGIN_FAILED (failed password)
- ACCOUNT_LOCKED (after 5 failed attempts)

### Frontend Components

#### 1. Enhanced ActivityLog Page (`frontend/src/pages/ActivityLog.jsx`)

```jsx
Features:
✓ Real-time activity monitor with timestamps
✓ Search by user name
✓ Filter by action (LOGIN, UPLOAD_FILE, DELETE_FILE, etc.)
✓ Filter by user role (Admin, Doctor, Nurse, Staff, Patient)
✓ Filter by status (SUCCESS, FAILED, PENDING)
✓ Pagination (20 logs per page)
✓ CSV export with current filters applied
✓ 30-second auto-refresh
✓ Responsive table with color-coded badges
✓ Failed login counter with warnings
✓ Success rate statistics
✓ Time display (both absolute and relative)
```

#### 2. Updated Admin Service (`frontend/src/services/adminService.js`)

```javascript
New functions:
- getActivityLogs(query) - Fetch activity logs with filters
- getFailedLogins(query) - Get failed login attempts
- getActivityStats(query) - Get statistics
- exportActivityLogs(query) - Download CSV export
```

#### 3. Updated Admin Dashboard (`frontend/src/pages/AdminDashboard.jsx`)

- Links to Activity Log page
- Quick action button for "View All Activities"

### Integration Points

#### 1. Backend Integration (`backend/index.js`)

```javascript
Added:
- Import: import activityRoutes from './routes/activityRoutes.js';
- Mount: app.use("/api/activity", activityRoutes);
```

#### 2. Activity Tracking in Auth Controller

```javascript
Updated loginUser() to call:
- logActivityWithRequest() on successful LOGIN
- logActivityWithRequest() on LOGIN_FAILED
- logActivityWithRequest() on ACCOUNT_LOCKED
```

## How to Use

### View Activity Monitor

1. Navigate to Admin Dashboard
2. Click "Activity Log" or "View All Activities" button
3. See real-time trace monitor with:
   - Time stamps (exact time + relative time)
   - User name who performed action
   - User role (Admin, Nurse, Staff, etc.)
   - Action performed (LOGIN, UPLOAD_FILE, etc.)
   - Resource affected
   - Status (SUCCESS, FAILED, PENDING)

### Search and Filter

- **Search Box**: Find activities by user name
- **Action Filter**: Select specific action type
- **Role Filter**: Filter by user role
- **Status Filter**: Show only SUCCESS/FAILED/PENDING

### Monitor Failed Logins

- Failed login counter displayed at top
- Red color warning if > 5 failed logins in period
- Click "Failed Logins" filter to see all failed attempts
- Grouped by user to identify attacks

### Export Logs

1. Set desired filters
2. Click "Export as CSV" button
3. CSV file downloads with:
   - Timestamp, User Name, Role, Action, Resource, Status, IP, Duration
   - All rows matching current filters

### Real-time Monitoring

- Page auto-refreshes every 30 seconds
- Latest activities appear at top
- Refresh button for manual update

## Database Indexes

ActivityLog schema includes indexes for fast queries:

```javascript
-userId +
  timestamp(desc) -
  action +
  timestamp(desc) -
  userRole +
  timestamp(desc) -
  timestamp(desc) -
  resourceType +
  resourceId;
```

## Activity Types Tracked

### Authentication

- LOGIN (successful login)
- LOGOUT (user logout)
- LOGIN_FAILED (wrong password)
- ACCOUNT_LOCKED (after 5 failed attempts)
- PASSWORD_RESET
- EMAIL_VERIFIED
- OTP_VERIFIED

### File Operations

- UPLOAD_FILE
- DELETE_FILE
- DOWNLOAD_FILE
- SHARE_REPORT

### User Management

- CREATE_STAFF
- DELETE_STAFF
- UPDATE_STAFF
- UPDATE_PATIENT
- DELETE_PATIENT
- PROFILE_UPDATE

### System

- INVITE_SENT
- ACCOUNT_UNLOCKED

## Configuration

### Auto-refresh Interval

Edit in `ActivityLog.jsx` line ~86:

```javascript
const interval = setInterval(() => {
  fetchActivityLogs();
  fetchActivityStats();
}, 30000); // Change 30000 to desired milliseconds
```

### Logs Per Page

Edit in `ActivityLog.jsx` line ~57:

```javascript
limit: 20,  // Change to desired number
```

### Cleanup Old Logs

Admin can periodically clean old logs via:

```bash
DELETE /api/activity/cleanup?daysToKeep=90
```

## Security Considerations

✓ All activity routes require admin authentication
✓ Only admins can view activity logs
✓ IP addresses logged for audit trail
✓ User agents recorded for device identification
✓ No sensitive data (passwords, tokens) logged
✓ Export available only to admins
✓ Timestamps prevent timezone confusion

## Next Steps

To add activity logging to other controllers:

1. Import logActivityWithRequest:

```javascript
import { logActivityWithRequest } from "../utils/activityLogger.js";
```

2. Log activities in controller functions:

```javascript
await logActivityWithRequest(req, {
  userId: user._id,
  userName: user.fullName,
  userRole: user.role,
  action: "UPLOAD_FILE",
  resourceType: "REPORT",
  resourceId: report._id,
  resourceName: report.reportName,
  status: "SUCCESS",
});
```

3. For errors, set status to FAILED and add errorMessage:

```javascript
await logActivityWithRequest(req, {
  userId: user._id,
  userName: user.fullName,
  userRole: user.role,
  action: "UPLOAD_FILE",
  resourceType: "REPORT",
  status: "FAILED",
  errorMessage: "File size exceeds limit",
});
```

## Testing

### Test Login Activity

1. Log in with valid credentials
2. Check Activity Log - should see LOGIN action
3. Verify timestamp is current
4. Try invalid login
5. Should see LOGIN_FAILED action

### Test Filters

1. Upload multiple files
2. Create staff accounts
3. In Activity Log, filter by action "UPLOAD_FILE"
4. Should show only file uploads

### Test Export

1. Apply filters
2. Click Export button
3. CSV file should contain all matching records
4. Open in Excel/Google Sheets to verify

### Test Failed Login Detection

1. Attempt login 5 times with wrong password
2. 6th attempt should show "Account Locked"
3. Activity log should show:
   - 5x LOGIN_FAILED
   - 1x ACCOUNT_LOCKED

## Performance Notes

- Activity logs are indexed for fast queries
- Pagination prevents loading too many records
- Auto-refresh is non-blocking (every 30 seconds)
- CSV export streams large datasets efficiently
- Consider archiving old logs after 90 days

## Troubleshooting

### No activities showing

- Check admin authentication
- Verify backend is running
- Check browser console for errors
- Ensure activityRoutes are imported in index.js

### Export not working

- Ensure user has admin role
- Check if browser allows downloads
- Verify API endpoint is accessible
- Check CORS configuration

### Auto-refresh not working

- Verify fetch functions are imported correctly
- Check browser network tab for API calls
- Ensure no JavaScript errors in console
