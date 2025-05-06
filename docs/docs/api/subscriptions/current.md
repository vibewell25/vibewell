# Get Current Subscription

Get details about the current user's subscription.

## Endpoint

```
GET /api/subscriptions/current
```

## Authentication

Requires a valid JWT token.

## Request

### Headers

| Name | Required | Description |
|------|----------|-------------|
| Authorization | Yes | Bearer token |

### Body

No body required.

## Response

### 200 OK

```json
{
  "success": true,
  "data": {
    "status": "active",
    "plan": "premium",
    "currentPeriodEnd": "2024-12-31T23:59:59Z",
    "cancelAtPeriodEnd": false
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Subscription status (active, canceled, past_due) |
| plan | string | Current plan (basic, premium, professional) |
| currentPeriodEnd | string | ISO 8601 timestamp of period end |
| cancelAtPeriodEnd | boolean | Whether subscription will cancel at period end |

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Unauthorized"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "USER_001",
    "message": "User not found"
  }
}
```

## Example

### cURL

```bash
curl -X GET \
  '%API_BASE_URL%/subscriptions/current' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### JavaScript

```javascript
const response = await fetch('%API_BASE_URL%/subscriptions/current', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### Python

```python
import requests

response = requests.get(
    '%API_BASE_URL%/subscriptions/current',
    headers={'Authorization': f'Bearer {token}'}
)
data = response.json()
```

## Notes

- Returns `null` in the data field if the user has no active subscription
- Subscription status is cached for 5 minutes
- Rate limited to 10 requests per minute per user 