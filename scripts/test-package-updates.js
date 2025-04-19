#!/usr/bin/env node

/**
 * Script to test package updates one by one
 * 
 * This script helps safely test package updates by:
 * 1. Making a backup of package.json
 * 2. Updating one package at a time
 * 3. Running tests to ensure nothing breaks
 * 4. Restoring or keeping the update based on test results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const BACKUP_PATH = path.join(process.cwd(), 'package.json.backup');
const TEST_COMMAND = 'npm test -- --watchAll=false';
const BUILD_COMMAND = 'npm run build';
const NPM_COMMAND = 'npm';
const NPM_INSTALL_FLAGS = '--legacy-peer-deps';

// Safe packages to update (from UPDATE-PLAN.md)
const safePackages = [
  '@clerk/nextjs@6.14.3',
  '@types/pg@8.11.12',
  'ioredis@5.6.1',
  'nodemailer@6.10.1',
  'react-day-picker@9.6.6'
];

// Breaking changes packages (requires more careful testing)
const breakingPackages = [
  '@react-three/drei@10.0.6',
  '@react-three/fiber@9.1.2',
  '@stripe/react-stripe-js@3.6.0',
  '@stripe/stripe-js@7.0.0',
  'react@19.1.0',
  'react-dom@19.1.0',
  'next@15.3.0'
];

/**
 * Backup the package.json file
 */
function backupPackageJson() {
  console.log('Creating backup of package.json...');
  fs.copyFileSync(PACKAGE_JSON_PATH, BACKUP_PATH);
}

/**
 * Restore the package.json file from backup
 */
function restorePackageJson() {
  console.log('Restoring package.json from backup...');
  fs.copyFileSync(BACKUP_PATH, PACKAGE_JSON_PATH);
}

/**
 * Update a single package and test it
 * @param {string} packageWithVersion - Package name with version
 * @returns {boolean} - Whether the update was successful
 */
function updateAndTestPackage(packageWithVersion) {
  const [packageName] = packageWithVersion.split('@');
  
  try {
    console.log(`\n\n======================================`);
    console.log(`Testing update for ${packageWithVersion}`);
    console.log(`======================================\n`);
    
    // Install the specific version
    console.log(`Installing ${packageWithVersion}...`);
    execSync(`${NPM_COMMAND} install ${packageWithVersion} ${NPM_INSTALL_FLAGS}`, { stdio: 'inherit' });
    
    // Run tests
    console.log(`Running tests...`);
    execSync(TEST_COMMAND, { stdio: 'inherit' });
    
    // Try building
    console.log(`Building application...`);
    execSync(BUILD_COMMAND, { stdio: 'inherit' });
    
    console.log(`\n✅ Update successful for ${packageWithVersion}`);
    return true;
  } catch (error) {
    console.error(`\n❌ Update failed for ${packageWithVersion}`);
    console.error(`Error: ${error.message}`);
    
    // Restore the previous version
    console.log(`Restoring previous version...`);
    restorePackageJson();
    execSync(`${NPM_COMMAND} install ${NPM_INSTALL_FLAGS}`, { stdio: 'inherit' });
    
    return false;
  }
}

/**
 * Main function to run the script
 */
function main() {
  // Determine which packages to update based on command line args
  const args = process.argv.slice(2);
  const testBreakingChanges = args.includes('--breaking');
  const packagesToTest = testBreakingChanges ? breakingPackages : safePackages;
  
  console.log(`Starting package update tests for ${testBreakingChanges ? 'BREAKING' : 'SAFE'} packages...`);
  
  // Create initial backup
  backupPackageJson();
  
  // Track results
  const results = {
    successful: [],
    failed: []
  };
  
  // Test each package one by one
  for (const packageWithVersion of packagesToTest) {
    const success = updateAndTestPackage(packageWithVersion);
    
    if (success) {
      results.successful.push(packageWithVersion);
    } else {
      results.failed.push(packageWithVersion);
    }
    
    // Make a new backup after each successful update
    if (success) {
      backupPackageJson();
    }
  }
  
  // Print summary
  console.log('\n\n===============================');
  console.log('PACKAGE UPDATE TEST SUMMARY');
  console.log('===============================\n');
  
  console.log('✅ Successful updates:');
  results.successful.forEach(pkg => console.log(`  - ${pkg}`));
  
  console.log('\n❌ Failed updates:');
  results.failed.forEach(pkg => console.log(`  - ${pkg}`));
  
  // Clean up
  if (fs.existsSync(BACKUP_PATH)) {
    fs.unlinkSync(BACKUP_PATH);
  }
  
  // Return appropriate exit code
  if (results.failed.length > 0) {
    console.log('\nSome packages failed to update. Review the failures and update manually.');
    process.exit(1);
  } else {
    console.log('\nAll package updates were successful!');
    process.exit(0);
  }
}

main(); 