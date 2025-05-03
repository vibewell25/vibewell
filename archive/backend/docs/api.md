# Two-Factor Authentication API Documentation

## Overview
This API provides endpoints for managing two-factor authentication (2FA) using TOTP (Time-based One-Time Password).

## Base URL
```
/api/auth/2fa
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Rate Limiting
- Generate endpoint: 5 requests per 15 minutes
- Verify endpoint: 10 requests per 5 minutes

## Endpoints

### Generate 2FA Secret
Generates a new 2FA secret and QR code for setup.

```
POST /generate
```

#### Response
```json
{
  "success": true,
  "secretKey": "ABCDEFGHIJKLMNOP",
  "qrCodeUrl": "data:image/png;base64,..."
}
```

#### Error Responses
- `401` Unauthorized - Invalid or missing token
- `400` Bad Request - 2FA already enabled
- `404` Not Found - User not found
- `500` Internal Server Error

### Verify 2FA Code
Verifies a 6-digit 2FA code.

```
POST /verify
```

#### Request Body
```json
{
  "code": "123456"
}
```

#### Validation
- `code`: Must be exactly 6 digits

#### Response
```json
{
  "success": true,
  "message": "Code verified successfully"
}
```

#### Error Responses
- `401` Unauthorized - Invalid or missing token
- `400` Bad Request - Invalid or missing code
- `500` Internal Server Error

### Generate Backup Codes
Generates a set of backup codes for account recovery.

```
POST /backup-codes
```

#### Response
```json
{
  "success": true,
  "backupCodes": [
    "ABCD1234",
    "EFGH5678",
    ...
  ]
}
```

#### Error Responses
- `401` Unauthorized - Invalid or missing token
- `404` Not Found - User not found
- `500` Internal Server Error

### Enable 2FA
Enables 2FA for the user's account after successful verification.

```
POST /enable
```

#### Response
```json
{
  "success": true,
  "message": "2FA has been enabled successfully"
}
```

#### Error Responses
- `401` Unauthorized - Invalid or missing token
- `400` Bad Request - 2FA already enabled
- `404` Not Found - User not found
- `500` Internal Server Error

## Error Response Format
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Considerations
1. Temporary secrets are stored in Redis with a 15-minute expiry
2. Rate limiting is enforced to prevent brute force attacks
3. All requests must be authenticated with a valid JWT token
4. Input validation is performed on all endpoints
5. HTTPS is required for all API calls 