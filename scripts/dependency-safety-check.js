#!/usr/bin/env node

/**
 * Dependency Safety Check Script for Vibewell
 * 
 * This script is used in the pre-commit hook to check for:
 * 1. Critical security vulnerabilities
 * 2. Extremely outdated dependencies
 * 
 * Unlike the full dependency manager, this is designed to be fast and focused.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// How many days we consider a dependency "critically outdated"
const CRITICAL_DAYS = 365; // 1 year

// Log level
const LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

// Function to run a command and return output
function runCommand(command, silent = true) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit' 
    });
  } catch (error) {
    if (!silent) {
      console.error(`Error executing command: ${command}`);
      console.error(error.message);
    }
    return error.stdout ? error.stdout.toString() : '';
  }
}

// Log only if appropriate log level
function log(level, message) {
  const levels = {
    'error': 0,
    'warn': 1,
    'info': 2,
    'debug': 3
  };
  
  if (levels[level] <= levels[LOG_LEVEL]) {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

// Check for security vulnerabilities
function checkSecurity() {
  log('info', 'Checking for security vulnerabilities...');
  
  try {
    const result = runCommand('npm audit --json');
    const auditData = JSON.parse(result);
    
    if (auditData.metadata && auditData.metadata.vulnerabilities) {
      const vulns = auditData.metadata.vulnerabilities;
      const criticalCount = vulns.critical || 0;
      const highCount = vulns.high || 0;
      
      if (criticalCount > 0) {
        log('error', `Found ${criticalCount} critical vulnerabilities!`);
        return false;
      }
      
      if (highCount > 0) {
        log('warn', `Found ${highCount} high severity vulnerabilities.`);
      }
    }
    
    return true;
  } catch (error) {
    log('error', 'Error checking security vulnerabilities');
    log('debug', error.message);
    return true; // Continue on error
  }
}

// Check for critically outdated dependencies
function checkOutdated() {
  log('info', 'Checking for critically outdated dependencies...');
  
  try {
    const result = runCommand('npm outdated --json');
    const outdated = JSON.parse(result);
    const outdatedPackages = Object.keys(outdated);
    
    if (outdatedPackages.length === 0) {
      return true;
    }
    
    const criticallyOutdated = [];
    
    for (const pkg of outdatedPackages) {
      const info = outdated[pkg];
      if (!info.current || !info.latest) continue;
      
      const currentVersion = info.current.split('.');
      const latestVersion = info.latest.split('.');
      
      // Major version difference of 2 or more is critical
      if (parseInt(latestVersion[0]) - parseInt(currentVersion[0]) >= 2) {
        criticallyOutdated.push(pkg);
      }
    }
    
    if (criticallyOutdated.length > 0) {
      log('warn', `Found ${criticallyOutdated.length} critically outdated packages: ${criticallyOutdated.join(', ')}`);
      return criticallyOutdated.length < 5; // Allow commit if less than 5 critical outdated
    }
    
    return true;
  } catch (error) {
    log('debug', 'Error checking outdated dependencies');
    log('debug', error.message);
    return true; // Continue on error
  }
}

// Main function
function main() {
  const securityPassed = checkSecurity();
  const outdatedPassed = checkOutdated();
  
  if (!securityPassed) {
    log('error', 'Critical security vulnerabilities found!');
    log('error', 'Please run "npm audit fix" to resolve them before committing.');
    process.exit(1);
  }
  
  if (!outdatedPassed) {
    log('error', 'Too many critically outdated dependencies!');
    log('error', 'Please run "npm run deps:update" to update them before committing.');
    process.exit(1);
  }
  
  log('info', 'Dependency safety check passed');
  process.exit(0);
}

// Run the main function
main(); 