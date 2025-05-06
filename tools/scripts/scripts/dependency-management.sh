#!/bin/bash

# Dependency Management Script

# Configuration
NPM_AUDIT_LEVEL="high"
DEPENDENCY_REPORT_DIR="reports/dependencies"
LOCK_FILE="package-lock.json"

# Function to check for updates
check_updates() {
    echo "Checking for package updates..."
    npm outdated --json > "$DEPENDENCY_REPORT_DIR/updates.json"
    
    # Generate readable report
    echo "Available Updates:" > "$DEPENDENCY_REPORT_DIR/updates.txt"
    npm outdated | tail -n +2 >> "$DEPENDENCY_REPORT_DIR/updates.txt"
}

# Function to audit dependencies
audit_dependencies() {
    echo "Running security audit..."
    npm audit --json > "$DEPENDENCY_REPORT_DIR/audit.json"
    
    # Generate readable report
    echo "Security Vulnerabilities:" > "$DEPENDENCY_REPORT_DIR/vulnerabilities.txt"
    npm audit | tail -n +2 >> "$DEPENDENCY_REPORT_DIR/vulnerabilities.txt"
    
    # Check for high/critical vulnerabilities
    if npm audit | grep -q "high\|critical"; then
        echo "High or critical vulnerabilities found!"
        return 1
    fi
    return 0
}

# Function to update dependencies
update_dependencies() {
    echo "Updating dependencies..."
    
    # Backup lock file
    cp $LOCK_FILE "${LOCK_FILE}.bak"
    
    # Update packages
    npm update
    
    # Run tests after update
    echo "Running tests after update..."
    npm test
    
    if [ $? -ne 0 ]; then
        echo "Tests failed after update. Rolling back..."
        mv "${LOCK_FILE}.bak" $LOCK_FILE
        npm install
        return 1
    fi
    
    return 0
}

# Function to remove unused dependencies
remove_unused() {
    echo "Checking for unused dependencies..."
    npm depcheck > "$DEPENDENCY_REPORT_DIR/unused.txt"
    
    # Ask for confirmation before removing
    if [ -s "$DEPENDENCY_REPORT_DIR/unused.txt" ]; then
        echo "Unused dependencies found. Review $DEPENDENCY_REPORT_DIR/unused.txt"
        read -p "Do you want to remove unused dependencies? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm prune
        fi
    fi
}

# Function to check web3 dependencies
check_web3_deps() {
    echo "Checking web3 dependencies..."
    if npm list @walletconnect/web3-provider > /dev/null 2>&1; then
        echo "Web3 dependencies found. Checking for alternatives..."
        # Add logic to suggest alternatives or removal
    fi
}

# Main execution
echo "Starting dependency management..."

# Create reports directory
mkdir -p $DEPENDENCY_REPORT_DIR

# Run checks
check_updates
audit_dependencies
if [ $? -ne 0 ]; then
    echo "Security audit failed. Please review vulnerabilities."
    exit 1
fi

# Update if no vulnerabilities
read -p "Do you want to update dependencies? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    update_dependencies
    if [ $? -ne 0 ]; then
        echo "Update failed. Changes have been rolled back."
        exit 1
    fi
fi

# Check for unused dependencies
remove_unused

# Check web3 dependencies
check_web3_deps

echo "Dependency management completed"
echo "Reports available in $DEPENDENCY_REPORT_DIR" 