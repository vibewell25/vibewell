#!/bin/bash

# TLS Manager Script for VibeWell
# Manages TLS certificates and multi-port configuration

set -e

# Default values
REDIS_CONF_DIR="/Users/mb/Desktop/vibewell"
CERTS_DIR="/etc/redis/certs"
DAYS_VALID=365
KEY_SIZE=2048
LOG_FILE="/var/log/tls-manager.log"

# Load environment variables
if [ -f "$REDIS_CONF_DIR/.env" ]; then
    source "$REDIS_CONF_DIR/.env"
fi

# Helper function for logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create directory structure
create_dirs() {
    log "Creating directory structure..."
    mkdir -p "$CERTS_DIR"
    chmod 700 "$CERTS_DIR"
}

# Generate CA certificate
generate_ca() {
    log "Generating CA certificate..."
    
    openssl req -x509 -new -nodes \
        -sha256 \
        -days "$DAYS_VALID" \
        -newkey rsa:"$KEY_SIZE" \
        -keyout "$CERTS_DIR/ca.key" \
        -out "$CERTS_DIR/ca.crt" \
        -subj "/C=US/ST=CA/L=San Francisco/O=VibeWell/CN=VibeWell CA" || {
        log "Failed to generate CA certificate"
        exit 1
    }
    
    chmod 400 "$CERTS_DIR/ca.key"
    chmod 444 "$CERTS_DIR/ca.crt"
    
    log "CA certificate generated successfully"
}

# Generate server certificate
generate_server_cert() {
    local name="$1"
    local cn="$2"
    
    log "Generating server certificate for $name..."
    
    # Generate private key
    openssl genrsa -out "$CERTS_DIR/$name.key" "$KEY_SIZE" || {
        log "Failed to generate private key"
        exit 1
    }
    chmod 400 "$CERTS_DIR/$name.key"
    
    # Generate CSR
    openssl req -new -key "$CERTS_DIR/$name.key" \
        -out "$CERTS_DIR/$name.csr" \
        -subj "/C=US/ST=CA/L=San Francisco/O=VibeWell/CN=$cn" || {
        log "Failed to generate CSR"
        exit 1
    }
    
    # Create config file for SAN
    cat > "$CERTS_DIR/$name.cnf" << EOF
[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $cn
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF
    
    # Sign the certificate
    openssl x509 -req \
        -in "$CERTS_DIR/$name.csr" \
        -CA "$CERTS_DIR/ca.crt" \
        -CAkey "$CERTS_DIR/ca.key" \
        -CAcreateserial \
        -out "$CERTS_DIR/$name.crt" \
        -days "$DAYS_VALID" \
        -sha256 \
        -extfile "$CERTS_DIR/$name.cnf" \
        -extensions v3_req || {
        log "Failed to sign certificate"
        exit 1
    }
    
    chmod 444 "$CERTS_DIR/$name.crt"
    
    # Clean up
    rm "$CERTS_DIR/$name.csr" "$CERTS_DIR/$name.cnf"
    
    log "Server certificate for $name generated successfully"
}

# Verify certificate
verify_cert() {
    local name="$1"
    
    log "Verifying certificate for $name..."
    
    openssl verify -CAfile "$CERTS_DIR/ca.crt" "$CERTS_DIR/$name.crt" || {
        log "Certificate verification failed"
        exit 1
    }
    
    log "Certificate verification successful"
}

# Check certificate expiration
check_expiration() {
    local name="$1"
    local cert="$CERTS_DIR/$name.crt"
    
    if [ ! -f "$cert" ]; then
        log "Certificate not found: $cert"
        return 1
    }
    
    log "Checking expiration for $name certificate..."
    
    local end_date
    end_date=$(openssl x509 -enddate -noout -in "$cert" | cut -d= -f2)
    local end_epoch
    end_epoch=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$end_date" "+%s")
    local now_epoch
    now_epoch=$(date "+%s")
    local days_left
    days_left=$(( (end_epoch - now_epoch) / 86400 ))
    
    if [ "$days_left" -lt 30 ]; then
        log "WARNING: Certificate for $name will expire in $days_left days"
        return 1
    else
        log "Certificate for $name will expire in $days_left days"
        return 0
    fi
}

# Update Redis configuration
update_redis_config() {
    log "Updating Redis configuration..."
    
    # Backup existing configuration
    if [ -f "$REDIS_CONF_DIR/redis-tls.conf" ]; then
        cp "$REDIS_CONF_DIR/redis-tls.conf" "$REDIS_CONF_DIR/redis-tls.conf.bak"
    fi
    
    # Update certificate paths
    sed -i '' "s|tls-cert-file .*|tls-cert-file $CERTS_DIR/redis.crt|" "$REDIS_CONF_DIR/redis-tls.conf"
    sed -i '' "s|tls-key-file .*|tls-key-file $CERTS_DIR/redis.key|" "$REDIS_CONF_DIR/redis-tls.conf"
    sed -i '' "s|tls-ca-cert-file .*|tls-ca-cert-file $CERTS_DIR/ca.crt|" "$REDIS_CONF_DIR/redis-tls.conf"
    
    log "Redis configuration updated successfully"
}

# Main script logic
case "$1" in
    init)
        create_dirs
        generate_ca
        generate_server_cert "redis" "redis.vibewell.com"
        verify_cert "redis"
        update_redis_config
        ;;
    renew)
        if [ -z "$2" ]; then
            log "Error: Please specify certificate name to renew"
            exit 1
        fi
        generate_server_cert "$2" "$2.vibewell.com"
        verify_cert "$2"
        update_redis_config
        ;;
    check)
        if [ -z "$2" ]; then
            for cert in ca redis; do
                check_expiration "$cert"
            done
        else
            check_expiration "$2"
        fi
        ;;
    verify)
        if [ -z "$2" ]; then
            for cert in redis; do
                verify_cert "$cert"
            done
        else
            verify_cert "$2"
        fi
        ;;
    *)
        echo "Usage: $0 {init|renew <name>|check [name]|verify [name]}"
        exit 1
        ;;
esac

exit 0 