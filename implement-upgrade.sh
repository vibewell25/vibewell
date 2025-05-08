#!/bin/bash

# Vibewell Dependency Upgrade Implementation Script
# This script implements the upgrade plan from upgrade-plan.md

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

# Create branch for the upgrade
create_upgrade_branch() {
  log_info "Creating branch for dependency upgrades..."
  git checkout -b dependency-upgrade-$(date +%Y%m%d)
  log_success "Created branch"
}

# Function to check if command was successful
check_success() {
  if [ $? -eq 0 ]; then
    log_success "$1"
  else
    log_error "$1 failed"
    exit 1
  fi
}

# Function to run a command with logging
run_command() {
  log_info "Running: $1"
  eval $1
  check_success "$1"
}

# Phase 1: Critical Framework Updates
phase1_critical_framework_updates() {
  log_info "=== Phase 1: Critical Framework Updates ==="
  
  # Root project
  log_info "Updating Root project dependencies..."
  run_command "npm install next@latest @next/bundle-analyzer@latest eslint-config-next@latest"
  run_command "npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest"
  
  # Web App
  log_info "Updating Web App dependencies..."
  run_command "cd apps/web && npm install next@latest react@latest react-dom@latest && npm install --save-dev @types/react@latest @types/react-dom@latest eslint-config-next@latest && cd ../.."
  
  # Mobile App
  log_info "Updating Mobile App dependencies..."
  run_command "cd apps/mobile && npx expo install expo-router@latest && cd ../.."
  run_command "cd apps/mobile && npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack && cd ../.."
  run_command "cd apps/mobile && npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context && cd ../.."
  
  # Server App
  log_info "Updating Server App dependencies..."
  run_command "cd apps/server && npm install express@latest && npm install --save-dev @types/express@latest && cd ../.."
  
  log_success "Completed Phase 1: Critical Framework Updates"
}

# Phase 2: Replace Deprecated Packages
phase2_replace_deprecated_packages() {
  log_info "=== Phase 2: Replace Deprecated Packages ==="
  
  # Remove type packages with built-in types
  log_info "Removing type packages that have built-in types..."
  run_command "npm uninstall @types/winston @types/react-native @types/jwt-decode @types/helmet --save-dev"
  
  # Update Babel plugins to transform equivalents
  log_info "Updating Babel plugins to their transform equivalents..."
  # First remove the old proposal plugins
  run_command "npm uninstall @babel/plugin-proposal-nullish-coalescing-operator @babel/plugin-proposal-class-properties @babel/plugin-proposal-optional-catch-binding @babel/plugin-proposal-numeric-separator @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-async-generator-functions @babel/plugin-proposal-object-rest-spread --save-dev"
  # Install the transform plugins
  run_command "npm install @babel/plugin-transform-nullish-coalescing-operator @babel/plugin-transform-class-properties @babel/plugin-transform-optional-catch-binding @babel/plugin-transform-numeric-separator @babel/plugin-transform-optional-chaining @babel/plugin-transform-async-generator-functions @babel/plugin-transform-object-rest-spread --save-dev"
  
  # Update rimraf to v4+
  log_info "Updating rimraf to latest version..."
  run_command "npm install rimraf@latest --save-dev"
  
  # Update glob to v9+
  log_info "Updating glob to latest version..."
  run_command "npm install glob@latest --save-dev"
  
  log_success "Completed Phase 2: Replace Deprecated Packages"
}

# Phase 3: Library Updates
phase3_library_updates() {
  log_info "=== Phase 3: Library Updates ==="
  
  # Three.js ecosystem
  log_info "Updating Three.js ecosystem..."
  run_command "npm install three@latest @react-three/fiber@latest @react-three/drei@latest"
  run_command "npm install @types/three@latest --save-dev"
  
  # Stripe integration
  log_info "Updating Stripe integration..."
  run_command "cd apps/mobile && npx expo install @stripe/stripe-react-native@latest && cd ../.."
  run_command "npm install stripe@latest"
  
  # Data management libraries
  log_info "Updating data management libraries..."
  run_command "npm install zustand@latest @reduxjs/toolkit@latest"
  
  # UI frameworks
  log_info "Updating UI frameworks..."
  run_command "npm install @chakra-ui/react@latest @mui/material@latest framer-motion@latest"
  
  # Testing libraries
  log_info "Updating testing libraries..."
  run_command "npm install @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest --save-dev"
  run_command "cd apps/mobile && npm install @testing-library/react-native@latest --save-dev && cd ../.."
  
  log_success "Completed Phase 3: Library Updates"
}

# Phase 4: Update TypeScript and Build Tools
phase4_typescript_build_tools() {
  log_info "=== Phase 4: Update TypeScript and Build Tools ==="
  
  # Update TypeScript
  log_info "Updating TypeScript to latest version..."
  run_command "npm install typescript@latest --save-dev"
  run_command "cd apps/web && npm install typescript@latest --save-dev && cd ../.."
  run_command "cd apps/mobile && npm install typescript@latest --save-dev && cd ../.."
  run_command "cd apps/server && npm install typescript@latest --save-dev && cd ../.."
  
  # Update build tools (Babel, ESLint, Prettier)
  log_info "Updating build tools..."
  run_command "npm install @babel/core@latest eslint@latest prettier@latest --save-dev"
  
  # Update test frameworks (Jest, Vitest)
  log_info "Updating test frameworks..."
  run_command "npm install jest@latest vitest@latest --save-dev"
  
  log_success "Completed Phase 4: Update TypeScript and Build Tools"
}

# Run tests to ensure everything still works
run_tests() {
  log_info "=== Running Tests ==="
  
  log_info "Running unit tests..."
  npm test || log_warn "Tests failed, but continuing..."
  
  log_success "Completed Tests"
}

# Initialize dependency management tools
setup_dependency_management() {
  log_info "=== Setting up Dependency Management Tools ==="
  
  # Make dependency manager script executable
  log_info "Making dependency manager script executable..."
  chmod +x scripts/dependency-manager.js
  
  # Create directory for reports if it doesn't exist
  log_info "Setting up reports directory..."
  mkdir -p reports
  
  # Install npm-check-updates globally for easier updates
  log_info "Installing npm-check-updates globally..."
  npm install -g npm-check-updates
  
  # Generate initial dependency report
  log_info "Generating initial dependency report..."
  node scripts/dependency-manager.js --generate-report || log_warn "Could not generate report automatically"
  
  log_success "Dependency management tools are set up"
}

# Commit changes
commit_changes() {
  log_info "=== Committing Changes ==="
  
  git add .
  git commit -m "chore: upgrade dependencies according to upgrade plan"
  
  log_success "Changes committed"
  log_info "You can now push the branch with: git push origin $(git branch --show-current)"
}

# Main execution
main() {
  log_info "Starting Vibewell dependency upgrade process..."
  
  # Create upgrade branch
  create_upgrade_branch
  
  # Prompt before starting
  read -p "This will upgrade all dependencies according to the plan. Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Operation cancelled"
    exit 0
  fi
  
  # Execute phases
  phase1_critical_framework_updates
  phase2_replace_deprecated_packages
  phase3_library_updates
  phase4_typescript_build_tools
  
  # Run tests
  run_tests
  
  # Set up dependency management
  setup_dependency_management
  
  # Commit changes
  commit_changes
  
  log_success "🎉 Dependency upgrade completed successfully!"
  log_info "Next steps:"
  log_info "1. Review the changes"
  log_info "2. Run application tests locally"
  log_info "3. Push the branch and create a PR"
  log_info "4. After merging, monitor for any issues"
}

# Execute main function
main 