# API Documentation Guide

## Overview

This guide provides a comprehensive reference for the VibeWell API, including authentication methods, available endpoints, request/response formats, and best practices for API consumption.

## Base URL

```
Production: %API_BASE_URL%
Development: http://localhost:3000/api/v1
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Flow

1. Client sends login credentials to `/auth/login`
2. Server validates credentials and returns a JWT token
3. Client includes the token in the `Authorization` header for subsequent requests
4. Server validates the token and processes the request

### Authentication Endpoints

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

## API Endpoints

### User Management

#### Get User Profile

```http
GET /users/me
```

#### Update User Profile

```http
PATCH /users/me
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "preferences": object
}
```

### Booking Management

#### Create Booking

```http
POST /bookings
Content-Type: application/json

{
  "practitionerId": "string",
  "serviceId": "string",
  "startTime": "ISO8601",
  "endTime": "ISO8601",
  "notes": "string"
}
```

#### List Bookings

```http
GET /bookings
Query Parameters:
- status: "PENDING" | "CONFIRMED" | "CANCELLED"
- startDate: "YYYY-MM-DD"
- endDate: "YYYY-MM-DD"
```

#### Get Booking Details

```http
GET /bookings/{bookingId}
```

### Service Management

#### List Services

```http
GET /services
Query Parameters:
- category: "string"
- priceRange: "0-100"
- availability: boolean
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": object
  }
}
```

## Error Codes

- `AUTH_001`: Authentication Required
- `AUTH_002`: Invalid Token
- `AUTH_003`: Token Expired
- `PERM_001`: Insufficient Permissions
- `VAL_001`: Validation Error
- `BOOK_001`: Booking Conflict
- `PAY_001`: Payment Failed
- `SRV_001`: Service Unavailable

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```

## Best Practices

1. **Always authenticate requests** - Include a valid JWT token in the Authorization header
2. **Handle rate limiting** - Implement backoff strategies when hitting rate limits
3. **Validate input data** - Ensure all data sent to the API is properly validated
4. **Handle errors gracefully** - Parse error responses and display user-friendly messages
5. **Use pagination** - For large collections, implement pagination to improve performance 