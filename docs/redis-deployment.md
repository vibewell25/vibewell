# Redis Deployment Guide for Production

This guide provides step-by-step instructions for deploying Redis in a production environment for the Vibewell application's rate limiting system.

## 1. Set Up Redis Instance in Production

### Option A: Deploy on a dedicated server

1. **Provision a server**:
   ```bash
   # Example for Ubuntu server
   sudo apt update
   sudo apt upgrade -y
   sudo apt install redis-server -y
   ```

2. **Configure Redis for production**:
   ```bash
   sudo nano /etc/redis/redis.conf
   ```

   Make the following changes:
   ```
   # Bind to all interfaces if behind a firewall, otherwise specify private IP
   bind 0.0.0.0
   
   # Set password authentication
   requirepass YourStrongPasswordHere
   
   # Enable AOF persistence for better durability
   appendonly yes
   appendfsync everysec
   
   # Set memory limits to prevent OOM issues
   maxmemory 2gb
   maxmemory-policy allkeys-lru
   
   # Connection settings
   timeout 60
   tcp-keepalive 300
   
   # Protection mode
   protected-mode yes
   ```

3. **Restart Redis service**:
   ```bash
   sudo systemctl restart redis-server
   sudo systemctl enable redis-server
   ```

4. **Verify Redis is running**:
   ```bash
   redis-cli ping
   # Should respond with PONG
   
   # Test with password
   redis-cli
   > AUTH YourStrongPasswordHere
   > ping
   # Should respond with PONG
   ```

### Option B: Use a managed Redis service

#### AWS ElastiCache

1. Go to AWS Management Console and navigate to ElastiCache
2. Create a new Redis cluster:
   - Choose Redis as the engine
   - Select Redis version 6.0 or higher
   - Configure node type based on expected load (start with cache.t3.small for moderate loads)
   - Configure VPC settings to place Redis in a private subnet
   - Enable encryption in transit and at rest
   - Set parameter group with production-optimized settings
   - Enable automatic backups

#### Azure Cache for Redis

1. Go to Azure Portal and search for "Azure Cache for Redis"
2. Create a new Redis cache:
   - Choose the appropriate tier (Standard or Premium for production)
   - Select your region
   - Configure virtual network settings
   - Enable non-TLS port only if necessary
   - Set memory policies appropriate for rate limiting

#### Upstash (Serverless Redis)

1. Sign up for an account at upstash.com
2. Create a new Redis database:
   - Select the closest region to your application
   - Choose TLS encryption
   - Configure access control with strong passwords
   - Note the connection string provided

## 2. Configure Firewall Rules for Redis Access

### Server Firewall (if self-hosting)

```bash
# Allow Redis port only from application servers
sudo ufw allow from your-app-server-ip to any port 6379
```

For multiple application servers:
```bash
# Create a dedicated Redis security group
sudo ufw allow from 10.0.0.0/24 to any port 6379
```

### Cloud Provider Firewall (AWS Security Groups, Azure Network Security Groups)

1. Create a dedicated security group for Redis
2. Allow inbound traffic on port 6379 only from application servers/security groups
3. Deny all other inbound traffic to Redis port
4. Configure outbound rules as needed

### Application Server Configuration

If your application servers are behind a reverse proxy:

1. Configure the proxy to forward Redis traffic from application servers
2. Ensure TLS termination if using encryption

### Within docker-compose (if using containers)

```yaml
services:
  redis:
    image: redis:6
    command: redis-server --requirepass ${REDIS_PASSWORD}
    networks:
      - backend
    volumes:
      - redis-data:/data
    deploy:
      resources:
        limits:
          memory: 2G
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 5s
      timeout: 5s
      retries: 3

  app:
    # Your application config
    environment:
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    networks:
      - backend
      - frontend

networks:
  backend:
    internal: true  # This network is not exposed outside
  frontend:
    # Configuration for external access
```

## 3. Implement Redis Metrics Collection

### Option A: Redis Exporter with Prometheus and Grafana

1. **Install Redis Exporter**:
   ```bash
   # Download and run Redis exporter
   wget https://github.com/oliver006/redis_exporter/releases/download/v1.45.0/redis_exporter-v1.45.0.linux-amd64.tar.gz
   tar xzf redis_exporter-v1.45.0.linux-amd64.tar.gz
   cd redis_exporter-v1.45.0.linux-amd64
   
   # Run with your Redis details
   ./redis_exporter -redis.addr=redis://your-redis-host:6379 -redis.password=YourStrongPasswordHere
   ```

2. **Configure Prometheus** (prometheus.yml):
   ```yaml
   scrape_configs:
     - job_name: 'redis'
       static_configs:
         - targets: ['redis-exporter:9121']
   ```

3. **Setup Grafana Dashboard**:
   - Import the Redis dashboard (ID: 763) from Grafana marketplace
   - Connect to your Prometheus data source
   - Customize alerts for critical metrics

### Option B: CloudWatch Integration (for AWS)

If using AWS ElastiCache:

1. Ensure your ElastiCache instance has enhanced monitoring enabled
2. Create CloudWatch alarms for key metrics:
   - CPUUtilization > 80%
   - DatabaseMemoryUsagePercentage > 80%
   - CurrConnections (threshold based on application needs)
   - ReplicationLag (if using replicas)

### Option C: Custom Metrics Collection in Application

Add the following to your application code:

```typescript
// src/lib/redis/redis-metrics.ts
import redisClient from './redis-client';

export async function collectRedisMetrics() {
  try {
    // Get Redis INFO
    const info = await redisClient.info();
    
    // Parse metrics from INFO command
    const metrics = parseRedisInfo(info);
    
    // Additional rate limiting specific metrics
    const rateLimitKeys = await redisClient.keys('vibewell:ratelimit:*');
    metrics.rateLimitKeysCount = rateLimitKeys.length;
    
    // Store or report metrics (to your monitoring system)
    await storeMetrics(metrics);
    
    return metrics;
  } catch (error) {
    console.error('Failed to collect Redis metrics:', error);
    return null;
  }
}

function parseRedisInfo(info: string) {
  // Parse Redis INFO output into structured metrics
  const metrics: Record<string, any> = {};
  const sections = info.split('#');
  
  for (const section of sections) {
    const lines = section.split('\r\n').filter(Boolean);
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key && value) {
          metrics[key.trim()] = value.trim();
        }
      }
    }
  }
  
  return {
    usedMemory: parseInt(metrics.used_memory || '0', 10),
    connectedClients: parseInt(metrics.connected_clients || '0', 10),
    commandsProcessed: parseInt(metrics.total_commands_processed || '0', 10),
    keyspaceHits: parseInt(metrics.keyspace_hits || '0', 10),
    keyspaceMisses: parseInt(metrics.keyspace_misses || '0', 10),
    hitRate: calculateHitRate(metrics),
    uptime: parseInt(metrics.uptime_in_seconds || '0', 10),
  };
}

function calculateHitRate(metrics: Record<string, string>) {
  const hits = parseInt(metrics.keyspace_hits || '0', 10);
  const misses = parseInt(metrics.keyspace_misses || '0', 10);
  const total = hits + misses;
  return total > 0 ? hits / total : 0;
}

async function storeMetrics(metrics: any) {
  // Implementation depends on your monitoring system
  // Options:
  // 1. Send to a time-series database
  // 2. Log to application monitoring
  // 3. Store in Redis itself for internal dashboards
}
```

### Implement Cron Job for Regular Collection

Create a cron job to collect metrics at regular intervals:

```typescript
// src/cron/redis-metrics-job.ts
import { CronJob } from 'cron';
import { collectRedisMetrics } from '../lib/redis/redis-metrics';

// Collect metrics every 5 minutes
const job = new CronJob('*/5 * * * *', async function() {
  console.log('Collecting Redis metrics...');
  const metrics = await collectRedisMetrics();
  console.log('Redis metrics collected:', metrics ? 'success' : 'failed');
});

export function startRedisMetricsCollection() {
  job.start();
  console.log('Redis metrics collection scheduled');
}
```

## 4. Configure Vibewell Environment for Production Redis

Update your production `.env` file with the correct Redis configuration:

```
# Redis Configuration
REDIS_ENABLED=true
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=YourStrongPasswordHere
REDIS_TLS=true
REDIS_TIMEOUT=5000
REDIS_MAX_RECONNECT_ATTEMPTS=10

# Rate Limiting Configuration
RATE_LIMIT_GENERAL=120,60
RATE_LIMIT_AUTH=30,60
RATE_LIMIT_SENSITIVE=10,60
RATE_LIMIT_ADMIN=300,60
RATE_LIMIT_MFA=5,60
RATE_LIMIT_FINANCIAL=20,60
```

## 5. Verifying Your Redis Deployment

Run the following checks to ensure Redis is properly configured:

1. **Connection Test**:
   ```bash
   redis-cli -h your-redis-host -p 6379 -a YourStrongPasswordHere ping
   ```

2. **Performance Test**:
   ```bash
   redis-benchmark -h your-redis-host -p 6379 -a YourStrongPasswordHere -t set,get -n 10000 -q
   ```

3. **Persistence Test**:
   ```bash
   # Set a key
   redis-cli -h your-redis-host -p 6379 -a YourStrongPasswordHere set test:persistence "value"
   
   # Restart Redis
   sudo systemctl restart redis-server
   
   # Check if key exists after restart
   redis-cli -h your-redis-host -p 6379 -a YourStrongPasswordHere get test:persistence
   ```

## 6. Backup and Recovery Plan

### Automated Backups

For self-hosted Redis:

```bash
# Create a backup script (redis-backup.sh)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/path/to/redis/backups
mkdir -p $BACKUP_DIR

# Save RDB file
redis-cli -h your-redis-host -p 6379 -a YourStrongPasswordHere SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_backup_$TIMESTAMP.rdb

# Archive backups older than 30 days
find $BACKUP_DIR -name "redis_backup_*.rdb" -mtime +30 -exec gzip {} \;
```

Schedule with cron:
```
0 2 * * * /path/to/redis-backup.sh
```

### Disaster Recovery

Document recovery procedures:

1. **Basic Recovery**:
   ```bash
   # Stop Redis
   sudo systemctl stop redis-server
   
   # Replace RDB file
   sudo cp /path/to/backup/redis_backup_TIMESTAMP.rdb /var/lib/redis/dump.rdb
   sudo chown redis:redis /var/lib/redis/dump.rdb
   
   # Start Redis
   sudo systemctl start redis-server
   ```

2. **Full Server Recovery**:
   - Provision new Redis instance
   - Configure as per production settings
   - Restore from backups
   - Update application environment variables

## 7. Scaling Considerations

### Vertical Scaling

- Increase memory allocation
- Upgrade to more powerful CPU
- Add more CPU cores if CPU-bound

### Horizontal Scaling

- Implement Redis Sentinel for high availability
- Configure Redis Cluster for sharding
- Set up read replicas for read-heavy workloads

---

By following this guide, you will have a fully functional Redis deployment for your production environment, with proper security, monitoring, and backup procedures in place. 