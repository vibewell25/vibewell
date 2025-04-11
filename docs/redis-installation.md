# Installing Redis for Rate Limiting

This guide explains how to install and configure Redis, which is required for production-grade rate limiting in the Vibewell application.

## macOS Installation

Using Homebrew:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Redis
brew install redis

# Start Redis
brew services start redis

# Verify installation
redis-cli ping
# Should respond with "PONG"
```

## Linux Installation

### Ubuntu/Debian

```bash
# Update package lists
sudo apt update

# Install Redis
sudo apt install redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Start Redis
sudo systemctl start redis-server

# Verify installation
redis-cli ping
# Should respond with "PONG"
```

### CentOS/RHEL

```bash
# Install Redis
sudo yum install redis

# Enable Redis to start on boot
sudo systemctl enable redis

# Start Redis
sudo systemctl start redis

# Verify installation
redis-cli ping
# Should respond with "PONG"
```

## Windows Installation

Redis is not officially supported on Windows, but you can:

1. Use WSL (Windows Subsystem for Linux) and install Redis following the Linux instructions
2. Use Docker (see Docker installation below)
3. Use the unofficial Windows port from [https://github.com/microsoftarchive/redis](https://github.com/microsoftarchive/redis)

## Docker Installation

Using Docker (works on all platforms):

```bash
# Pull the Redis image
docker pull redis

# Run Redis in a container
docker run --name redis -p 6379:6379 -d redis

# Verify installation
docker exec -it redis redis-cli ping
# Should respond with "PONG"
```

## Configuration for Production

For production use, you should secure Redis:

1. **Edit Redis configuration file**:
   
   On Linux/macOS, the file is typically located at `/etc/redis/redis.conf` or `/usr/local/etc/redis.conf`.

   Key configuration changes:
   ```
   # Bind to localhost only
   bind 127.0.0.1 ::1
   
   # Enable password authentication
   requirepass YOUR_STRONG_PASSWORD
   
   # Disable potentially dangerous commands
   rename-command FLUSHALL ""
   rename-command FLUSHDB ""
   rename-command CONFIG ""
   ```

2. **Restart Redis**:
   ```bash
   # macOS
   brew services restart redis
   
   # Linux
   sudo systemctl restart redis-server
   ```

## Configuring the Application for Redis

Update your `.env.local` file with the Redis connection details:

```
NODE_ENV=production
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=YOUR_STRONG_PASSWORD
REDIS_ENABLED=true
```

If you're using a password:

```
REDIS_URL=redis://:YOUR_STRONG_PASSWORD@localhost:6379
```

## Troubleshooting

If you encounter issues:

1. **Connection refused**:
   - Ensure Redis is running: `redis-cli ping`
   - Check the binding IP in redis.conf
   - Verify firewall settings

2. **Authentication failed**:
   - Check the password in your .env file
   - Verify the Redis configuration

3. **Memory allocation error**:
   - Adjust the maxmemory setting in redis.conf
   - Consider enabling maxmemory-policy for eviction

## Monitoring Redis

To monitor Redis during load tests:

```bash
# Check Redis info
redis-cli info

# Monitor memory usage
redis-cli info memory

# Watch commands in real-time
redis-cli monitor

# View client connections
redis-cli client list
```

## Next Steps

After installing Redis, you can run the load tests in production mode:

```bash
# Make the script executable
chmod +x scripts/load-testing.sh

# Run the load tests with Redis enabled
NODE_ENV=production ./scripts/load-testing.sh
```

This will use Redis for rate limiting, providing a distributed solution that works across multiple application instances. 