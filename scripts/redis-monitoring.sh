#!/bin/bash
#
# Redis Monitoring Setup Script for VibeWell
# This script sets up Redis monitoring using Prometheus and Grafana
#

set -e  # Exit on error

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}VibeWell Redis Monitoring Setup${NC}"
echo "================================"
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

# Check if Redis is running
if command -v redis-cli &> /dev/null; then
  if redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}Redis is running.${NC}"
  else
    echo -e "${RED}Redis is installed but not running or responding to ping.${NC}"
    echo "Please make sure Redis is running before proceeding."
    exit 1
  fi
else
  echo -e "${RED}Redis CLI not found. Please install Redis first.${NC}"
  exit 1
fi

# Prompt for monitoring setup type
echo "Select monitoring setup type:"
echo "1) Full setup (Prometheus + Redis Exporter + Grafana)"
echo "2) Redis Exporter only"
echo "3) Manual monitoring commands (no installation)"
read -p "Enter your choice (1-3): " MONITORING_TYPE
echo ""

if [ "$MONITORING_TYPE" -eq 1 ] || [ "$MONITORING_TYPE" -eq 2 ]; then
  # Get Redis connection information
  read -p "Enter Redis host (default: localhost): " REDIS_HOST
  REDIS_HOST=${REDIS_HOST:-localhost}
  
  read -p "Enter Redis port (default: 6379): " REDIS_PORT
  REDIS_PORT=${REDIS_PORT:-6379}
  
  read -sp "Enter Redis password (leave empty if not set): " REDIS_PASSWORD
  echo ""
  
  REDIS_URI="redis://${REDIS_HOST}:${REDIS_PORT}"
  if [ ! -z "$REDIS_PASSWORD" ]; then
    REDIS_URI="redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}"
  fi
fi

# Install Redis Exporter
install_redis_exporter() {
  echo -e "${GREEN}Installing Redis Exporter...${NC}"
  
  if [ "$OS" == "linux" ]; then
    # Install Redis Exporter on Linux
    REDIS_EXPORTER_VERSION="1.45.0"
    
    # Download Redis Exporter
    wget https://github.com/oliver006/redis_exporter/releases/download/v${REDIS_EXPORTER_VERSION}/redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64.tar.gz
    tar xzf redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64.tar.gz
    
    # Move to /usr/local/bin or create service
    if [ "$DISTRO" == "debian" ] || [ "$DISTRO" == "redhat" ]; then
      # Create a system user for running the exporter
      useradd -rs /bin/false redis_exporter || true
      
      # Move binary to /usr/local/bin
      cp redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64/redis_exporter /usr/local/bin/
      chown redis_exporter:redis_exporter /usr/local/bin/redis_exporter
      
      # Create systemd service file
      cat > /etc/systemd/system/redis_exporter.service << EOF
[Unit]
Description=Redis Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=redis_exporter
Group=redis_exporter
Type=simple
ExecStart=/usr/local/bin/redis_exporter -redis.addr=${REDIS_URI}

[Install]
WantedBy=multi-user.target
EOF
      
      # Enable and start service
      systemctl daemon-reload
      systemctl enable redis_exporter
      systemctl start redis_exporter
      
      echo -e "${GREEN}Redis Exporter installed as a service${NC}"
      echo "Service status:"
      systemctl status redis_exporter --no-pager
    else
      # Just copy the binary
      cp redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64/redis_exporter /usr/local/bin/
      echo -e "${GREEN}Redis Exporter installed at /usr/local/bin/redis_exporter${NC}"
      echo "Run it with:"
      echo "/usr/local/bin/redis_exporter -redis.addr=${REDIS_URI}"
    fi
    
    # Clean up
    rm -rf redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64*
    
  elif [ "$OS" == "macos" ]; then
    # Install Redis Exporter on macOS using Homebrew
    if ! command -v brew &> /dev/null; then
      echo -e "${RED}Homebrew not found. Please install Homebrew first${NC}"
      exit 1
    fi
    
    brew install redis_exporter
    
    echo -e "${GREEN}Redis Exporter installed via Homebrew${NC}"
    echo "Run it with:"
    echo "redis_exporter -redis.addr=${REDIS_URI}"
  else
    echo -e "${RED}Unsupported OS for Redis Exporter installation${NC}"
    exit 1
  fi
}

# Install Prometheus
install_prometheus() {
  echo -e "${GREEN}Installing Prometheus...${NC}"
  
  if [ "$OS" == "linux" ]; then
    # Install Prometheus on Linux
    PROMETHEUS_VERSION="2.40.0"
    
    # Download Prometheus
    wget https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
    tar xzf prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
    
    # Create directories
    mkdir -p /etc/prometheus /var/lib/prometheus
    
    # Copy binaries
    cp prometheus-${PROMETHEUS_VERSION}.linux-amd64/prometheus /usr/local/bin/
    cp prometheus-${PROMETHEUS_VERSION}.linux-amd64/promtool /usr/local/bin/
    
    # Copy config files
    cp -r prometheus-${PROMETHEUS_VERSION}.linux-amd64/consoles /etc/prometheus
    cp -r prometheus-${PROMETHEUS_VERSION}.linux-amd64/console_libraries /etc/prometheus
    
    # Create prometheus config
    cat > /etc/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'redis_exporter'
    static_configs:
      - targets: ['localhost:9121']
EOF
    
    # Create system user
    useradd -rs /bin/false prometheus || true
    
    # Set ownership
    chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
    
    # Create systemd service file
    cat > /etc/systemd/system/prometheus.service << EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start service
    systemctl daemon-reload
    systemctl enable prometheus
    systemctl start prometheus
    
    echo -e "${GREEN}Prometheus installed as a service${NC}"
    echo "Service status:"
    systemctl status prometheus --no-pager
    
    # Clean up
    rm -rf prometheus-${PROMETHEUS_VERSION}.linux-amd64*
    
  elif [ "$OS" == "macos" ]; then
    # Install Prometheus on macOS using Homebrew
    if ! command -v brew &> /dev/null; then
      echo -e "${RED}Homebrew not found. Please install Homebrew first${NC}"
      exit 1
    fi
    
    brew install prometheus
    
    # Configure prometheus.yml to include Redis Exporter
    PROMETHEUS_CONF=$(brew --prefix)/etc/prometheus.yml
    
    # Backup original config
    cp "$PROMETHEUS_CONF" "${PROMETHEUS_CONF}.bak"
    
    # Add Redis Exporter to config if not already there
    if ! grep -q "redis_exporter" "$PROMETHEUS_CONF"; then
      cat >> "$PROMETHEUS_CONF" << EOF

  - job_name: 'redis_exporter'
    static_configs:
      - targets: ['localhost:9121']
EOF
    fi
    
    # Restart prometheus
    brew services restart prometheus
    
    echo -e "${GREEN}Prometheus installed via Homebrew${NC}"
    echo "Prometheus is running at http://localhost:9090"
  else
    echo -e "${RED}Unsupported OS for Prometheus installation${NC}"
    exit 1
  fi
}

# Install Grafana
install_grafana() {
  echo -e "${GREEN}Installing Grafana...${NC}"
  
  if [ "$OS" == "linux" ]; then
    # Install Grafana on Linux
    if [ "$DISTRO" == "debian" ]; then
      # Add Grafana APT repository
      apt-get install -y apt-transport-https software-properties-common
      wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
      add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
      
      # Install Grafana
      apt-get update
      apt-get install -y grafana
      
      # Enable and start service
      systemctl daemon-reload
      systemctl enable grafana-server
      systemctl start grafana-server
      
    elif [ "$DISTRO" == "redhat" ]; then
      # Add Grafana YUM repository
      cat > /etc/yum.repos.d/grafana.repo << EOF
[grafana]
name=grafana
baseurl=https://packages.grafana.com/oss/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
EOF
      
      # Install Grafana
      yum install -y grafana
      
      # Enable and start service
      systemctl daemon-reload
      systemctl enable grafana-server
      systemctl start grafana-server
    fi
    
    echo -e "${GREEN}Grafana installed as a service${NC}"
    echo "Service status:"
    systemctl status grafana-server --no-pager
    echo "Grafana is running at http://localhost:3000"
    echo "Default credentials: admin/admin"
    
  elif [ "$OS" == "macos" ]; then
    # Install Grafana on macOS using Homebrew
    if ! command -v brew &> /dev/null; then
      echo -e "${RED}Homebrew not found. Please install Homebrew first${NC}"
      exit 1
    fi
    
    brew install grafana
    brew services start grafana
    
    echo -e "${GREEN}Grafana installed via Homebrew${NC}"
    echo "Grafana is running at http://localhost:3000"
    echo "Default credentials: admin/admin"
  else
    echo -e "${RED}Unsupported OS for Grafana installation${NC}"
    exit 1
  fi
  
  echo ""
  echo "After logging into Grafana:"
  echo "1. Add Prometheus as a data source (URL: http://localhost:9090)"
  echo "2. Import Redis Dashboard using ID 763 or 11835"
}

# Print manual monitoring commands
print_monitoring_commands() {
  echo -e "${GREEN}Redis Monitoring Commands${NC}"
  echo "==============================="
  echo ""
  echo "1. Basic Redis Information:"
  echo "   redis-cli info"
  echo ""
  echo "2. Memory Usage:"
  echo "   redis-cli info memory"
  echo ""
  echo "3. Client Connections:"
  echo "   redis-cli info clients"
  echo ""
  echo "4. Command Statistics:"
  echo "   redis-cli info commandstats"
  echo ""
  echo "5. Real-time Monitoring:"
  echo "   redis-cli monitor"
  echo ""
  echo "6. Redis Latency Monitoring:"
  echo "   redis-cli --latency"
  echo ""
  echo "7. Rate Limiting Keys Count:"
  echo "   redis-cli keys \"vibewell:ratelimit:*\" | wc -l"
  echo ""
  echo "8. Create a cron job to check Redis health:"
  echo "   Add to crontab:"
  echo "   */5 * * * * /usr/bin/redis-cli ping > /dev/null || echo \"Redis down!\" | mail -s \"Redis Alert\" admin@example.com"
  echo ""
  echo "9. Set up Redis Benchmark:"
  echo "   redis-benchmark -h localhost -p 6379 -c 100 -n 100000"
  echo ""
  echo "These commands can be incorporated into shell scripts for periodic checks."
}

# Execute based on selected option
if [ "$MONITORING_TYPE" -eq 1 ]; then
  # Full setup
  install_redis_exporter
  install_prometheus
  install_grafana
  
  echo ""
  echo -e "${GREEN}Full monitoring stack installed successfully!${NC}"
  echo "Prometheus: http://localhost:9090"
  echo "Grafana: http://localhost:3000"
  echo "Redis metrics are being collected from ${REDIS_URI}"
  
elif [ "$MONITORING_TYPE" -eq 2 ]; then
  # Redis Exporter only
  install_redis_exporter
  
  echo ""
  echo -e "${GREEN}Redis Exporter installed successfully!${NC}"
  echo "Redis metrics endpoint: http://localhost:9121/metrics"
  echo "You can configure your existing Prometheus to scrape this endpoint."
  
elif [ "$MONITORING_TYPE" -eq 3 ]; then
  # Manual monitoring commands
  print_monitoring_commands
else
  echo -e "${RED}Invalid choice. Exiting...${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}Redis Monitoring Setup Complete!${NC}"
echo "=======================================" 