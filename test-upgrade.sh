#!/bin/bash

# Temporary script to run only Phase 1 of the upgrade process for testing
# Based on implement-upgrade.sh

set -e  # Exit on error

# Color configuration for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command was successful
check_success() {
  if [ $? -eq 0 ]; then
    log_success "$1"
  else
    log_warn "$1 had warnings (continuing anyway)"
  fi
}

# Function to run a command with logging
run_command() {
  log_info "Running: $1"
  eval $1
  check_success "$1"
}

# Phase 1: Critical Framework Updates - ONE PACKAGE ONLY FOR TESTING
phase1_critical_framework_updates_test() {
  log_info "=== Phase 1: Critical Framework Updates (TEST MODE - Limited Updates) ==="
  
  # Save current package.json to detect changes
  cp package.json package.json.bak
  
  # Temporarily disable postinstall hooks to prevent patch-package from running
  log_info "Temporarily disabling postinstall scripts..."
  run_command "npm config set ignore-scripts true"
  
  # Root project - Update only one minor dependency for testing
  # Using chalk@4.1.2 since v5+ is ESM-only and our scripts use CommonJS
  log_info "Updating one package for testing..."
  run_command "npm install @types/jest@latest --save-exact"
  
  # Re-enable postinstall scripts
  log_info "Re-enabling postinstall scripts..."
  run_command "npm config set ignore-scripts false"
  
  # Check if package was updated
  if diff package.json package.json.bak | grep -q "@types/jest"; then
    log_success "The @types/jest package was successfully updated"
  else
    log_warn "No changes detected in package.json for @types/jest"
  fi
  
  # Clean up
  rm package.json.bak
  
  log_success "Completed Phase 1 Test Update"
}

# Run dependency checks
run_deps_check() {
  log_info "=== Running Dependency Checks ==="
  run_command "npm run deps:check"
  log_success "Completed Dependency Check"
}

# Run security checks
run_security_check() {
  log_info "=== Running Security Check ==="
  run_command "npm run deps:security"
  log_success "Completed Security Check"
}

# Main execution
main() {
  log_info "Starting Vibewell dependency upgrade test process..."
  
  # Execute limited test update
  phase1_critical_framework_updates_test
  
  # Run dependency check
  run_deps_check
  
  # Run security check
  run_security_check
  
  log_success "🎉 Test update completed!"
  log_info "Next steps:"
  log_info "1. Verify the test package was updated"
  log_info "2. Check that everything still works"
  log_info "3. Run 'git checkout -- package.json package-lock.json' to discard these changes if needed"
}

# Execute main function
main 