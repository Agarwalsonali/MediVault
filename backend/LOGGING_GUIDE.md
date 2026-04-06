# MRMS Backend Logging Guide

## Overview

The backend uses Winston for structured, level-wise logging with feature-based separation.

## Log File Structure

### Level-Based Logs

- `YYYY-MM-DD-combined.log` - All logs across all levels and features
- `YYYY-MM-DD-error.log` - Error level logs only
- `YYYY-MM-DD-warn.log` - Warning level logs only
- `YYYY-MM-DD-info.log` - Info level logs only
- `YYYY-MM-DD-http.log` - HTTP request/response logs
- `YYYY-MM-DD-exceptions.log` - Uncaught exceptions
- `YYYY-MM-DD-rejections.log` - Unhandled promise rejections

### Feature-Based Logs

- `YYYY-MM-DD-auth.log` - Authentication feature (login, signup, OTP, password reset, staff invites)
- `YYYY-MM-DD-profile.log` - User profile management (avatar upload/delete, profile updates)
- `YYYY-MM-DD-report.log` - Medical reports (upload, retrieval, deletion)
- `YYYY-MM-DD-contact.log` - Contact/support requests
- `YYYY-MM-DD-admin.log` - Admin setup and operations
- `YYYY-MM-DD-email.log` - Email sending operations
- `YYYY-MM-DD-config.log` - Configuration (Cloudinary setup, etc.)
- `YYYY-MM-DD-patient.log` - Patient data operations
- `YYYY-MM-DD-user.log` - User operations
- `YYYY-MM-DD-http.log` - HTTP request lifecycle

## Log Levels

```
error   - Error conditions (e.g., failed operations, database errors)
warn    - Warnings (e.g., missing avatar, operation skipped)
info    - Informational (e.g., successful operations, important state changes)
http    - HTTP request/response details
debug   - Detailed debugging information (file info, metadata)
```

## Log Entry Format

### File Logs (JSON format)

```json
{
  "timestamp": "2026-04-06T10:30:45.123Z",
  "level": "info",
  "message": "Avatar uploaded successfully",
  "service": "mrms-backend",
  "feature": "profile",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Console Logs (Colored format)

```
2026-04-06T10:30:45.123Z [info] Avatar uploaded successfully {"userId": "507f1f77bcf86cd799439011"}
```

## Features and Their Loggers

| Feature            | Logger Import                   | Log File      |
| ------------------ | ------------------------------- | ------------- |
| Authentication     | `import { authLogger }`         | `auth.log`    |
| Profile Management | `import { profileLogger }`      | `profile.log` |
| Reports            | `import { reportLogger }`       | `report.log`  |
| Contact/Support    | `import { contactLogger }`      | `contact.log` |
| Admin Operations   | `import { adminLogger }`        | `admin.log`   |
| Email Service      | `createFeatureLogger('email')`  | `email.log`   |
| Configuration      | `createFeatureLogger('config')` | `config.log`  |
| HTTP Requests      | Default logger                  | `http.log`    |

## Configuration

### Environment Variables

```bash
LOG_LEVEL=info  # debug, info, warn, error (default: info)
```

### Log Retention Policies

- Combined log: 14 days
- Error log: 30 days
- Feature logs: 14 days
- Exception/Rejection logs: 30 days

### Log Size Management

- Max file size: 20MB
- Automatically rotated daily
- Older logs are archived

## Usage Examples

### In Controllers

```javascript
import { authLogger } from "../utils/logger.js";

authLogger.info("User login attempt", { email, timestamp: new Date() });
authLogger.error("Login failed", { error: error.message });
```

### Create Custom Feature Logger

```javascript
import { createFeatureLogger } from "../utils/logger.js";

const myFeatureLogger = createFeatureLogger("myfeature");
myFeatureLogger.info("Operation started");
```

### Log Levels

```javascript
profileLogger.debug("Detailed info for debugging");
profileLogger.info("General informational message");
profileLogger.warn("Something unexpected happened");
profileLogger.error("An error occurred", { error: err.message });
```

## Viewing Logs

### Recent Combined Logs

```bash
tail -f logs/YYYY-MM-DD-combined.log
```

### Errors Only

```bash
tail -f logs/YYYY-MM-DD-error.log
```

### Feature-Specific (e.g., Auth)

```bash
tail -f logs/YYYY-MM-DD-auth.log
```

### Search for Specific User

```bash
grep "userId" logs/YYYY-MM-DD-profile.log
```

## Best Practices

1. **Use appropriate log levels**
   - `error`: Failed operations, exceptions
   - `warn`: Retryable issues, edge cases
   - `info`: Important state changes, successful operations
   - `debug`: Detailed information for debugging

2. **Include contextual metadata**

   ```javascript
   profileLogger.info("Avatar upload completed", {
     userId,
     fileSize,
     duration,
   });
   ```

3. **Use feature-specific loggers**
   - Always use the appropriate logger for your feature
   - Helps in filtering and debugging

4. **Avoid logging sensitive data**
   - Don't log passwords, tokens, or PII
   - Use sanitized values when necessary

5. **Monitor log file sizes**
   - Logs auto-rotate daily
   - Check retention policies if disk space is limited
