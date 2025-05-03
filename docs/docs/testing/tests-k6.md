# k6 Load Testing for Redis Rate Limiting

This directory contains load testing scripts for evaluating the performance of Redis-based rate limiting in the VibeWell application.

## Quick Start

1. **Set up the environment**:
   ```bash
   ./scripts/setup-load-test.sh
   ```
   This script will:
   - Check if Redis is running (and start it using Docker if needed)
   - Verify k6 is installed
   - Create a `.env.local` file if it doesn't exist
   - Create the results directory

2. **Start the application**:
   ```bash
   npm run dev
   ```

3. **Run the load tests**:
   ```bash
   ./scripts/load-testing.sh
   ```

## Understanding the Test Script

The main test script (`redis-rate-limit-test.js`) contains:

- **Scenarios**: Different load patterns for various API endpoints
- **Metrics**: Custom tracking for success rate, rate limiting events, and response time
- **Thresholds**: Expected performance criteria
- **Test functions**: Specialized tests for each endpoint type

## Test Endpoints

The test targets the following endpoints:

1. `/api/test/general` - General API rate limiting
2. `/api/test/auth` - Authentication endpoints
3. `/api/test/sensitive` - Sensitive operations
4. `/api/test/admin` - Admin operations

## Analyzing Results

After running the tests, check:

1. **HTML Dashboard**: Open the HTML file in the `load-test-results` directory
2. **Text Summary**: Check the terminal output or the text file in the results directory
3. **JSON Data**: For detailed analysis, review the JSON file in the results directory

## Customizing Tests

To customize the tests:

1. Modify the scenarios in `redis-rate-limit-test.js` to change:
   - Number of virtual users
   - Duration of stages
   - Request patterns

2. Adjust thresholds to set different success criteria

3. Update the test functions to:
   - Change request payloads
   - Add different checks
   - Modify sleep intervals

## Troubleshooting

If tests fail to run:

1. **Redis issues**: 
   - Ensure Redis is running: `docker ps | grep redis`
   - Check Redis connection: `redis-cli ping`

2. **Application not running**: 
   - Verify the Next.js server is running
   - Check for errors in the application logs

3. **k6 problems**:
   - Verify k6 installation: `k6 version`
   - Check for syntax errors in the test script

## Further Reading

- [k6 Documentation](https://k6.io/docs/)
- [VibeWell Rate Limiting Guide](../../docs/rate-limiting.md)
- [Load Testing Guide](../../docs/load-testing.md) 