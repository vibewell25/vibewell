#!/bin/bash

# Redis Firewall Configuration Script
# This script sets up firewall rules for Redis to restrict access

# Variables - customize these as needed
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_EXPORTER_PORT=${REDIS_EXPORTER_PORT:-9121}
ALLOWED_NETWORKS=()  # e.g. ("10.0.0.0/8" "192.168.1.0/24")
ALLOWED_IPS=()       # e.g. ("203.0.113.1" "203.0.113.2")

# Function to detect the firewall type
detect_firewall() {
  if command -v ufw &> /dev/null; then
    echo "ufw"
  elif command -v firewalld &> /dev/null; then
    echo "firewalld"
  elif command -v iptables &> /dev/null; then
    echo "iptables"
  else
    echo "none"
  fi
}

# Configure UFW firewall
configure_ufw() {
  echo "Configuring UFW firewall for Redis..."
  
  # Deny incoming traffic to Redis by default
  sudo ufw deny ${REDIS_PORT}/tcp
  sudo ufw deny ${REDIS_EXPORTER_PORT}/tcp
  
  # Allow access from Docker network
  sudo ufw allow in on docker0 to any port ${REDIS_PORT} proto tcp
  sudo ufw allow in on docker0 to any port ${REDIS_EXPORTER_PORT} proto tcp
  
  # Allow access from allowed networks
  for network in "${ALLOWED_NETWORKS[@]}"; do
    sudo ufw allow from ${network} to any port ${REDIS_PORT} proto tcp
    sudo ufw allow from ${network} to any port ${REDIS_EXPORTER_PORT} proto tcp
    echo "Allowed access from network: ${network}"
  done
  
  # Allow access from specific IPs
  for ip in "${ALLOWED_IPS[@]}"; do
    sudo ufw allow from ${ip} to any port ${REDIS_PORT} proto tcp
    sudo ufw allow from ${ip} to any port ${REDIS_EXPORTER_PORT} proto tcp
    echo "Allowed access from IP: ${ip}"
  done
  
  # Enable UFW if not already enabled
  if ! sudo ufw status | grep -q "Status: active"; then
    echo "Enabling UFW..."
    sudo ufw --force enable
  fi
  
  sudo ufw status verbose
}

# Configure FirewallD
configure_firewalld() {
  echo "Configuring FirewallD for Redis..."
  
  # Create a Redis service
  sudo firewall-cmd --permanent --new-service=redis
  sudo firewall-cmd --permanent --service=redis --add-port=${REDIS_PORT}/tcp
  sudo firewall-cmd --permanent --service=redis --set-description="Redis database service"
  
  # Create a Redis Exporter service
  sudo firewall-cmd --permanent --new-service=redis-exporter
  sudo firewall-cmd --permanent --service=redis-exporter --add-port=${REDIS_EXPORTER_PORT}/tcp
  sudo firewall-cmd --permanent --service=redis-exporter --set-description="Redis metrics exporter service"
  
  # Allow access from Docker network
  sudo firewall-cmd --permanent --zone=trusted --add-interface=docker0
  
  # Create a zone for Redis
  sudo firewall-cmd --permanent --new-zone=redis
  
  # Add allowed networks to Redis zone
  for network in "${ALLOWED_NETWORKS[@]}"; do
    sudo firewall-cmd --permanent --zone=redis --add-source=${network}
    echo "Allowed access from network: ${network}"
  done
  
  # Add allowed IPs to Redis zone
  for ip in "${ALLOWED_IPS[@]}"; do
    sudo firewall-cmd --permanent --zone=redis --add-source=${ip}
    echo "Allowed access from IP: ${ip}"
  done
  
  # Add Redis services to Redis zone
  sudo firewall-cmd --permanent --zone=redis --add-service=redis
  sudo firewall-cmd --permanent --zone=redis --add-service=redis-exporter
  
  # Apply changes
  sudo firewall-cmd --reload
  
  # Show status
  sudo firewall-cmd --list-all-zones | grep -A 10 "redis"
}

# Configure iptables
configure_iptables() {
  echo "Configuring iptables for Redis..."
  
  # Create a new chain for Redis
  sudo iptables -N REDIS 2>/dev/null || sudo iptables -F REDIS
  
  # Default policy: drop Redis traffic
  sudo iptables -A REDIS -j DROP
  
  # Allow access from Docker network
  sudo iptables -A REDIS -i docker0 -p tcp --dport ${REDIS_PORT} -j ACCEPT
  sudo iptables -A REDIS -i docker0 -p tcp --dport ${REDIS_EXPORTER_PORT} -j ACCEPT
  
  # Allow access from allowed networks
  for network in "${ALLOWED_NETWORKS[@]}"; do
    sudo iptables -A REDIS -s ${network} -p tcp --dport ${REDIS_PORT} -j ACCEPT
    sudo iptables -A REDIS -s ${network} -p tcp --dport ${REDIS_EXPORTER_PORT} -j ACCEPT
    echo "Allowed access from network: ${network}"
  done
  
  # Allow access from specific IPs
  for ip in "${ALLOWED_IPS[@]}"; do
    sudo iptables -A REDIS -s ${ip} -p tcp --dport ${REDIS_PORT} -j ACCEPT
    sudo iptables -A REDIS -s ${ip} -p tcp --dport ${REDIS_EXPORTER_PORT} -j ACCEPT
    echo "Allowed access from IP: ${ip}"
  done
  
  # Jump to REDIS chain for incoming Redis traffic
  sudo iptables -A INPUT -p tcp --dport ${REDIS_PORT} -j REDIS
  sudo iptables -A INPUT -p tcp --dport ${REDIS_EXPORTER_PORT} -j REDIS
  
  # Save rules (this varies by distribution)
  if command -v iptables-save &> /dev/null; then
    if [ -d "/etc/iptables" ]; then
      sudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null
    else
      sudo iptables-save | sudo tee /etc/iptables.rules > /dev/null
    fi
  fi
  
  # Show rules
  sudo iptables -L REDIS -v
}

# Function to check if running in Docker
is_running_in_docker() {
  if [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null; then
    return 0  # True, running in Docker
  else
    return 1  # False, not running in Docker
  fi
}

# Function to prompt for IPs/networks to allow
prompt_for_allowed_sources() {
  echo "Enter networks to allow (e.g., 10.0.0.0/8, one per line, empty line to finish):"
  while true; do
    read -r network
    if [ -z "$network" ]; then
      break
    fi
    ALLOWED_NETWORKS+=("$network")
  done
  
  echo "Enter specific IPs to allow (one per line, empty line to finish):"
  while true; do
    read -r ip
    if [ -z "$ip" ]; then
      break
    fi
    ALLOWED_IPS+=("$ip")
  done
}

# Main function
main() {
  echo "============================================"
  echo "Redis Firewall Configuration"
  echo "============================================"
  
  # Check if running in Docker
  if is_running_in_docker; then
    echo "Running in Docker environment. Firewall configuration should be handled at the host level."
    echo "Here are recommended rules for the host system:"
    echo "1. Allow only necessary connections to Redis port ${REDIS_PORT}"
    echo "2. Allow only necessary connections to Redis Exporter port ${REDIS_EXPORTER_PORT}"
    echo "3. Consider using Docker network isolation to restrict Redis access"
    exit 0
  fi
  
  # Prompt for allowed sources if not already defined
  if [ ${#ALLOWED_NETWORKS[@]} -eq 0 ] && [ ${#ALLOWED_IPS[@]} -eq 0 ]; then
    prompt_for_allowed_sources
  fi
  
  # Detect firewall and configure
  FIREWALL_TYPE=$(detect_firewall)
  case ${FIREWALL_TYPE} in
    ufw)
      configure_ufw
      ;;
    firewalld)
      configure_firewalld
      ;;
    iptables)
      configure_iptables
      ;;
    none)
      echo "No supported firewall detected. Please install ufw, firewalld, or configure iptables manually."
      exit 1
      ;;
  esac
  
  echo -e "\n============================================"
  echo "Firewall configuration completed"
  echo "Redis should now be secured to only accept connections from authorized sources"
  echo "============================================"
}

# Run main function
main 