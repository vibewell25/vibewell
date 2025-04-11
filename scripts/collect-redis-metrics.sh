#!/bin/bash

# Redis Metrics Collection Script

# Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
METRICS_FILE="/var/log/redis/metrics.log"
ALERT_THRESHOLD=80

# Function to collect metrics
collect_metrics() {
    # Get Redis INFO
    redis_info=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD info)
    
    # Extract key metrics
    used_memory=$(echo "$redis_info" | grep "used_memory:" | cut -d: -f2)
    total_memory=$(echo "$redis_info" | grep "maxmemory:" | cut -d: -f2)
    connected_clients=$(echo "$redis_info" | grep "connected_clients:" | cut -d: -f2)
    total_commands=$(echo "$redis_info" | grep "total_commands_processed:" | cut -d: -f2)
    keyspace_hits=$(echo "$redis_info" | grep "keyspace_hits:" | cut -d: -f2)
    keyspace_misses=$(echo "$redis_info" | grep "keyspace_misses:" | cut -d: -f2)
    
    # Calculate memory usage percentage
    if [ "$total_memory" -gt 0 ]; then
        memory_usage=$((used_memory * 100 / total_memory))
    else
        memory_usage=0
    fi
    
    # Calculate hit rate
    total_operations=$((keyspace_hits + keyspace_misses))
    if [ "$total_operations" -gt 0 ]; then
        hit_rate=$((keyspace_hits * 100 / total_operations))
    else
        hit_rate=0
    fi
    
    # Log metrics
    timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "$timestamp - Memory Usage: $memory_usage%, Connected Clients: $connected_clients, Hit Rate: $hit_rate%, Total Commands: $total_commands" >> $METRICS_FILE
    
    # Check for alerts
    if [ "$memory_usage" -gt $ALERT_THRESHOLD ]; then
        echo "ALERT: High memory usage detected - $memory_usage%" >> $METRICS_FILE
    fi
}

# Main loop
while true; do
    collect_metrics
    sleep 60
done 