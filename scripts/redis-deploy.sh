#!/bin/bash
#
# Redis Deployment Script for VibeWell
# This script installs and configures Redis for production use with rate limiting
#

set -e  # Exit on error

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}VibeWell Redis Deployment Script${NC}"
echo "=================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: This script should ideally be run with sudo privileges${NC}"
  echo "Some operations may fail without appropriate privileges"
  echo ""
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting..."
    exit 1
  fi
fi

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
  if [ -f /etc/debian_version ]; then
    DISTRO="debian"
  elif [ -f /etc/redhat-release ]; then
    DISTRO="redhat"
  else
    DISTRO="unknown"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
  DISTRO="macos"
else
  OS="unknown"
  DISTRO="unknown"
fi

echo -e "Detected OS: ${YELLOW}$OS${NC} (${YELLOW}$DISTRO${NC})"
echo ""

# Prompt for Redis deployment type
echo "Select Redis deployment type:"
echo "1) Self-hosted on this server"
echo "2) Managed service (AWS ElastiCache, Azure Redis, etc.)"
echo "3) Docker deployment"
read -p "Enter your choice (1-3): " DEPLOYMENT_TYPE
echo ""

# Prompt for Redis password
read -sp "Enter a strong Redis password (min 16 characters): " REDIS_PASSWORD
echo ""
if [ ${#REDIS_PASSWORD} -lt 16 ]; then
  echo -e "${RED}Password is too short. Please use at least 16 characters${NC}"
  exit 1
fi

# Self-hosted Redis installation
if [ "$DEPLOYMENT_TYPE" -eq 1 ]; then
  echo -e "${GREEN}Installing Redis Server...${NC}"
  
  if [ "$DISTRO" == "debian" ]; then
    apt update
    apt install -y redis-server
    systemctl enable redis-server
  elif [ "$DISTRO" == "redhat" ]; then
    yum install -y redis
    systemctl enable redis
  elif [ "$DISTRO" == "macos" ]; then
    if ! command -v brew &> /dev/null; then
      echo -e "${RED}Homebrew not found. Please install Homebrew first${NC}"
      exit 1
    fi
    brew install redis
    brew services start redis
  else
    echo -e "${RED}Unsupported OS for automatic installation${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Redis installed successfully!${NC}"
  
  # Configure Redis
  echo -e "${GREEN}Configuring Redis for production...${NC}"
  
  if [ "$DISTRO" == "debian" ]; then
    REDIS_CONF="/etc/redis/redis.conf"
  elif [ "$DISTRO" == "redhat" ]; then
    REDIS_CONF="/etc/redis.conf"
  elif [ "$DISTRO" == "macos" ]; then
    REDIS_CONF="/usr/local/etc/redis.conf"
  fi
  
  # Make backup of original config
  cp "$REDIS_CONF" "${REDIS_CONF}.bak"
  
  # Update Redis configuration
  sed -i.bak "s/^# requirepass .*/requirepass $REDIS_PASSWORD/" "$REDIS_CONF"
  sed -i.bak "s/^# maxmemory .*/maxmemory 2gb/" "$REDIS_CONF"
  sed -i.bak "s/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/" "$REDIS_CONF"
  sed -i.bak "s/^appendonly .*/appendonly yes/" "$REDIS_CONF"
  sed -i.bak "s/^appendfsync .*/appendfsync everysec/" "$REDIS_CONF"
  
  # Restart Redis
  if [ "$DISTRO" == "debian" ]; then
    systemctl restart redis-server
  elif [ "$DISTRO" == "redhat" ]; then
    systemctl restart redis
  elif [ "$DISTRO" == "macos" ]; then
    brew services restart redis
  fi
  
  echo -e "${GREEN}Redis configured successfully!${NC}"
  
  # Configure firewall if needed
  echo -e "${GREEN}Configuring firewall...${NC}"
  
  if [ "$DISTRO" == "debian" ] || [ "$DISTRO" == "redhat" ]; then
    # Check if firewall is running
    if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
      # Allow Redis port only from application servers
      read -p "Enter app server IP to allow Redis access (leave empty to skip): " APP_SERVER_IP
      if [ ! -z "$APP_SERVER_IP" ]; then
        ufw allow from "$APP_SERVER_IP" to any port 6379
        echo -e "${GREEN}Firewall rule added for $APP_SERVER_IP${NC}"
      fi
    elif command -v firewall-cmd &> /dev/null; then
      # For RHEL/CentOS with firewalld
      read -p "Enter app server IP to allow Redis access (leave empty to skip): " APP_SERVER_IP
      if [ ! -z "$APP_SERVER_IP" ]; then
        firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='$APP_SERVER_IP' port port='6379' protocol='tcp' accept"
        firewall-cmd --reload
        echo -e "${GREEN}Firewall rule added for $APP_SERVER_IP${NC}"
      fi
    else
      echo -e "${YELLOW}No supported firewall detected. Please configure manually${NC}"
    fi
  fi
  
  # Test Redis connection
  echo -e "${GREEN}Testing Redis connection...${NC}"
  if command -v redis-cli &> /dev/null; then
    if redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
      echo -e "${GREEN}Redis is working correctly!${NC}"
    else
      echo -e "${RED}Redis connection test failed${NC}"
    fi
  fi
  
  # Print connection information
  echo ""
  echo -e "${GREEN}Redis Connection Information:${NC}"
  echo "--------------------------------"
  echo "Redis URL: redis://localhost:6379"
  echo "Redis Password: [Configured Successfully]"
  echo ""
  echo "Add the following to your .env file:"
  echo ""
  echo "REDIS_ENABLED=true"
  echo "REDIS_URL=redis://localhost:6379"
  echo "REDIS_PASSWORD=$REDIS_PASSWORD"
  echo "REDIS_TLS=false"
  echo "REDIS_TIMEOUT=5000"
  echo "REDIS_MAX_RECONNECT_ATTEMPTS=10"
  echo ""
  echo "RATE_LIMIT_GENERAL=120,60"
  echo "RATE_LIMIT_AUTH=30,60"
  echo "RATE_LIMIT_SENSITIVE=10,60"
  echo "RATE_LIMIT_ADMIN=300,60"
  echo "RATE_LIMIT_MFA=5,60"
  echo "RATE_LIMIT_FINANCIAL=20,60"
  
elif [ "$DEPLOYMENT_TYPE" -eq 2 ]; then
  # Managed Redis service
  echo -e "${GREEN}Configuring for managed Redis service...${NC}"
  
  # Prompt for Redis host
  read -p "Enter Redis host URL (e.g., my-redis.cache.amazonaws.com): " REDIS_HOST
  
  # Prompt for Redis port
  read -p "Enter Redis port (default: 6379): " REDIS_PORT
  REDIS_PORT=${REDIS_PORT:-6379}
  
  # Prompt for Redis TLS
  read -p "Is TLS/SSL enabled for your Redis connection? (y/n): " REDIS_TLS_INPUT
  if [[ $REDIS_TLS_INPUT =~ ^[Yy]$ ]]; then
    REDIS_TLS="true"
    REDIS_URL="rediss://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT"
  else
    REDIS_TLS="false"
    REDIS_URL="redis://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT"
  fi
  
  echo ""
  echo -e "${GREEN}Redis Connection Information:${NC}"
  echo "--------------------------------"
  echo "Redis URL: $REDIS_URL"
  echo "Redis Password: [Set Successfully]"
  echo ""
  echo "Add the following to your .env file:"
  echo ""
  echo "REDIS_ENABLED=true"
  echo "REDIS_URL=$REDIS_URL"
  echo "REDIS_PASSWORD=$REDIS_PASSWORD"
  echo "REDIS_TLS=$REDIS_TLS"
  echo "REDIS_TIMEOUT=5000"
  echo "REDIS_MAX_RECONNECT_ATTEMPTS=10"
  echo ""
  echo "RATE_LIMIT_GENERAL=120,60"
  echo "RATE_LIMIT_AUTH=30,60"
  echo "RATE_LIMIT_SENSITIVE=10,60"
  echo "RATE_LIMIT_ADMIN=300,60"
  echo "RATE_LIMIT_MFA=5,60"
  echo "RATE_LIMIT_FINANCIAL=20,60"
  
elif [ "$DEPLOYMENT_TYPE" -eq 3 ]; then
  # Docker Redis deployment
  echo -e "${GREEN}Setting up Redis with Docker...${NC}"
  
  # Check if Docker is installed
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Please install Docker first${NC}"
    exit 1
  fi
  
  # Create Redis data directory
  mkdir -p ./redis-data
  
  # Create Redis configuration file
  cat > ./redis-data/redis.conf << EOF
bind 0.0.0.0
protected-mode yes
port 6379
requirepass $REDIS_PASSWORD
appendonly yes
appendfsync everysec
maxmemory 2gb
maxmemory-policy allkeys-lru
EOF
  
  # Run Redis container
  docker run --name vibewell-redis \
    -p 127.0.0.1:6379:6379 \
    -v $(pwd)/redis-data:/data \
    -v $(pwd)/redis-data/redis.conf:/usr/local/etc/redis/redis.conf \
    -d redis:6 redis-server /usr/local/etc/redis/redis.conf
  
  echo -e "${GREEN}Redis Docker container started!${NC}"
  
  # Test Redis connection
  echo -e "${GREEN}Testing Redis connection...${NC}"
  if docker exec vibewell-redis redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
    echo -e "${GREEN}Redis is working correctly!${NC}"
  else
    echo -e "${RED}Redis connection test failed${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}Redis Docker Connection Information:${NC}"
  echo "--------------------------------"
  echo "Container Name: vibewell-redis"
  echo "Redis URL: redis://localhost:6379"
  echo "Redis Password: [Set Successfully]"
  echo ""
  echo "Add the following to your .env file:"
  echo ""
  echo "REDIS_ENABLED=true"
  echo "REDIS_URL=redis://localhost:6379"
  echo "REDIS_PASSWORD=$REDIS_PASSWORD"
  echo "REDIS_TLS=false"
  echo "REDIS_TIMEOUT=5000"
  echo "REDIS_MAX_RECONNECT_ATTEMPTS=10"
  echo ""
  echo "RATE_LIMIT_GENERAL=120,60"
  echo "RATE_LIMIT_AUTH=30,60"
  echo "RATE_LIMIT_SENSITIVE=10,60"
  echo "RATE_LIMIT_ADMIN=300,60"
  echo "RATE_LIMIT_MFA=5,60"
  echo "RATE_LIMIT_FINANCIAL=20,60"
  echo ""
  echo "To stop the Redis container:"
  echo "docker stop vibewell-redis"
  echo ""
  echo "To start it again:"
  echo "docker start vibewell-redis"
else
  echo -e "${RED}Invalid choice. Exiting...${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}Redis Deployment Complete!${NC}"
echo "===============================" 