# VibeWell API Documentation

## Overview
This documentation covers all API endpoints, authentication methods, and data models used in the VibeWell application.

## Base URL
```
Production: %API_BASE_URL%
Development: %API_BASE_URL%
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: {
  "accessToken": "string",
  "refreshToken": "string",
  "user": UserObject
}
```

#### Social Authentication
```http
POST /auth/social/{provider}
Content-Type: application/json

{
  "accessToken": "string",
  "idToken?: "string"  // Required for Google
}

Response: {
  "accessToken": "string",
  "refreshToken": "string",
  "user": UserObject
}
```
Supported providers: google, facebook, twitter, linkedin, github, apple

#### Two-Factor Authentication
```http
POST /auth/2fa/setup
Content-Type: application/json
Authorization: Bearer <token>

Response: {
  "secret": "string",
  "qrCode": "string",
  "backupCodes": string[]
}

POST /auth/2fa/verify
Content-Type: application/json

{
  "code": "string"
}

Response: {
  "verified": boolean
}
```

### User Management

#### Get User Profile
```http
GET /users/me
Authorization: Bearer <token>

Response: UserObject
```

#### Update User Profile
```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "picture": "string",
  "phoneNumber": "string"
}

Response: UserObject
```

#### Delete Account
```http
DELETE /users/me
Authorization: Bearer <token>

Response: {
  "success": true
}
```

### Security Settings

#### Update Security Settings
```http
PATCH /users/me/security
Authorization: Bearer <token>
Content-Type: application/json

{
  "twoFactorEnabled": boolean,
  "passwordlessLogin": boolean,
  "trustedDevices": string[]
}

Response: {
  "success": true,
  "settings": SecuritySettings
}
```

### Privacy Settings

#### Update Privacy Settings
```http
PATCH /users/me/privacy
Authorization: Bearer <token>
Content-Type: application/json

{
  "dataSharing": boolean,
  "activityTracking": boolean,
  "locationServices": boolean
}

Response: {
  "success": true,
  "settings": PrivacySettings
}
```

## Data Models

### User Object
```typescript
{
  id: string;
  email: string;
  name: string;
  picture?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  authProvider?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Error Responses
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

Common error codes:
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `INVALID_CREDENTIALS`: Invalid login credentials
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `FORBIDDEN`: Insufficient permissions

## Rate Limiting
API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Webhooks
Webhooks are available for real-time event notifications:

```http
POST /webhooks/configure
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "string",
  "events": string[],
  "secret": "string"
}

Response: {
  "webhookId": "string",
  "status": "active"
}
```

### Available Events
- `user.created`
- `user.updated`
- `user.deleted`
- `auth.login`
- `auth.logout`
- `security.2fa.enabled`
- `security.2fa.disabled`

## SDK Support
Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Java
- Swift
- Kotlin

## Best Practices
1. Always validate tokens on the server side
2. Use appropriate HTTP methods for operations
3. Include proper error handling
4. Implement retry logic for failed requests
5. Cache responses when appropriate

## Versioning
API versioning is handled through the URL path. The current version is latest.
Breaking changes will result in a new version number.

## Support
- Email: api-support@vibewell.com
- Documentation: https://docs.vibewell.com/api
- Status page: https://status.vibewell.com 