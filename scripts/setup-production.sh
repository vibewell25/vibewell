#!/bin/bash

# Vibewell Production Environment Setup Script
# This script automates the setup of the production environment for Vibewell.
# It configures required services, security settings, and environment variables.

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display colored log messages
log() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running with sudo/root permissions
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root or with sudo"
   exit 1
fi

# Function to check and install required system dependencies
install_dependencies() {
  log "Checking and installing system dependencies..."
  
  apt-get update
  apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    redis-server
  
  log_success "System dependencies installed successfully"
}

# Setup Docker if needed
setup_docker() {
  log "Setting up Docker..."
  
  # Check if Docker is already installed
  if command -v docker &> /dev/null; then
    log_warning "Docker is already installed, skipping installation"
  else
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Setup Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    log_success "Docker installed successfully"
  fi
}

# Configure Nginx
configure_nginx() {
  log "Configuring Nginx..."
  
  # Create Nginx config file
  cat > /etc/nginx/sites-available/vibewell << 'EOF'
server {
    listen 80;
    server_name app.vibewell.example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://*.cloudfront.net; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self' https://api.vibewell.example.com; frame-ancestors 'none'; form-action 'self';";
    }
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;
    
    # API proxy with rate limiting
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "DENY";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
    }
    
    # Logs
    access_log /var/log/nginx/vibewell_access.log;
    error_log /var/log/nginx/vibewell_error.log;
}
EOF

  # Enable the site
  ln -sf /etc/nginx/sites-available/vibewell /etc/nginx/sites-enabled/
  
  # Test Nginx config
  nginx -t
  
  # Restart Nginx
  systemctl restart nginx
  
  log_success "Nginx configured successfully"
}

# Set up Redis for rate limiting
configure_redis() {
  log "Configuring Redis for rate limiting..."
  
  # Backup original Redis configuration
  cp /etc/redis/redis.conf /etc/redis/redis.conf.bak
  
  # Update Redis configuration
  cat > /etc/redis/redis.conf << 'EOF'
# Redis configuration for Vibewell production
bind 127.0.0.1
port 6379
daemonize yes
supervised systemd
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
# Security
requirepass ${REDIS_PASSWORD}
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command DEBUG ""
EOF

  # Create Redis password if not already set
  if [ -z "$REDIS_PASSWORD" ]; then
    REDIS_PASSWORD=$(openssl rand -base64 32)
    echo "export REDIS_PASSWORD=\"$REDIS_PASSWORD\"" >> /etc/environment
    log "Generated Redis password and added to environment"
  fi
  
  # Replace password placeholder
  sed -i "s/\${REDIS_PASSWORD}/$REDIS_PASSWORD/g" /etc/redis/redis.conf
  
  # Restart Redis
  systemctl restart redis-server
  
  log_success "Redis configured successfully with password protection"
}

# Set up firewall rules
configure_firewall() {
  log "Configuring firewall rules..."
  
  # Allow SSH, HTTP, and HTTPS
  ufw allow ssh
  ufw allow http
  ufw allow https
  
  # Deny all other incoming traffic
  ufw default deny incoming
  
  # Allow all outgoing traffic
  ufw default allow outgoing
  
  # Enable firewall
  echo "y" | ufw enable
  
  log_success "Firewall configured successfully"
}

# Set up SSL with Let's Encrypt
setup_ssl() {
  log "Setting up SSL with Let's Encrypt..."
  
  # Prompt for domain
  read -p "Enter your domain (e.g., app.vibewell.example.com): " DOMAIN
  
  # Check if domain is provided
  if [ -z "$DOMAIN" ]; then
    log_error "Domain name is required"
    exit 1
  fi
  
  # Update Nginx config with the domain
  sed -i "s/app.vibewell.example.com/$DOMAIN/g" /etc/nginx/sites-available/vibewell
  
  # Get SSL certificate
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
  
  log_success "SSL certificate obtained and configured successfully"
}

# Setup environment variables
setup_environment() {
  log "Setting up environment variables..."
  
  # Create environment file
  cat > /etc/environment.d/vibewell.conf << 'EOF'
# Vibewell Production Environment Variables

# Node environment
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_TLS=false
REDIS_TIMEOUT=5000

# Rate Limiting Configuration
RATE_LIMIT_DEFAULT_MAX=60
RATE_LIMIT_DEFAULT_WINDOW_MS=60000
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_SENSITIVE_MAX=30
RATE_LIMIT_SENSITIVE_WINDOW_MS=3600000

# Security Settings
SECURITY_ENABLE_RATE_LIMITING=true
SECURITY_LOG_RATE_LIMIT_EVENTS=true

# Add additional environment variables here
EOF

  # Replace Redis password in environment file
  sed -i "s/\${REDIS_PASSWORD}/$REDIS_PASSWORD/g" /etc/environment.d/vibewell.conf
  
  log_success "Environment variables configured successfully"
}

# Main execution
main() {
  log "Starting Vibewell production environment setup..."
  
  install_dependencies
  setup_docker
  configure_nginx
  configure_redis
  configure_firewall
  setup_ssl
  setup_environment
  
  log_success "Vibewell production environment setup completed successfully!"
  log "Next steps:"
  log "1. Deploy your application containers"
  log "2. Set up monitoring tools"
  log "3. Configure backup systems"
  log "4. Test the entire setup"
}

# Run the main function
main 