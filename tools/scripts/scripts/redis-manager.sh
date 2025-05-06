#!/bin/bash

# Redis Manager Script for VibeWell
# Manages Redis slave operations and RDB backups

set -e

# Default values
REDIS_CLI="redis-cli"
REDIS_CONF_DIR="/Users/mb/Desktop/vibewell"
REDIS_DATA_DIR="/data"
BACKUP_DIR="/backup"
LOG_FILE="/var/log/redis-manager.log"

# Load environment variables
if [ -f "$REDIS_CONF_DIR/.env" ]; then
    source "$REDIS_CONF_DIR/.env"
fi

# Ensure required environment variables are set
: "${REDIS_MASTER_HOST:=localhost}"
: "${REDIS_MASTER_PORT:=6379}"
: "${REDIS_SLAVE_PORT:=6380}"
: "${REDIS_PASSWORD:?REDIS_PASSWORD must be set}"
: "${REDIS_MASTER_PASSWORD:?REDIS_MASTER_PASSWORD must be set}"

# Helper function for logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Helper function for Redis CLI commands
redis_cmd() {
    $REDIS_CLI -h "$REDIS_MASTER_HOST" -p "$1" -a "$REDIS_PASSWORD" "$2"
}

# Start Redis slave
start_slave() {
    log "Starting Redis slave..."
    redis-server "$REDIS_CONF_DIR/redis-slave.conf" || {
        log "Failed to start Redis slave"
        exit 1
    }
    log "Redis slave started successfully"
}

# Stop Redis slave
stop_slave() {
    log "Stopping Redis slave..."
    redis_cmd "$REDIS_SLAVE_PORT" shutdown || {
        log "Failed to stop Redis slave"
        exit 1
    }
    log "Redis slave stopped successfully"
}

# Create RDB backup
create_rdb_backup() {
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/dump_$timestamp.rdb"
    
    log "Creating RDB backup..."
    
    # Trigger BGSAVE on master
    redis_cmd "$REDIS_MASTER_PORT" BGSAVE || {
        log "Failed to trigger BGSAVE"
        exit 1
    }
    
    # Wait for BGSAVE to complete
    while true; do
        if redis_cmd "$REDIS_MASTER_PORT" INFO persistence | grep -q "rdb_bgsave_in_progress:0"; then
            break
        fi
        sleep 1
    done
    
    # Copy RDB file to backup directory
    cp "$REDIS_DATA_DIR/dump.rdb" "$backup_file" || {
        log "Failed to copy RDB file to backup directory"
        exit 1
    }
    
    log "RDB backup created successfully: $backup_file"
}

# Restore RDB backup
restore_rdb_backup() {
    if [ -z "$1" ]; then
        log "Error: Backup file not specified"
        exit 1
    fi
    
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        log "Error: Backup file not found: $backup_file"
        exit 1
    }
    
    log "Restoring RDB backup from $backup_file..."
    
    # Stop Redis slave
    stop_slave
    
    # Copy backup file to data directory
    cp "$backup_file" "$REDIS_DATA_DIR/dump.rdb" || {
        log "Failed to copy backup file to data directory"
        exit 1
    }
    
    # Start Redis slave
    start_slave
    
    log "RDB backup restored successfully"
}

# Check slave status
check_slave_status() {
    log "Checking slave status..."
    redis_cmd "$REDIS_SLAVE_PORT" INFO replication || {
        log "Failed to get slave status"
        exit 1
    }
}

# Promote slave to master
promote_slave() {
    log "Promoting slave to master..."
    redis_cmd "$REDIS_SLAVE_PORT" SLAVEOF NO ONE || {
        log "Failed to promote slave to master"
        exit 1
    }
    log "Slave promoted to master successfully"
}

# Main script logic
case "$1" in
    start)
        start_slave
        ;;
    stop)
        stop_slave
        ;;
    restart)
        stop_slave
        sleep 2
        start_slave
        ;;
    backup)
        create_rdb_backup
        ;;
    restore)
        if [ -z "$2" ]; then
            log "Error: Please specify backup file to restore"
            exit 1
        fi
        restore_rdb_backup "$2"
        ;;
    status)
        check_slave_status
        ;;
    promote)
        promote_slave
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|backup|restore <file>|status|promote}"
        exit 1
        ;;
esac

exit 0 