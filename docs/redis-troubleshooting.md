# Redis Rate Limiting Troubleshooting Guide

This guide provides detailed steps to troubleshoot and resolve common issues with Redis-based rate limiting in the VibeWell application.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Rate Limiting Not Working](#rate-limiting-not-working)
3. [Redis Performance Issues](#redis-performance-issues)
4. [Memory Issues](#memory-issues)
5. [High Rate of 429 Responses](#high-rate-of-429-responses)
6. [Uneven Rate Limiting Across Instances](#uneven-rate-limiting-across-instances)
7. [Persistence and Data Loss](#persistence-and-data-loss)
8. [Common Redis Commands for Debugging](#common-redis-commands-for-debugging)
9. [Monitoring and Alerts](#monitoring-and-alerts)

## Connection Issues

### Symptoms
- Application logs show Redis connection errors
- Rate limiting falls back to in-memory implementation
- Errors containing "connection refused", "can't connect to Redis", etc.

### Troubleshooting Steps

1. **Verify Redis is running**:
   ```bash
   # Check Redis process
   ps aux | grep redis-server
   
   # Check Redis service status (systemd)
   systemctl status redis-server
   
   # Try pinging Redis
   redis-cli ping
   ```

2. **Check network connectivity**:
   ```bash
   # Test TCP connection to Redis port
   nc -zv redis-host 6379
   
   # Check if firewall is blocking
   telnet redis-host 6379
   ```

3. **Verify Redis configuration**:
   ```bash
   # Check Redis binding configuration
   grep "bind" /etc/redis/redis.conf
   
   # Verify protected mode
   grep "protected-mode" /etc/redis/redis.conf
   ```

4. **Check authentication settings**:
   ```bash
   # Test authentication with password
   redis-cli -a your-password ping
   
   # Verify password in environment variables
   echo $REDIS_PASSWORD
   ```

5. **Review application Redis client settings**:
   ```bash
   # Check environment variables in .env file
   cat .env | grep REDIS
   
   # Verify redis-client.ts has the correct connection logic
   cat src/lib/redis-client.ts
   ```

### Resolution Steps

1. **Restart Redis service**:
   ```bash
   sudo systemctl restart redis-server
   ```

2. **Update firewall rules if needed**:
   ```bash
   # Allow Redis port (for UFW)
   sudo ufw allow from app-server-ip to any port 6379
   ```

3. **Correct Redis binding if needed**:
   ```bash
   # Edit redis.conf to bind to the correct interface
   sudo nano /etc/redis/redis.conf
   # Change: bind 127.0.0.1 to bind 0.0.0.0 (if behind firewall)
   ```

4. **Fix authentication issues**:
   ```bash
   # Update Redis password
   sudo nano /etc/redis/redis.conf
   # Set: requirepass your-strong-password
   
   # Update application environment variable
   sudo nano .env
   # Set: REDIS_PASSWORD=your-strong-password
   ```

## Rate Limiting Not Working

### Symptoms
- No 429 responses despite high request volumes
- Missing rate limit headers in responses
- Rate limiting logs show fallback to in-memory mode

### Troubleshooting Steps

1. **Check if Redis rate limiting is enabled**:
   ```bash
   # Verify environment variables
   cat .env | grep RATE_LIMIT
   cat .env | grep REDIS_ENABLED
   ```

2. **Verify rate limit keys in Redis**:
   ```bash
   # List rate limit keys
   redis-cli keys "vibewell:ratelimit:*"
   
   # Count rate limit keys
   redis-cli keys "vibewell:ratelimit:*" | wc -l
   ```

3. **Check rate limiter middleware configuration**:
   ```bash
   # Review rate limiter configuration
   cat src/lib/redis-rate-limiter.ts
   ```

4. **Test rate limiting manually**:
   ```bash
   # Send rapid requests to test rate limiting
   for i in {1..150}; do curl -I http://your-api-url/api/endpoint; done
   ```

5. **Examine application logs for rate limiting entries**:
   ```bash
   # Look for rate limiting logs
   grep "rate limit" application.log
   ```

### Resolution Steps

1. **Enable Redis rate limiting**:
   ```bash
   # Update environment variables
   sudo nano .env
   # Set: REDIS_ENABLED=true
   # Set: RATE_LIMIT_MODE=redis
   ```

2. **Adjust rate limit thresholds if needed**:
   ```bash
   # Update environment variables
   sudo nano .env
   # Example: RATE_LIMIT_GENERAL=120,60  (120 requests per 60 seconds)
   ```

3. **Restart application to apply changes**:
   ```bash
   # Restart application
   npm run restart
   # Or for Docker
   docker-compose restart app
   ```

4. **Clear existing rate limit data for testing**:
   ```bash
   # Clear all rate limit keys
   redis-cli keys "vibewell:ratelimit:*" | xargs redis-cli del
   ```

## Redis Performance Issues

### Symptoms
- Slow response times
- High Redis CPU usage
- Latency spikes in application
- Redis commands taking longer than usual

### Troubleshooting Steps

1. **Check Redis performance metrics**:
   ```bash
   # Get Redis INFO stats
   redis-cli info
   
   # Check latency
   redis-cli --latency
   
   # Check command statistics
   redis-cli info commandstats
   ```

2. **Monitor Redis in real-time**:
   ```bash
   # Watch Redis commands
   redis-cli monitor
   
   # Watch Redis traffic with tcpdump
   sudo tcpdump -i any port 6379 -nn
   ```

3. **Check system resources**:
   ```bash
   # Check CPU and memory
   top
   
   # Check disk I/O
   iostat -xz 1
   ```

4. **Review Redis configuration for performance settings**:
   ```bash
   # Check maxclients setting
   redis-cli config get maxclients
   
   # Check timeout setting
   redis-cli config get timeout
   ```

5. **Look for slow Redis commands**:
   ```bash
   # Check slow log
   redis-cli slowlog get 10
   ```

### Resolution Steps

1. **Optimize Redis configuration**:
   ```bash
   # Update maxmemory setting
   redis-cli config set maxmemory 2gb
   
   # Set maxmemory-policy
   redis-cli config set maxmemory-policy allkeys-lru
   
   # Increase client timeout
   redis-cli config set timeout 300
   ```

2. **Reduce expensive operations**:
   ```bash
   # Avoid using KEYS in production
   # Replace KEYS commands with SCAN in the code
   ```

3. **Scale Redis if needed**:
   ```bash
   # Vertical scaling: increase memory/CPU
   # Horizontal scaling: implement Redis Cluster
   ```

4. **Implement connection pooling in application**:
   ```javascript
   // Update redis-client.ts to use connection pool
   ```

## Memory Issues

### Symptoms
- Redis running out of memory
- OOM (Out of Memory) errors in Redis logs
- Keys being evicted unexpectedly
- High memory fragmentation ratio

### Troubleshooting Steps

1. **Check Redis memory usage**:
   ```bash
   # Get memory stats
   redis-cli info memory
   
   # Check used_memory and used_memory_peak
   redis-cli info | grep memory
   ```

2. **Analyze key space**:
   ```bash
   # Get database stats
   redis-cli info keyspace
   
   # Count keys by pattern
   redis-cli --scan --pattern "vibewell:ratelimit:*" | wc -l
   ```

3. **Check memory fragmentation ratio**:
   ```bash
   # Good ratio is < 1.5
   redis-cli info | grep mem_fragmentation_ratio
   ```

4. **Monitor memory in real-time**:
   ```bash
   # Use Redis memory monitoring
   redis-cli --stat
   ```

5. **Check maxmemory and eviction policy**:
   ```bash
   # Get maxmemory setting
   redis-cli config get maxmemory
   
   # Get maxmemory-policy
   redis-cli config get maxmemory-policy
   ```

### Resolution Steps

1. **Adjust memory settings**:
   ```bash
   # Set appropriate maxmemory
   redis-cli config set maxmemory 1gb
   
   # Set eviction policy
   redis-cli config set maxmemory-policy allkeys-lru
   
   # Save config
   redis-cli config rewrite
   ```

2. **Add key expiration to rate limit keys**:
   ```bash
   # Check that TTL is set on keys
   redis-cli ttl "vibewell:ratelimit:example-key"
   
   # Set expire on keys without TTL
   redis-cli --scan --pattern "vibewell:ratelimit:*" | xargs -L 1 redis-cli expire {} 86400
   ```

3. **Clean up old/unused data**:
   ```bash
   # Delete all keys matching pattern
   redis-cli --scan --pattern "vibewell:ratelimit:old:*" | xargs redis-cli del
   ```

4. **Consider Redis restart if fragmentation is too high**:
   ```bash
   # Only if fragmentation ratio > 1.5 and causing issues
   sudo systemctl restart redis-server
   ```

5. **Implement memory monitoring and alerts**:
   ```bash
   # Set up monitoring tool to alert when memory reaches threshold
   ```

## High Rate of 429 Responses

### Symptoms
- Too many users receiving 429 (Too Many Requests) responses
- Legitimate traffic being blocked
- Customer complaints about being rate limited

### Troubleshooting Steps

1. **Analyze rate limit events**:
   ```bash
   # Check rate limit keys for specific clients
   redis-cli keys "vibewell:ratelimit:*client-ip*"
   ```

2. **Review rate limit settings**:
   ```bash
   # Check environment variables
   cat .env | grep RATE_LIMIT
   ```

3. **Monitor 429 responses in application logs**:
   ```bash
   # Search for 429 status codes
   grep "429" application.log
   ```

4. **Identify clients that are frequently rate limited**:
   ```bash
   # Use Redis to find clients with many rate limit keys
   ```

### Resolution Steps

1. **Adjust rate limit thresholds**:
   ```bash
   # Increase limits if appropriate
   sudo nano .env
   # Example: Update RATE_LIMIT_GENERAL=240,60 (240 requests per minute)
   ```

2. **Implement per-endpoint rate limits**:
   ```bash
   # Add specific rate limits for high-traffic endpoints
   ```

3. **Consider user-based instead of IP-based limiting**:
   ```bash
   # Update rate limiter to use user ID for authenticated users
   ```

4. **Implement graduated response**:
   ```bash
   # Slower degradation of service instead of hard cutoff
   ```

5. **Add whitelist for trusted clients**:
   ```bash
   # Whitelist specific IPs or clients that need higher limits
   ```

## Uneven Rate Limiting Across Instances

### Symptoms
- Rate limiting works inconsistently
- Different app instances apply different rate limits
- Load balancer related issues

### Troubleshooting Steps

1. **Verify all app instances use same Redis**:
   ```bash
   # Check Redis connection configuration on each instance
   ```

2. **Check Redis master/replica setup if applicable**:
   ```bash
   # Verify replication status
   redis-cli info replication
   ```

3. **Check load balancer configuration**:
   ```bash
   # Review load balancer sticky sessions and IP forwarding
   ```

4. **Verify client IP identification logic**:
   ```bash
   # Review code that determines client IP in src/lib/redis-rate-limiter.ts
   ```

### Resolution Steps

1. **Ensure consistent Redis configuration**:
   ```bash
   # Update all instances to use same Redis URL
   ```

2. **Configure proper client IP detection**:
   ```bash
   # Ensure X-Forwarded-For headers are properly handled
   ```

3. **Use proper cache keys that account for load balancing**:
   ```bash
   # Update rate limiter to use consistent identifier
   ```

4. **Implement Sentinel or Redis Cluster for high availability**:
   ```bash
   # For production with multiple Redis nodes
   ```

## Persistence and Data Loss

### Symptoms
- Rate limit data lost after Redis restart
- Inconsistent rate limiting after server maintenance
- Missing rate limit keys

### Troubleshooting Steps

1. **Check Redis persistence configuration**:
   ```bash
   # Verify AOF is enabled
   redis-cli config get appendonly
   
   # Check RDB settings
   redis-cli config get save
   ```

2. **Examine Redis logs for persistence issues**:
   ```bash
   # Look for AOF or RDB errors
   sudo grep -i "aof" /var/log/redis/redis-server.log
   ```

3. **Verify data persistence after restart**:
   ```bash
   # Set a test key
   redis-cli set test:persistence "value"
   
   # Restart Redis
   sudo systemctl restart redis-server
   
   # Check if key exists
   redis-cli get test:persistence
   ```

### Resolution Steps

1. **Enable Redis persistence**:
   ```bash
   # Enable AOF
   redis-cli config set appendonly yes
   
   # Set appendfsync
   redis-cli config set appendfsync everysec
   
   # Save config
   redis-cli config rewrite
   ```

2. **Set up regular Redis backups**:
   ```bash
   # Create backup script
   sudo nano /etc/cron.daily/redis-backup
   # Add command: redis-cli SAVE
   
   # Make it executable
   sudo chmod +x /etc/cron.daily/redis-backup
   ```

3. **Implement Redis replication for redundancy**:
   ```bash
   # Set up a Redis replica for failover
   ```

4. **Review rate limiter code for proper TTL settings**:
   ```bash
   # Ensure all rate limit keys have appropriate TTL
   ```

## Common Redis Commands for Debugging

Here are useful Redis commands for troubleshooting rate limiting issues:

### Connection and Server Info

```bash
# Ping Redis to check connectivity
redis-cli ping

# Get Redis server information
redis-cli info

# Get server statistics
redis-cli info stats

# Check clients connected
redis-cli info clients

# Get memory usage
redis-cli info memory
```

### Rate Limiting Keys Management

```bash
# List all rate limit keys
redis-cli keys "vibewell:ratelimit:*"

# Count total rate limit keys
redis-cli keys "vibewell:ratelimit:*" | wc -l

# Get value of specific rate limit key
redis-cli get "vibewell:ratelimit:192.168.1.1"

# Check TTL on rate limit key
redis-cli ttl "vibewell:ratelimit:192.168.1.1"

# Clear all rate limit keys (for testing)
redis-cli --scan --pattern "vibewell:ratelimit:*" | xargs redis-cli del
```

### Performance Monitoring

```bash
# Watch Redis commands in real-time
redis-cli monitor

# Check for slow commands
redis-cli slowlog get 10

# Measure latency
redis-cli --latency

# Get command statistics
redis-cli info commandstats

# Benchmark Redis performance
redis-benchmark -h localhost -p 6379 -c 50 -n 10000 -q
```

### Client Management

```bash
# List all connected clients
redis-cli client list

# Kill a specific client
redis-cli client kill addr 192.168.1.10:12345

# Set client timeout
redis-cli config set timeout 300
```

## Monitoring and Alerts

Set up monitoring and alerts for proactive issue detection:

### Key Metrics to Monitor

1. **Memory Usage**:
   - Alert when used_memory exceeds 80% of maxmemory
   - Track memory fragmentation ratio

2. **Connection Rate**:
   - Monitor total_connections_received
   - Alert on sudden spikes in connections

3. **Command Processing**:
   - Track instantaneous_ops_per_sec
   - Monitor command latency

4. **Rate Limiting Specific**:
   - Count of keys matching "vibewell:ratelimit:*"
   - Number of 429 responses
   - Amount of blocked IPs

### Setting Up Alerts

1. **Memory Alert Example**:
   ```bash
   #!/bin/bash
   # Cron job to check Redis memory
   REDIS_MEMORY=$(redis-cli info memory | grep used_memory_human | cut -d ":" -f2 | tr -d '[:space:]')
   THRESHOLD="900M"
   
   if [[ $REDIS_MEMORY > $THRESHOLD ]]; then
     echo "Redis memory alert: $REDIS_MEMORY used" | mail -s "Redis Memory Alert" admin@yourdomain.com
   fi
   ```

2. **Rate Limit Alert Example**:
   ```bash
   #!/bin/bash
   # Alert on high rate of 429 responses
   RATE_LIMITS=$(grep -c "429 Too Many Requests" /var/log/nginx/access.log)
   THRESHOLD=1000
   
   if [[ $RATE_LIMITS -gt $THRESHOLD ]]; then
     echo "High rate limiting activity: $RATE_LIMITS requests limited" | mail -s "Rate Limit Alert" admin@yourdomain.com
   fi
   ```

### Implement Monitoring Tools

1. **Prometheus + Grafana**:
   - Use redis_exporter to collect metrics
   - Set up dashboards and alerting in Grafana

2. **Redis Enterprise Monitoring**:
   - If using Redis Enterprise, leverage built-in monitoring

3. **Custom Monitoring Solution**:
   - Implement custom monitoring using Redis INFO command
   - Store metrics in time-series database

Remember to periodically review and adjust monitoring thresholds based on your application's traffic patterns and rate limiting requirements.

---

For additional assistance, contact the DevOps team or refer to the [Redis Documentation](https://redis.io/documentation). 