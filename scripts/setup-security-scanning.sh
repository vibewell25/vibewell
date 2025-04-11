#!/bin/bash

echo "Setting up security scanning and audits..."

# Create security configuration
cat > config/security-config.json << EOL
{
  "security": {
    "scanning": {
      "enabled": true,
      "frequency": "daily",
      "types": {
        "vulnerability": true,
        "dependency": true,
        "code": true,
        "network": true
      }
    },
    "alerts": {
      "email": true,
      "slack": true,
      "threshold": "high"
    }
  }
}
EOL

# Create security scanning script
cat > scripts/security-scan.sh << EOL
#!/bin/bash

# Function to scan for vulnerabilities
scan_vulnerabilities() {
  echo "Scanning for vulnerabilities..."
  # Run npm audit
  npm audit
  
  # Run snyk test
  snyk test
  
  # Run OWASP dependency check
  dependency-check --scan .
}

# Function to scan dependencies
scan_dependencies() {
  echo "Scanning dependencies..."
  # Check for outdated packages
  npm outdated
  
  # Check for known vulnerabilities
  npm audit
  
  # Check for license compliance
  license-checker
}

# Function to scan code
scan_code() {
  echo "Scanning code..."
  # Run ESLint security rules
  eslint . --rule "security/detect-object-injection: error"
  
  # Run SonarQube analysis
  sonar-scanner
  
  # Run bandit for Python code
  bandit -r .
}

# Function to scan network
scan_network() {
  echo "Scanning network..."
  # Run nmap scan
  nmap -sV localhost
  
  # Check open ports
  netstat -tuln
  
  # Check SSL configuration
  sslscan localhost
}

# Main scanning function
main() {
  timestamp=\$(date +"%Y-%m-%d_%H-%M-%S")
  log_file="logs/security/scan-\$timestamp.log"
  
  echo "Starting security scan at \$timestamp" > \$log_file
  
  # Run all scans
  scan_vulnerabilities >> \$log_file 2>&1
  scan_dependencies >> \$log_file 2>&1
  scan_code >> \$log_file 2>&1
  scan_network >> \$log_file 2>&1
  
  # Check for high severity issues
  if grep -q "high" \$log_file; then
    echo "High severity issues found" | mail -s "Security Alert" admin@example.com
  fi
  
  echo "Security scan completed"
}

# Create security log directory
mkdir -p logs/security

# Run the scan
main
EOL

chmod +x scripts/security-scan.sh

echo "Security scanning setup complete" 