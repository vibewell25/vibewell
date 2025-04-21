# Vibewell API Documentation

## Overview

The Vibewell API provides a comprehensive set of endpoints for managing beauty and wellness services, bookings, user accounts, and business operations.

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Base URL

```
Production: https://api.vibewell.com/v1
Development: http://localhost:3000/api
```

## Common Response Format

All responses follow this format:

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string
  } | null
}
```

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Endpoints

### Authentication

- [POST /auth/login](./auth/login.md)
- [POST /auth/register](./auth/register.md)
- [POST /auth/refresh-token](./auth/refresh-token.md)
- [POST /auth/logout](./auth/logout.md)

### Users

- [GET /users/me](./users/me.md)
- [PUT /users/me](./users/update.md)
- [GET /users/{id}](./users/get.md)
- [PUT /users/{id}](./users/update-by-id.md)

### Services

- [GET /services](./services/list.md)
- [POST /services](./services/create.md)
- [GET /services/{id}](./services/get.md)
- [PUT /services/{id}](./services/update.md)
- [DELETE /services/{id}](./services/delete.md)

### Bookings

- [GET /bookings](./bookings/list.md)
- [POST /bookings](./bookings/create.md)
- [GET /bookings/{id}](./bookings/get.md)
- [PUT /bookings/{id}](./bookings/update.md)
- [DELETE /bookings/{id}](./bookings/cancel.md)

### Subscriptions

- [GET /subscriptions/current](./subscriptions/current.md)
- [POST /subscriptions/create](./subscriptions/create.md)
- [POST /subscriptions/cancel](./subscriptions/cancel.md)
- [GET /subscriptions/plans](./subscriptions/plans.md)

### Notifications

- [GET /notifications](./notifications/list.md)
- [POST /notifications/settings](./notifications/update-settings.md)
- [POST /notifications/mark-read](./notifications/mark-read.md)

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Invalid token |
| USER_001 | User not found |
| USER_002 | Invalid user data |
| BOOK_001 | Invalid booking data |
| BOOK_002 | Booking conflict |
| SUB_001  | Invalid subscription |

## Webhooks

Webhooks are available for real-time event notifications. See [Webhook Documentation](./webhooks/README.md) for details.

## SDKs

- [JavaScript/TypeScript SDK](./sdks/javascript.md)
- [Python SDK](./sdks/python.md)
- [Ruby SDK](./sdks/ruby.md)

## Support

For API support, contact:
- Email: api-support@vibewell.com
- Developer Portal: https://developers.vibewell.com 