# VibeWell API Documentation

## 🔑 Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🌐 Base URL

```
Production: %API_BASE_URL%
Development: http://localhost:3000/api/v1
```

## 📋 API Endpoints

### User Management

#### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "CLIENT" | "PRACTITIONER"
}
```

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

#### Delete Account
```http
DELETE /users/me
```

### Session Management

#### List Active Sessions
```http
GET /sessions
```

#### End Specific Session
```http
DELETE /sessions/{sessionId}
```

#### End All Other Sessions
```http
DELETE /sessions/all-except-current
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

#### Update Booking
```http
PATCH /bookings/{bookingId}
Content-Type: application/json

{
  "startTime": "ISO8601",
  "endTime": "ISO8601",
  "notes": "string",
  "status": "string"
}
```

#### Cancel Booking
```http
POST /bookings/{bookingId}/cancel
```

### Payment Management

#### Create Payment Intent
```http
POST /payments/intent
Content-Type: application/json

{
  "amount": number,
  "currency": "string",
  "bookingId": "string"
}
```

#### List Transactions
```http
GET /payments/transactions
Query Parameters:
- startDate: "YYYY-MM-DD"
- endDate: "YYYY-MM-DD"
- status: "COMPLETED" | "PENDING" | "FAILED"
```

### Service Management

#### Create Service
```http
POST /services
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "duration": number,
  "price": number,
  "currency": "string",
  "category": "string"
}
```

#### List Services
```http
GET /services
Query Parameters:
- category: "string"
- priceRange: "0-100"
- availability: boolean
```

#### Update Service
```http
PATCH /services/{serviceId}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "duration": number,
  "price": number
}
```

### Analytics

#### Get Business Analytics
```http
GET /analytics/business
Query Parameters:
- startDate: "YYYY-MM-DD"
- endDate: "YYYY-MM-DD"
- metrics: ["revenue", "bookings", "clients"]
```

#### Get User Analytics
```http
GET /analytics/user
Query Parameters:
- startDate: "YYYY-MM-DD"
- endDate: "YYYY-MM-DD"
- metrics: ["sessions", "progress", "achievements"]
```

### Notifications

#### Get Notifications
```http
GET /notifications
Query Parameters:
- type: "BOOKING" | "PAYMENT" | "SYSTEM"
- status: "READ" | "UNREAD"
```

#### Mark Notification as Read
```http
PATCH /notifications/{notificationId}
Content-Type: application/json

{
  "status": "READ"
}
```

### Social Features

#### Create Post
```http
POST /social/posts
Content-Type: application/json

{
  "content": "string",
  "media": ["url1", "url2"],
  "visibility": "PUBLIC" | "PRIVATE" | "CONNECTIONS"
}
```

#### Get Feed
```http
GET /social/feed
Query Parameters:
- page: number
- limit: number
- filter: "ALL" | "CONNECTIONS" | "TRENDING"
```

## 📊 Response Formats

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

## ⚠️ Error Codes

- `AUTH_001`: Authentication Required
- `AUTH_002`: Invalid Token
- `AUTH_003`: Token Expired
- `PERM_001`: Insufficient Permissions
- `VAL_001`: Validation Error
- `BOOK_001`: Booking Conflict
- `PAY_001`: Payment Failed
- `SRV_001`: Service Unavailable

## 🔒 Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623456789
```

## 📦 Webhooks

### Available Events
- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `payment.succeeded`
- `payment.failed`
- `user.created`
- `user.updated`

### Webhook Format
```json
{
  "id": "string",
  "type": "string",
  "created": "ISO8601",
  "data": {
    // Event specific data
  }
}
```

## 🔄 Versioning

The API uses semantic versioning. The current version is specified in the URL path.
Breaking changes will result in a new API version.

## 📚 SDKs and Libraries

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Ruby
- PHP
- Java
- Swift
- Kotlin

## 🧪 Testing

A sandbox environment is available for testing:
```
https://sandbox-api.vibewell.com/v1
```

Test credentials and tokens are provided in the developer dashboard.

## Authentication

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
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

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

## User Management

### Get User Profile
```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

### Update User Profile
```http
PUT /api/users/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "avatar": "string"
}
```

## Mobile-Specific Endpoints

### Register Device Token
```http
POST /api/devices/register
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "token": "string",
  "platform": "ios|android"
}
```

### Update Notification Settings
```http
PUT /api/users/notifications
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "pushEnabled": boolean,
  "emailEnabled": boolean,
  "types": ["reminder", "message", "update"]
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
``` 