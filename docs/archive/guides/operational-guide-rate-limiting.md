# Operational Guide: Monitoring Rate Limiting in Production

This guide provides comprehensive instructions for monitoring and managing the rate limiting system in the VibeWell production environment.

## Table of Contents

1. [Overview](#overview)
2. [Monitoring Tools](#monitoring-tools)
3. [Daily Monitoring Procedures](#daily-monitoring-procedures)
4. [Alert Response](#alert-response)
5. [Maintenance Tasks](#maintenance-tasks)
6. [Troubleshooting](#troubleshooting)
7. [Performance Tuning](#performance-tuning)
8. [Reference](#reference)

## Overview

VibeWell's rate limiting system uses Redis as a backend for storing rate limit counters and events. The system is designed to:

- Protect sensitive API endpoints from abuse
- Prevent brute force attacks on authentication systems
- Mitigate the impact of DDoS attacks
- Ensure fair API usage across all clients
- Track and alert on suspicious activity

This guide focuses on the operational aspects of monitoring and maintaining this system in production.

## Monitoring Tools

### 1. Admin Dashboard

The primary tool for day-to-day monitoring is the rate limiting admin dashboard accessible at:

```
https://[your-production-domain]/admin/rate-limits
```

This dashboard provides:

- Real-time view of rate limit events
- List of currently blocked IPs
- Visualization of rate limiting patterns
- Interface to manage blocked IPs
- Historical rate limiting data

### 2. Grafana Dashboards

For deeper monitoring, use the Grafana dashboards:

- **Redis Rate Limiting Dashboard**: General metrics about the Redis rate limiting system
- **Security Monitoring Dashboard**: Focus on suspicious activity and potential attacks
- **API Performance Dashboard**: Impact of rate limiting on overall API performance

Access Grafana at:

```
https://[your-production-domain]:3001
```

Login credentials are stored in the secure password manager.

### 3. Redis CLI

For direct debugging and advanced operations, connect to Redis using the CLI:

```bash
redis-cli -h [redis-host] -p 6379 -a [redis-password]
```

See the [Troubleshooting](#troubleshooting) section for useful Redis commands.

### 4. Logs

Rate limiting events are logged to the application logs with the prefix `[rate-limit]`. You can access these logs via:

- CloudWatch Logs (if using AWS)
- Application log files at `/var/log/vibewell/rate-limit.log`
- Log aggregation system (e.g., ELK stack, Datadog)

## Daily Monitoring Procedures

### Morning Check (9:00 AM)

1. **Dashboard Review**
   - Log into the admin dashboard
   - Check the "Rate Limit Events" section for the past 24 hours
   - Note any significant increases in rate limiting frequency
   - Review the list of blocked IPs

2. **Grafana Alert Review**
   - Check for any triggered alerts in Grafana
   - Verify that Redis metrics are within normal ranges
   - Check Redis memory usage (should be below 80%)

3. **Log Review**
   - Check for any ERROR or WARN level logs related to rate limiting
   - Look for patterns of failed authentication attempts

### Afternoon Check (2:00 PM)

1. **Traffic Pattern Review**
   - Check traffic patterns in the "API Requests per Minute" graph
   - Compare to baseline for the day of week
   - Look for unusual patterns that might indicate credential stuffing or other attacks

2. **Blocked IP Review**
   - Review newly blocked IPs since morning check
   - Verify legitimacy of blocks (are they real threats or false positives?)
   - For any suspected false positives, follow the [unblocking procedure](#unblocking-ips)

### End of Day Review (5:00 PM)

1. **Summary Check**
   - Review daily summary of rate limiting events
   - Note any recurring patterns for future investigation
   - Verify Redis performance remains stable

2. **Report Generation**
   - Generate daily rate limiting report if enabled
   - Report any significant security events to the security team

## Alert Response

### Rate Limit Spike Alert

This alert triggers when rate limit events exceed 3x standard deviation.

**Response Procedure:**

1. Determine which endpoints are experiencing the spike
2. Check the source IPs - is it distributed or from specific IPs?
3. Review user agents and request patterns
4. If a legitimate attack:
   - Consider enabling stricter rate limits temporarily
   - If severe, activate WAF rules to block suspicious IPs
5. If false positive (legitimate traffic):
   - Adjust rate limits if necessary
   - Document the traffic pattern for future reference

### Redis High Memory Alert

This alert triggers when Redis memory usage exceeds 80%.

**Response Procedure:**

1. Check Redis memory usage with `redis-cli info memory`
2. Verify if rate limiting keys are consuming excessive memory:
   ```
   redis-cli --bigkeys
   ```
3. Consider running the cleanup script to remove old rate limiting data:
   ```
   npm run cleanup:rate-limit-data
   ```
4. If memory continues to grow, consider:
   - Adjusting TTL on rate limiting keys
   - Increasing Redis memory allocation
   - Adding Redis cluster nodes if using cluster mode

### Suspicious IP Alert

This alert triggers when multiple authentication failures are detected from an IP.

**Response Procedure:**

1. Check the IP details in the admin dashboard
2. Review the pattern of requests:
   - Is it attempting to access multiple accounts?
   - What endpoints are being targeted?
3. Verify geolocation data for the IP
4. If suspicious:
   - Allow the automated block to remain in place
   - Consider adding to permanent block list if activity continues
5. If false positive:
   - Unblock the IP using admin dashboard
   - Update detection rules if necessary

## Maintenance Tasks

### Weekly Maintenance

#### 1. Redis Data Cleanup (Mondays)

1. Check Redis memory usage:
   ```
   redis-cli info memory
   ```

2. Run the cleanup script:
   ```
   npm run cleanup:rate-limit-data --days=30
   ```

3. Verify memory usage after cleanup

#### 2. Blocked IP Review (Wednesdays)

1. Export the full list of blocked IPs:
   ```
   redis-cli keys "vibewell:ratelimit:blocked:*" > blocked_ips.txt
   ```

2. Review long-term blocked IPs:
   ```
   redis-cli --scan --pattern "vibewell:ratelimit:blocked:*" | xargs -L 1 redis-cli ttl
   ```

3. Unblock any IPs that appear to be false positives

#### 3. Performance Review (Fridays)

1. Generate weekly rate limiting performance report:
   ```
   npm run report:rate-limit-weekly
   ```

2. Review Redis performance metrics in Grafana
3. Adjust rate limiting thresholds if needed

### Monthly Maintenance

#### 1. Configuration Review

1. Review rate limiting configuration:
   ```
   cat .env.production | grep RATE_LIMIT
   ```

2. Compare against recommended thresholds based on current traffic patterns
3. Update configuration if needed

#### 2. Redis Health Check

1. Run Redis diagnostics:
   ```
   redis-cli --stat
   redis-cli info
   ```

2. Check for any error logs or warnings
3. Verify Redis replication is working (if using replica setup)

#### 3. Load Testing

1. Run load tests against staging environment:
   ```
   npm run load-test:rate-limit
   ```

2. Review performance under load
3. Adjust configuration if necessary

## Troubleshooting

### Checking Rate Limiting Status

Check all rate limiting keys:
```
redis-cli keys "vibewell:ratelimit:*" | wc -l
```

Get all blocked IPs:
```
redis-cli keys "vibewell:ratelimit:blocked:*"
```

Check specific IP rate limit:
```
redis-cli get "vibewell:ratelimit:auth:192.168.1.1"
```

### Unblocking IPs

Using Admin Dashboard:
1. Navigate to "Blocked IPs" section
2. Find the IP address
3. Click "Unblock" button

Using Redis CLI:
```
redis-cli del "vibewell:ratelimit:blocked:192.168.1.1"
```

Using API:
```
curl -X POST https://[your-production-domain]/api/admin/rate-limits \
  -H "Authorization: Bearer [admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.1","action":"unblock"}'
```

### Checking Rate Limit Events

View recent rate limit events:
```
redis-cli zrevrange "vibewell:ratelimit:events" 0 9
```

Count events in last hour:
```
redis-cli zcount "vibewell:ratelimit:events" $(date -d "1 hour ago" +%s)000 $(date +%s)000
```

### Emergency Reset

In emergency situations (e.g., legitimate users blocked accidentally), you can reset all rate limiting data:

```
redis-cli keys "vibewell:ratelimit:*" | xargs redis-cli del
```

**CAUTION**: Use this only in extreme circumstances as it will remove all rate limiting protection temporarily.

### Redis Connectivity Issues

1. Check Redis server status:
   ```
   systemctl status redis-server
   ```

2. Test connection:
   ```
   redis-cli -h [redis-host] ping
   ```

3. Check network access:
   ```
   telnet [redis-host] 6379
   ```

4. Review Redis logs:
   ```
   tail -100 /var/log/redis/redis-server.log
   ```

## Performance Tuning

### Adjusting Rate Limits

Rate limits can be adjusted in the `.env.production` file:

```
# Default rate limit
DEFAULT_RATE_LIMIT_MAX=60
DEFAULT_RATE_LIMIT_WINDOW=60

# Authentication rate limit
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW=900
```

After changing, restart the application:
```
npm run restart:production
```

### Optimizing Redis Performance

1. Adjust Redis maxmemory setting:
   ```
   redis-cli config set maxmemory 1gb
   ```

2. Optimize Redis persistence:
   ```
   redis-cli config set appendfsync everysec
   ```

3. Update Redis configuration file for permanent changes:
   ```
   sudo nano /etc/redis/redis.conf
   ```

### Load Balancer Configuration

If using multiple application instances behind a load balancer, ensure consistent rate limiting by:

1. Enabling sticky sessions for authentication endpoints
2. Configuring Redis to be accessible from all application instances
3. Using a consistent client IP header (X-Forwarded-For)

## Reference

### Key Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_ENABLED` | Enable Redis-backed rate limiting | `true` |
| `REDIS_URL` | Connection URL | `redis://localhost:6379` |
| `REDIS_PASSWORD` | Redis password | N/A |
| `RATE_LIMIT_MODE` | Mode (redis or memory) | `redis` |
| `DEFAULT_RATE_LIMIT_MAX` | Default max requests | 60 |
| `DEFAULT_RATE_LIMIT_WINDOW` | Default window (seconds) | 60 |
| `AUTH_RATE_LIMIT_MAX` | Auth max requests | 10 |
| `AUTH_RATE_LIMIT_WINDOW` | Auth window (seconds) | 900 |

### Redis Key Patterns

| Pattern | Description |
|---------|-------------|
| `vibewell:ratelimit:general:{ip}` | General rate limiting |
| `vibewell:ratelimit:auth:{ip}` | Authentication rate limiting |
| `vibewell:ratelimit:blocked:{ip}` | Blocked IPs |
| `vibewell:ratelimit:events` | Rate limiting events |
| `vibewell:ratelimit:suspicious:{ip}` | Suspicious IPs |

### Useful Commands

#### Redis Commands

```
# Get all keys
keys vibewell:ratelimit:*

# Delete all rate limiting data (emergency use only)
keys vibewell:ratelimit:* | xargs del

# Check Redis memory usage
info memory

# Get all blocked IPs
keys vibewell:ratelimit:blocked:*

# Count total rate limit events
zcard vibewell:ratelimit:events

# Backup rate limiting configuration
config get "*rate*" > rate_limit_config.txt
```

#### Application Commands

```
# Generate rate limiting report
npm run report:rate-limit

# Run load test
npm run load-test:rate-limit

# Clean up old rate limiting data
npm run cleanup:rate-limit-data

# Restart application
npm run restart:production
```

### Contact Information

For urgent rate limiting issues, contact:

- **Security Team**: security@vibewell.example.com
- **DevOps Team**: devops@vibewell.example.com
- **On-Call Engineer**: Reachable through PagerDuty

### Related Documentation

- [Rate Limiting Implementation Guide](./rate-limiting.md)
- [Redis Configuration Guide](./redis-configuration.md)
- [Security Implementation Guide](./security-implementation.md)
- [Load Testing Guide](./load-testing.md) 