# Redis Production Setup for Vibewell

This document provides detailed instructions for setting up, configuring, and maintaining Redis in a production environment for the Vibewell application. Redis is used primarily for rate limiting and caching to enhance security and performance.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Security](#security)
5. [Persistence](#persistence)
6. [Monitoring](#monitoring)
7. [Maintenance](#maintenance)
8. [Rate Limiting Configuration](#rate-limiting-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Useful Commands](#useful-commands)

## Prerequisites

Before setting up Redis in production, ensure you have:

- A Linux server (Ubuntu/Debian recommended)
- Root or sudo access
- Firewall access to configure security rules
- At least 2GB RAM available
- At least 10GB disk space for data and logs

## Installation

### Using Package Manager (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install redis-server
```

### Using Source Compilation

```bash
# Download Redis
curl -O http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable

# Compile
make

# Install binaries
sudo make install

# Create directories
sudo mkdir -p /etc/redis
sudo mkdir -p /var/redis/6379
```

Copy the provided production configuration:

```bash
sudo cp redis-production.conf /etc/redis/6379.conf
```

## Configuration

Edit the main Redis configuration file:

```bash
sudo nano /etc/redis/6379.conf
```

### Essential Configuration Options

```
# Network
bind 127.0.0.1  # Change to your server's private IP if needed
port 6379
protected-mode yes
tcp-backlog 511
timeout 0
tcp-keepalive 300

# General
daemonize yes
supervised systemd  # Use 'no' if not using systemd
pidfile /var/run/redis_6379.pid
loglevel notice
logfile /var/log/redis_6379.log

# Memory and Performance
maxmemory 256mb  # Adjust based on available RAM
maxmemory-policy allkeys-lru  # Best for rate limiting
```

### Creating Systemd Service

Create a systemd service file to manage Redis:

```bash
sudo nano /etc/systemd/system/redis_6379.service
```

Add the following content:

```
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/6379.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable redis_6379
sudo systemctl start redis_6379
```

## Security

### Firewall Configuration

Configure the firewall to only allow Redis connections from your application servers:

```bash
# Using ufw (Ubuntu)
sudo ufw allow from your-app-server-ip to any port 6379

# Using iptables
sudo iptables -A INPUT -p tcp -s your-app-server-ip --dport 6379 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 6379 -j DROP
```

### Password Authentication

Enable password protection by editing the Redis configuration:

```bash
sudo nano /etc/redis/6379.conf
```

Uncomment and set a strong password:

```
requirepass YourStrongPasswordHere
```

Update environment variables in your application:

```
REDIS_URL=redis://:YourStrongPasswordHere@localhost:6379
```

### Disable Commands

Disable dangerous commands in production:

```
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

## Persistence

Redis offers two persistence options:

### RDB Snapshots

Configure periodic snapshots:

```
save 900 1      # Save after 900 seconds if at least 1 change
save 300 10     # Save after 300 seconds if at least 10 changes
save 60 10000   # Save after 60 seconds if at least 10000 changes
```

### AOF (Append-Only File)

Enable AOF for better durability:

```
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

## Monitoring

### Redis CLI Monitoring

Basic monitoring using redis-cli:

```bash
# Check Redis info
redis-cli -a YourPassword info

# Monitor real-time commands
redis-cli -a YourPassword monitor

# Check memory usage
redis-cli -a YourPassword info memory
```

### Prometheus & Grafana Setup

1. Install the Redis Prometheus exporter:

```bash
# Download and extract
wget https://github.com/oliver006/redis_exporter/releases/download/v1.31.4/redis_exporter-v1.31.4.linux-amd64.tar.gz
tar xvzf redis_exporter-v1.31.4.linux-amd64.tar.gz

# Run the exporter
./redis_exporter -redis.addr redis://localhost:6379 -redis.password YourPassword
```

2. Configure Prometheus to scrape Redis metrics:

```yaml
scrape_configs:
  - job_name: redis
    static_configs:
      - targets: ['localhost:9121']
```

3. Import the Redis dashboard into Grafana (Dashboard ID: 763)

### RedisInsight

For visual monitoring and management, install RedisInsight:

1. Download from [RedisInsight](https://redis.com/redis-enterprise/redis-insight/)
2. Connect to your Redis instance using your server details and password

## Maintenance

### Regular Backups

Set up automated backups:

```bash
# Create backup script
cat > /etc/cron.daily/redis-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/redis"
DATETIME=$(date +"%Y%m%d-%H%M%S")
mkdir -p $BACKUP_DIR
redis-cli -a YourPassword SAVE
cp /var/redis/6379/dump.rdb $BACKUP_DIR/dump-$DATETIME.rdb
find $BACKUP_DIR -name "dump-*.rdb" -mtime +7 -delete
EOF

# Make executable
chmod +x /etc/cron.daily/redis-backup.sh
```

### Software Updates

Regularly update Redis:

```bash
# For package-based installation
sudo apt update
sudo apt upgrade redis-server

# For source-based installation
cd /path/to/redis-stable
git pull
make
sudo make install
sudo systemctl restart redis_6379
```

## Rate Limiting Configuration

For optimal rate limiting performance:

1. Configure maxmemory and policy:

```
maxmemory 256mb  # Adjust based on your needs
maxmemory-policy allkeys-lru
```

2. Update Vibewell environment variables:

```
REDIS_ENABLED=true
REDIS_URL=redis://:YourPassword@redis-server-ip:6379
REDIS_TLS=false  # Set to true if using TLS
REDIS_TIMEOUT=5000
DEFAULT_RATE_LIMIT_MAX=100
DEFAULT_RATE_LIMIT_WINDOW=60
```

## Troubleshooting

### Common Issues

1. **Connection refused**:
   - Check if Redis is running: `sudo systemctl status redis_6379`
   - Verify firewall rules: `sudo ufw status`

2. **Authentication failed**:
   - Check the password in both Redis config and application env variables
   - Reset Redis password if needed: `redis-cli -a OldPassword CONFIG SET requirepass NewPassword`

3. **High memory usage**:
   - Review `maxmemory` setting
   - Check for memory leaks: `redis-cli -a YourPassword memory doctor`

4. **Slow performance**:
   - Run a latency check: `redis-cli -a YourPassword --latency`
   - Check for slow commands: `redis-cli -a YourPassword slowlog get 10`

### Redis Logs

Check logs for errors:

```bash
sudo tail -f /var/log/redis_6379.log
```

## Useful Commands

### Basic Operations

```bash
# Connect to Redis
redis-cli -a YourPassword

# Test connection
ping

# Check server stats
info

# Check rate limit keys
keys ratelimit*

# Monitor key expiration
info keyspace

# Clear specific keys
del ratelimit:key:name
```

### Performance Testing

```bash
# Benchmark Redis performance
redis-benchmark -h localhost -p 6379 -a YourPassword -t set,get -n 100000

# Test rate limiting under load
./scripts/run-redis-load-test.sh
```

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Redis Security](https://redis.io/topics/security)
- [Redis Admin](https://redis.io/topics/admin)
- [Redis Persistence](https://redis.io/topics/persistence)
- [Vibewell Rate Limiting Documentation](./rate-limiting.md)

## Conclusion

Following this guide will help you set up a secure, monitored, and optimized Redis instance for the Vibewell application. For specific questions or issues, contact the Vibewell DevOps team. 