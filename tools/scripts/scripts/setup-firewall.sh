#!/bin/bash

# Redis Firewall Configuration Script

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

# Variables
REDIS_PORT=6379
REDIS_TLS_PORT=6380
ALLOWED_IPS=("10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16")

# Flush existing rules
iptables -F
iptables -X

# Set default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow Redis connections from allowed IPs
for ip in "${ALLOWED_IPS[@]}"; do
    iptables -A INPUT -p tcp --dport $REDIS_PORT -s $ip -j ACCEPT
    iptables -A INPUT -p tcp --dport $REDIS_TLS_PORT -s $ip -j ACCEPT
done

# Rate limiting for Redis connections
iptables -A INPUT -p tcp --dport $REDIS_PORT -m state --state NEW -m limit --limit 50/second --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --dport $REDIS_TLS_PORT -m state --state NEW -m limit --limit 50/second --limit-burst 100 -j ACCEPT

# Log dropped packets
iptables -A INPUT -j LOG --log-prefix "DROPPED: " --log-level 4

# Save rules
iptables-save > /etc/iptables/rules.v4

echo "Firewall configuration completed successfully" 