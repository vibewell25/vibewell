#!/bin/bash

# Redis Health and Configuration Check Script
# This script checks Redis health, configuration, and provides troubleshooting information

# Read Redis password from environment
REDIS_PASSWORD=${REDIS_PASSWORD:-$(grep REDIS_PASSWORD .env.production | cut -d "=" -f2)}
REDIS_HOST=${REDIS_HOST:-"redis"}
REDIS_PORT=${REDIS_PORT:-6379}

# Check Redis connection
check_connection() {
  echo "Checking Redis connection..."
  if redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" ping | grep -q "PONG"; then
    echo "✅ Redis connection successful"
    return 0
  else
    echo "❌ Redis connection failed"
    return 1
  fi
}

# Check Redis memory usage
check_memory() {
  echo -e "\nChecking Redis memory usage..."
  redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO memory | grep -E "used_memory_human|maxmemory_human|maxmemory_policy"
  
  # Calculate memory usage percentage
  USED_MEMORY=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO memory | grep used_memory: | cut -d ":" -f2)
  MAX_MEMORY=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO memory | grep maxmemory: | cut -d ":" -f2)
  
  if [[ "${MAX_MEMORY}" -gt 0 ]]; then
    PERCENTAGE=$((USED_MEMORY * 100 / MAX_MEMORY))
    echo "Memory usage: ${PERCENTAGE}%"
    
    if [[ ${PERCENTAGE} -gt 80 ]]; then
      echo "⚠️ Warning: Redis memory usage is high (${PERCENTAGE}%)"
    else
      echo "✅ Memory usage is normal"
    fi
  else
    echo "⚠️ Warning: Redis maxmemory is not set"
  fi
}

# Check persistence configuration
check_persistence() {
  echo -e "\nChecking Redis persistence..."
  redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" CONFIG GET "save" | grep -v "save"
  
  # Check RDB and AOF status
  RDB_STATUS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO persistence | grep rdb_last_save_time)
  AOF_STATUS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO persistence | grep aof_enabled)
  
  echo "${RDB_STATUS}"
  echo "${AOF_STATUS}"
  
  if [[ "${AOF_STATUS}" == *"0"* ]]; then
    echo "⚠️ Warning: AOF is disabled. Rate limiting data may be lost on restart."
  else
    echo "✅ AOF is enabled"
  fi
}

# Check client connections
check_clients() {
  echo -e "\nChecking client connections..."
  redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO clients | grep -E "connected_clients|blocked_clients|maxclients"
  
  # Get number of clients
  CLIENTS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO clients | grep connected_clients | cut -d ":" -f2)
  MAX_CLIENTS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO clients | grep maxclients | cut -d ":" -f2)
  
  if [[ ${CLIENTS} -gt $((MAX_CLIENTS * 70 / 100)) ]]; then
    echo "⚠️ Warning: High number of client connections"
  else
    echo "✅ Client connections are normal"
  fi
}

# Check rate limiting keys
check_rate_limiting() {
  echo -e "\nChecking rate limiting data..."
  RATE_LIMIT_KEYS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" KEYS "ratelimit:*" | wc -l)
  echo "Rate limiting keys: ${RATE_LIMIT_KEYS}"
  
  # Show some sample rate limit keys if any exist
  if [[ ${RATE_LIMIT_KEYS} -gt 0 ]]; then
    echo "Sample rate limit keys:"
    redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" KEYS "ratelimit:*" | head -5
  fi
  
  # Check blocked IPs
  BLOCKED_IPS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" KEYS "ratelimit:blocked:*" | wc -l)
  echo "Blocked IPs: ${BLOCKED_IPS}"
  
  # Show suspicious IPs if any exist
  SUSPICIOUS_IPS=$(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" KEYS "ratelimit:suspicious:*" | wc -l)
  echo "Suspicious IPs: ${SUSPICIOUS_IPS}"
  
  if [[ ${SUSPICIOUS_IPS} -gt 0 ]]; then
    echo "Recent suspicious IPs:"
    redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" KEYS "ratelimit:suspicious:*" | head -5
  fi
}

# Check Redis version
check_version() {
  echo -e "\nChecking Redis version..."
  redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" INFO server | grep redis_version
}

# Main function
main() {
  echo "============================================"
  echo "Redis Health and Configuration Check"
  echo "============================================"
  
  # Check connection
  if ! check_connection; then
    echo "🔍 Troubleshooting:"
    echo "1. Check if Redis is running: docker ps | grep redis"
    echo "2. Verify Redis password in .env.production"
    echo "3. Check Redis logs: docker logs <redis_container_id>"
    echo "4. Confirm Redis container can be reached: ping ${REDIS_HOST}"
    exit 1
  fi
  
  # Run all checks
  check_version
  check_memory
  check_persistence
  check_clients
  check_rate_limiting
  
  echo -e "\n============================================"
  echo "Check completed"
  echo "============================================"
}

# Run main function
main 