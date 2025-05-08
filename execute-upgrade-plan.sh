#!/bin/bash

# Vibewell Dependency Upgrade Implementation Script
# This script implements all phases of the dependency upgrade plan

set -e  # Exit on error

# Color configuration for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to normal mode (not dry run)
DRY_RUN=false

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

# Function to check if a directory exists with diagnostics
check_directory() {
  local dir="$1"
  log_info "Checking directory '$dir'..."
  
  # Print current directory for debugging
  log_info "Current directory: $(pwd)"
  
  if [ ! -d "$dir" ]; then
    log_error "Directory '$dir' does not exist (from $(pwd))!"
    return 1
  fi
  
  # Show directory contents for confirmation
  log_info "Directory '$dir' exists, contents: $(ls -la "$dir" | wc -l) items"
  
  return 0
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
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would execute: $1"
  else
    eval "$1"
    check_success "$1"
  fi
}

# Function to run a command after verifying directory exists
run_command_in_dir() {
  local cmd="$1"
  
  # Extract the directory from a cd command
  local cd_part=$(echo "$cmd" | grep -o -E "cd [^ ]+")
  
  if [ -n "$cd_part" ]; then
    local dir_part=$(echo "$cd_part" | cut -d' ' -f2)
    
    log_info "Extracted directory: '$dir_part' from command: '$cmd'"
    
    if [ ! -d "$dir_part" ]; then
      log_warn "Directory does not exist: '$dir_part' (pwd: $(pwd))"
      return 1
    else
      log_info "Directory exists: '$dir_part' with $(ls -la "$dir_part" | wc -l) items"
    fi
  fi
  
  log_info "Running: $cmd"
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would execute: $cmd"
  else
    # Use bash -c to handle complex commands with redirections, pipes, etc.
    bash -c "$cmd"
    check_success "$cmd"
  fi
}

# Function to create branches for upgrades
create_upgrade_branch() {
  PHASE=$1
  # Use seconds in the timestamp to avoid duplicates
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  log_info "Creating branch for $PHASE..."
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would create branch: dependency-upgrade-$PHASE-$TIMESTAMP"
  else
    run_command "git checkout -b dependency-upgrade-$PHASE-$TIMESTAMP"
  fi
}

# Function to save and restore package.json if needed
backup_package_json() {
  WORKSPACE=$1
  DIR=${WORKSPACE:-.}
  
  # Verify directory exists
  if ! check_directory "$DIR"; then
    log_warn "Skipping backup of package.json in $DIR - directory doesn't exist"
    return 1
  fi
  
  log_info "Backing up package.json in $DIR..."
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would backup: $DIR/package.json to $DIR/package.json.bak"
  else
    run_command "cp $DIR/package.json $DIR/package.json.bak"
  fi
}

restore_package_json_if_needed() {
  WORKSPACE=$1
  DIR=${WORKSPACE:-.}
  
  # Skip if directory doesn't exist
  if [ ! -d "$DIR" ]; then
    log_warn "Skipping restore of package.json in $DIR - directory doesn't exist"
    return 1
  fi
  
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would check for changes in $DIR/package.json"
    log_info "[DRY RUN] Would remove backup file if it exists: $DIR/package.json.bak"
  else
    if [ -f "$DIR/package.json.bak" ]; then
      log_info "Checking for changes in $DIR/package.json..."
      if ! diff -q "$DIR/package.json" "$DIR/package.json.bak" > /dev/null; then
        log_info "Changes detected in $DIR/package.json"
      else
        log_warn "No changes detected in $DIR/package.json"
      fi
      run_command "rm $DIR/package.json.bak"
    fi
  fi
}

# Function to disable and re-enable scripts to avoid patch-package issues
disable_scripts() {
  log_info "Temporarily disabling postinstall scripts..."
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would disable scripts: npm config set ignore-scripts true"
  else
    run_command "npm config set ignore-scripts true"
  fi
}

enable_scripts() {
  log_info "Re-enabling postinstall scripts..."
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would enable scripts: npm config set ignore-scripts false"
  else
    run_command "npm config set ignore-scripts false"
  fi
}

# Function to check if test configuration exists and is valid
check_test_config() {
  TEST_TYPE=$1
  CONFIG_FILE=""
  
  case $TEST_TYPE in
    "smoke")
      CONFIG_FILE="jest-config/smoke.config.js"
      ;;
    "full")
      CONFIG_FILE="jest.config.js"
      ;;
    *)
      log_warn "Unknown test type: $TEST_TYPE"
      return 1
      ;;
  esac
  
  if [ ! -f "$CONFIG_FILE" ]; then
    log_warn "Test configuration file not found: $CONFIG_FILE"
    return 1
  fi
  
  # Check if the file is complete and valid
  if ! grep -q "module.exports" "$CONFIG_FILE"; then
    log_warn "Test configuration file missing module.exports: $CONFIG_FILE"
    return 1
  fi
  
  # Check for balanced braces
  OPEN_BRACES=$(grep -o "{" "$CONFIG_FILE" | wc -l)
  CLOSE_BRACES=$(grep -o "}" "$CONFIG_FILE" | wc -l)
  
  if [ "$OPEN_BRACES" != "$CLOSE_BRACES" ]; then
    log_warn "Test configuration file has unbalanced braces: $CONFIG_FILE (${OPEN_BRACES} opening, ${CLOSE_BRACES} closing)"
    return 1
  fi
  
  # Try to validate syntax by checking if the file can be parsed
  if command -v node &> /dev/null; then
    if ! node --check "$CONFIG_FILE" &> /dev/null; then
      log_warn "Test configuration file has syntax errors: $CONFIG_FILE"
      return 1
    fi
  else
    log_info "Node.js not available to check syntax, skipping syntax validation"
  fi
  
  log_info "Test configuration file exists and appears valid: $CONFIG_FILE"
  return 0
}

# Phase 1: Critical Framework Updates
phase1_critical_framework_updates() {
  log_info "=== Phase 1: Critical Framework Updates ==="

  # First create a new branch
  create_upgrade_branch "phase1"
  disable_scripts

  # Store the root project directory
  ROOT_DIR="$(pwd)"
  log_info "Root project directory: $ROOT_DIR"

  # Root Project Updates
  log_info "Updating Next.js ecosystem in root project..."
  backup_package_json
  run_command "npm install next@latest @next/bundle-analyzer@latest eslint-config-next@latest --save-exact"
  restore_package_json_if_needed

  log_info "Updating React ecosystem in root project..."
  backup_package_json
  run_command "npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest --save-exact"
  restore_package_json_if_needed

  # Web App Updates - Only if directory exists
  WEB_DIR="$ROOT_DIR/apps/web"
  if check_directory "$WEB_DIR"; then
    log_info "Updating Next.js and React in web app..."
    backup_package_json "$WEB_DIR"
    run_command_in_dir "cd $WEB_DIR && npm install next@latest react@latest react-dom@latest --save-exact"
    run_command_in_dir "cd $WEB_DIR && npm install --save-dev @types/react@latest @types/react-dom@latest eslint-config-next@latest --save-exact"
    restore_package_json_if_needed "$WEB_DIR"
  else
    log_warn "Skipping web app updates - directory $WEB_DIR not found"
  fi

  # Mobile App Updates - Only if directory exists
  MOBILE_DIR="$ROOT_DIR/apps/mobile"
  if check_directory "$MOBILE_DIR"; then
    log_info "Updating Expo ecosystem in mobile app..."
    backup_package_json "$MOBILE_DIR"
    run_command_in_dir "cd $MOBILE_DIR && npx expo install expo-router@latest"
    run_command_in_dir "cd $MOBILE_DIR && npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack"
    run_command_in_dir "cd $MOBILE_DIR && npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context"
    run_command_in_dir "cd $MOBILE_DIR && npx expo install react@latest react-dom@latest"
    restore_package_json_if_needed "$MOBILE_DIR"
  else
    log_warn "Skipping mobile app updates - directory $MOBILE_DIR not found"
  fi

  # Server App Updates - Only if directory exists
  SERVER_DIR="$ROOT_DIR/apps/server"
  if check_directory "$SERVER_DIR"; then
    log_info "Updating Express and related packages in server app..."
    backup_package_json "$SERVER_DIR"
    run_command_in_dir "cd $SERVER_DIR && npm install express@latest --save-exact"
    run_command_in_dir "cd $SERVER_DIR && npm install --save-dev @types/express@latest --save-exact"
    restore_package_json_if_needed "$SERVER_DIR"
  else
    log_warn "Skipping server app updates - directory $SERVER_DIR not found"
  fi

  # Run tests to verify everything still works
  if command -v npm run test:smoke &> /dev/null && check_test_config "smoke"; then
    log_info "Running tests to verify Phase 1 updates..."
    run_command "npm run test:smoke"
  else
    log_warn "Skipping tests - test:smoke script not found or configuration invalid"
  fi

  enable_scripts
  log_success "Completed Phase 1: Critical Framework Updates"
}

# Phase 2: Replace Deprecated Packages
phase2_deprecated_packages() {
  log_info "=== Phase 2: Replace Deprecated Packages ==="

  # Create a new branch
  create_upgrade_branch "phase2"
  disable_scripts

  # Store the root project directory
  ROOT_DIR="$(pwd)"
  log_info "Root project directory: $ROOT_DIR"

  # Replace deprecated type packages with built-in types
  log_info "Replacing deprecated type packages..."
  
  # Remove deprecated @types packages
  run_command "npm uninstall @types/winston"
  
  # Update JWT packages
  log_info "Updating JWT packages..."
  run_command "npm uninstall @types/jwt-decode"
  run_command "npm install jwt-decode@latest --save-exact"
  
  # Update Helmet - Only if server directory exists
  log_info "Updating Helmet..."
  SERVER_DIR="$ROOT_DIR/apps/server"
  if check_directory "$SERVER_DIR"; then
    log_info "Using absolute path for server directory: $SERVER_DIR"
    run_command_in_dir "cd $SERVER_DIR && npm uninstall @types/helmet"
    run_command_in_dir "cd $SERVER_DIR && npm install helmet@latest --save-exact"
  else
    log_warn "Skipping Helmet update - directory $SERVER_DIR not found"
  fi
  
  # Update Babel plugins
  log_info "Updating Babel plugins..."
  backup_package_json
  run_command "npm uninstall @babel/plugin-proposal-private-methods @babel/plugin-proposal-class-properties"
  run_command "npm install --save-dev @babel/plugin-transform-private-methods @babel/plugin-transform-class-properties --save-exact"
  restore_package_json_if_needed
  
  # Update glob and rimraf
  log_info "Updating glob and rimraf packages..."
  backup_package_json
  run_command "npm install glob@latest rimraf@latest --save-exact"
  restore_package_json_if_needed
  
  # Run tests to verify everything still works
  if command -v npm run test:smoke &> /dev/null && check_test_config "smoke"; then
    log_info "Running tests to verify Phase 2 updates..."
    run_command "npm run test:smoke"
  else
    log_warn "Skipping tests - test:smoke script not found or configuration invalid"
  fi

  enable_scripts
  log_success "Completed Phase 2: Replace Deprecated Packages"
}

# Phase 3: Library Updates
phase3_library_updates() {
  log_info "=== Phase 3: Library Updates ==="

  # Create a new branch
  create_upgrade_branch "phase3"
  disable_scripts

  # Store the root project directory
  ROOT_DIR="$(pwd)"
  log_info "Root project directory: $ROOT_DIR"

  # Three.js ecosystem
  log_info "Updating Three.js ecosystem..."
  backup_package_json
  run_command "npm install three@latest @react-three/fiber@latest @react-three/drei@latest --save-exact"
  restore_package_json_if_needed

  # Data management libraries
  log_info "Updating data management libraries..."
  backup_package_json
  run_command "npm install zustand@latest @reduxjs/toolkit@latest --save-exact"
  restore_package_json_if_needed

  # UI frameworks
  log_info "Updating UI frameworks..."
  backup_package_json
  run_command "npm install @chakra-ui/react@latest @mui/material@latest framer-motion@latest --save-exact"
  restore_package_json_if_needed

  # Testing libraries
  log_info "Updating testing libraries..."
  backup_package_json
  run_command "npm install --save-dev @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest --save-exact"
  restore_package_json_if_needed

  # Expo libraries (mobile app)
  log_info "Updating Expo libraries..."
  MOBILE_DIR="$ROOT_DIR/apps/mobile"
  if check_directory "$MOBILE_DIR"; then
    backup_package_json "$MOBILE_DIR"
    run_command_in_dir "cd $MOBILE_DIR && npx expo install expo-av expo-camera expo-device expo-document-picker expo-image-picker expo-linear-gradient expo-location expo-media-library expo-sharing expo-status-bar"
    restore_package_json_if_needed "$MOBILE_DIR"
  else
    log_warn "Skipping Expo libraries update - directory $MOBILE_DIR not found"
  fi

  # Run tests to verify everything still works
  if command -v npm run test:smoke &> /dev/null && check_test_config "smoke"; then
    log_info "Running tests to verify Phase 3 updates..."
    run_command "npm run test:smoke"
  else
    log_warn "Skipping tests - test:smoke script not found or configuration invalid"
  fi

  enable_scripts
  log_success "Completed Phase 3: Library Updates"
}

# Phase 4: Update TypeScript and Build Tools
phase4_typescript_buildtools() {
  log_info "=== Phase 4: Update TypeScript and Build Tools ==="

  # Create a new branch
  create_upgrade_branch "phase4"
  disable_scripts

  # Store the root project directory
  ROOT_DIR="$(pwd)"
  log_info "Root project directory: $ROOT_DIR"

  # Update TypeScript in root project
  log_info "Updating TypeScript and build tools in root project..."
  backup_package_json
  run_command "npm install --save-dev typescript@latest eslint@latest prettier@latest --save-exact"
  restore_package_json_if_needed

  # Update TypeScript in web app
  WEB_DIR="$ROOT_DIR/apps/web"
  if check_directory "$WEB_DIR"; then
    log_info "Updating TypeScript and build tools in web app..."
    backup_package_json "$WEB_DIR"
    run_command_in_dir "cd $WEB_DIR && npm install --save-dev typescript@latest --save-exact"
    restore_package_json_if_needed "$WEB_DIR"
  else
    log_warn "Skipping TypeScript update in web app - directory $WEB_DIR not found"
  fi

  # Update TypeScript in server app
  SERVER_DIR="$ROOT_DIR/apps/server"
  if check_directory "$SERVER_DIR"; then
    log_info "Updating TypeScript and build tools in server app..."
    backup_package_json "$SERVER_DIR"
    run_command_in_dir "cd $SERVER_DIR && npm install --save-dev typescript@latest --save-exact"
    restore_package_json_if_needed "$SERVER_DIR"
  else
    log_warn "Skipping TypeScript update in server app - directory $SERVER_DIR not found"
  fi

  # Update test frameworks
  log_info "Updating test frameworks..."
  backup_package_json
  run_command "npm install --save-dev jest@latest vitest@latest --save-exact"
  restore_package_json_if_needed

  # Update Prisma (server)
  if check_directory "$SERVER_DIR"; then
    log_info "Updating Prisma in server app..."
    backup_package_json "$SERVER_DIR"
    run_command_in_dir "cd $SERVER_DIR && npm install @prisma/client@latest --save-exact"
    run_command_in_dir "cd $SERVER_DIR && npm install --save-dev prisma@latest --save-exact"
    restore_package_json_if_needed "$SERVER_DIR"
  else
    log_warn "Skipping Prisma update - directory $SERVER_DIR not found"
  fi

  # Run tests to verify everything still works
  if command -v npm run test:smoke &> /dev/null && check_test_config "smoke"; then
    log_info "Running tests to verify Phase 4 updates..."
    run_command "npm run test:smoke"
  else
    log_warn "Skipping tests - test:smoke script not found or configuration invalid"
  fi

  enable_scripts
  log_success "Completed Phase 4: Update TypeScript and Build Tools"
}

# Phase 5: Miscellaneous Updates
phase5_miscellaneous_updates() {
  log_info "=== Phase 5: Miscellaneous Updates ==="

  # Create a new branch
  create_upgrade_branch "phase5"
  disable_scripts
  
  # Store the root project directory
  ROOT_DIR="$(pwd)"
  log_info "Root project directory: $ROOT_DIR"

  # Update any remaining packages
  log_info "Updating remaining packages..."
  backup_package_json
  
  # Auth libraries
  run_command "npm install @auth0/nextjs-auth0@latest --save-exact"
  
  # Monitoring libraries
  run_command "npm install @sentry/nextjs@latest @sentry/profiling-node@latest @sentry/types@latest --save-exact"
  
  # Utility libraries
  run_command "npm install date-fns@latest web-vitals@latest tailwind-merge@latest --save-exact"

  # Run npm update for any remaining minor/patch updates
  run_command "npm update"
  
  restore_package_json_if_needed

  # Run tests to verify everything still works
  if command -v npm run test:smoke &> /dev/null && check_test_config "smoke"; then
    log_info "Running tests to verify Phase 5 updates..."
    run_command "npm run test:smoke"
  else
    log_warn "Skipping tests - test:smoke script not found or configuration invalid"
  fi

  enable_scripts
  log_success "Completed Phase 5: Miscellaneous Updates"
}

# Final phase: Check results and run full test suite
final_validation() {
  log_info "=== Final Validation ==="

  # Create a validation branch
  create_upgrade_branch "validation"

  # Run full test suite
  if command -v npm run test &> /dev/null && check_test_config "full"; then
    log_info "Running full test suite..."
    run_command "npm run test"
  else
    log_warn "Skipping full test suite - npm run test not found or configuration invalid"
  fi

  # Check for outdated packages
  if command -v npm run deps:check &> /dev/null; then
    log_info "Checking for any remaining outdated packages..."
    run_command "npm run deps:check"
  else
    log_warn "Skipping dependency check - npm run deps:check not found"
  fi

  # Generate final dependency report
  if command -v npm run deps:report &> /dev/null; then
    log_info "Generating final dependency report..."
    run_command "npm run deps:report"
  else
    log_warn "Skipping dependency report - npm run deps:report not found"
  fi

  log_success "Completed Final Validation"
  log_info "Review the dependency report to ensure all packages were updated successfully."
}

# Execute individual phases or all phases
execute_phase() {
  PHASE=$1
  
  case $PHASE in
    1)
      phase1_critical_framework_updates
      ;;
    2)
      phase2_deprecated_packages
      ;;
    3)
      phase3_library_updates
      ;;
    4)
      phase4_typescript_buildtools
      ;;
    5)
      phase5_miscellaneous_updates
      ;;
    "final")
      final_validation
      ;;
    "all")
      phase1_critical_framework_updates
      phase2_deprecated_packages
      phase3_library_updates
      phase4_typescript_buildtools
      phase5_miscellaneous_updates
      final_validation
      ;;
    *)
      log_error "Invalid phase: $PHASE"
      log_info "Usage: $0 [--dry-run] [1|2|3|4|5|final|all]"
      exit 1
      ;;
  esac
}

# Display usage information
usage() {
  echo "Usage: $0 [--dry-run] [1|2|3|4|5|final|all]"
  echo ""
  echo "Options:"
  echo "  --dry-run    Show commands without executing them"
  echo ""
  echo "Phases:"
  echo "  1            Critical Framework Updates"
  echo "  2            Replace Deprecated Packages"
  echo "  3            Library Updates"
  echo "  4            TypeScript and Build Tools"
  echo "  5            Miscellaneous Updates"
  echo "  final        Run validation checks"
  echo "  all          Run all phases (default)"
  echo ""
  exit 1
}

# Main execution
main() {
  log_info "Starting Vibewell dependency upgrade process..."
  
  # Parse arguments
  PHASE="all"
  while [[ "$#" -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        log_info "Running in dry-run mode (commands will not be executed)"
        ;;
      --help|-h)
        usage
        ;;
      1|2|3|4|5|final|all)
        PHASE=$1
        ;;
      *)
        log_error "Unknown parameter: $1"
        usage
        ;;
    esac
    shift
  done
  
  # Execute specified phase
  log_info "Running phase $PHASE..."
  execute_phase $PHASE
  
  log_success "🎉 Upgrade process completed!"
  log_info "Next steps:"
  log_info "1. Review changes in each branch"
  log_info "2. Fix any issues that may have arisen"
  log_info "3. Merge branches into main/develop"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi 