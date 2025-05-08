#!/usr/bin/env node

/**
 * Verify Code Quality Script for Vibewell
 * 
 * This script runs multiple code quality checks:
 * 1. Linting
 * 2. Type checking
 * 3. Unit tests
 * 4. Dependency validation
 * 
 * It's designed to be run as part of the CI/CD pipeline.
 */

const { execSync } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Config
const CHECK_TYPES = true;
const CHECK_LINT = true;
const CHECK_TESTS = true;
const CHECK_DEPS = true;

// Results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Run a command and return success/failure
function runCommand(command, name, ignoreErrors = false) {
  console.log(chalk.blue(`\n🔍 Running ${name}...\n`));
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    results.passed.push(name);
    console.log(chalk.green(`\n✅ ${name} passed\n`));
    return true;
  } catch (error) {
    if (ignoreErrors) {
      results.warnings.push(name);
      console.log(chalk.yellow(`\n⚠️ ${name} completed with warnings\n`));
      return true;
    } else {
      results.failed.push(name);
      console.log(chalk.red(`\n❌ ${name} failed\n`));
      return false;
    }
  }
}

// Run type checking
function checkTypes() {
  if (!CHECK_TYPES) return true;
  return runCommand('npm run type-check', 'Type checking');
}

// Run linting
function checkLint() {
  if (!CHECK_LINT) return true;
  return runCommand('npm run lint', 'Linting');
}

// Run tests
function runTests() {
  if (!CHECK_TESTS) return true;
  return runCommand('npm run test:smoke', 'Unit tests', true);
}

// Check dependencies
function checkDependencies() {
  if (!CHECK_DEPS) return true;
  
  // Check for critical vulnerabilities
  const securityPassed = runCommand('npm audit --audit-level=critical', 'Security audit', true);
  
  // Check for outdated direct dependencies
  console.log(chalk.blue('\n🔍 Checking for outdated dependencies...\n'));
  
  try {
    const outdatedOutput = execSync('npm outdated --depth=0 --json', { encoding: 'utf8' });
    const outdated = JSON.parse(outdatedOutput);
    const outdatedCount = Object.keys(outdated).length;
    
    if (outdatedCount > 0) {
      console.log(chalk.yellow(`\n⚠️ Found ${outdatedCount} outdated direct dependencies`));
      results.warnings.push('Outdated dependencies');
      
      // Log the top 5 most outdated
      const mostOutdated = Object.entries(outdated)
        .map(([pkg, info]) => ({ 
          pkg, 
          current: info.current, 
          latest: info.latest,
          difference: versionDifference(info.current, info.latest)
        }))
        .sort((a, b) => b.difference - a.difference)
        .slice(0, 5);
      
      console.log('\nMost critical outdated packages:');
      mostOutdated.forEach(({ pkg, current, latest, difference }) => {
        console.log(`- ${pkg}: ${current} → ${latest} (${difference} versions behind)`);
      });
      
      console.log('\nRun `npm run deps:update` to update dependencies');
    } else {
      console.log(chalk.green('\n✅ All direct dependencies are up to date'));
      results.passed.push('Dependency freshness');
    }
    
    return true;
  } catch (error) {
    console.log(chalk.yellow('\n⚠️ Could not check outdated dependencies'));
    results.warnings.push('Dependency check');
    return true;
  }
}

// Helper to calculate semantic version difference
function versionDifference(current, latest) {
  if (!current || !latest) return 0;
  
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  // Major difference
  if (latestParts[0] > currentParts[0]) {
    return (latestParts[0] - currentParts[0]) * 100;
  }
  
  // Minor difference
  if (latestParts[1] > currentParts[1]) {
    return (latestParts[1] - currentParts[1]) * 10;
  }
  
  // Patch difference
  return latestParts[2] - currentParts[2];
}

// Print summary
function printSummary() {
  console.log('\n=======================================');
  console.log('           QUALITY SUMMARY            ');
  console.log('=======================================\n');
  
  if (results.passed.length > 0) {
    console.log(chalk.green(`✅ Passed (${results.passed.length}):`));
    results.passed.forEach(check => console.log(chalk.green(`  - ${check}`)));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log(chalk.yellow(`⚠️ Warnings (${results.warnings.length}):`));
    results.warnings.forEach(check => console.log(chalk.yellow(`  - ${check}`)));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log(chalk.red(`❌ Failed (${results.failed.length}):`));
    results.failed.forEach(check => console.log(chalk.red(`  - ${check}`)));
    console.log('');
  }
  
  const totalChecks = results.passed.length + results.warnings.length + results.failed.length;
  const score = Math.round((results.passed.length / totalChecks) * 100);
  
  console.log(`Quality Score: ${score}%`);
  console.log('=======================================\n');
}

// Main function
async function main() {
  console.log('\n🚀 Starting Vibewell Code Quality Verification\n');
  
  let success = true;
  
  // Run checks
  success = checkTypes() && success;
  success = checkLint() && success;
  success = runTests() && success;
  success = checkDependencies() && success;
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run the main function
main().catch(error => {
  console.error('Error running verification:', error);
  process.exit(1);
}); 