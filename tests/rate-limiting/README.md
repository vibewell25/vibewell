# Rate Limiting Load Testing

This directory contains load testing scripts for Redis-based rate limiting in the Vibewell API.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/)
- Running Redis server (for production mode tests)
- Running Vibewell API server

## Test API Routes

The load tests target the following test endpoints:

- **General API**: `/api/test/general` - Basic API rate limiting (60 requests/minute)
- **Auth API**: `/api/test/auth` - Authentication rate limiting (10 requests/15 minutes)
- **Sensitive API**: `/api/test/sensitive` - Sensitive operations rate limiting (30 requests/hour)
- **Admin API**: `/api/test/admin` - Admin operations rate limiting (30 requests/5 minutes)

## Running the Tests

### Using the Script

The easiest way to run all tests is using the provided script:

```bash
# Make the script executable first
chmod +x ./scripts/load-testing.sh

# Run all tests
./scripts/load-testing.sh
```

### Running Individual Tests

You can also run individual tests directly with k6:

```bash
# Run the auth rate limit test
k6 run ./tests/rate-limiting/k6-scripts/auth.js
```

## Configuring the Tests

### Environment Variables

Set these variables in your `.env.local` file or provide them to the test scripts:

```
# Enable Redis for production mode tests
NODE_ENV=production
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# Rate limiting settings
RATE_LIMIT_GENERAL=60
RATE_LIMIT_AUTH=10
RATE_LIMIT_SENSITIVE=30
RATE_LIMIT_ADMIN=30
```

### Test Parameters

You can customize test parameters when running k6 directly:

```bash
k6 run ./tests/rate-limiting/k6-scripts/general.js \
    -e BASE_URL="http://localhost:3000/api/test" \
    -e USERS=15 \
    -e DURATION="30s"
```

## Viewing Results

Results will be saved to the `./load-test-results/` directory:

- JSON summary files for each test
- CSV files with detailed metrics
- An HTML report combining all test results

## Analyzing Redis Rate Limiting

After running the tests, check:

1. Redis logs for rate limiting entries
2. Rate limiting events in the Redis database
3. The built-in Vibewell admin dashboard for rate limit analytics

## Troubleshooting

If you encounter issues:

1. Check that Redis is running: `redis-cli ping`
2. Verify the API server is running: `curl http://localhost:3000/api/health`
3. Make sure the `.env.local` file has the correct Redis configuration
4. If using Docker, ensure Redis ports are properly mapped 