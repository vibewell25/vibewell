#!/usr/bin/env node

/**
 * Dependency Manager Script for Vibewell
 * 
 * This script helps with:
 * 1. Checking for outdated dependencies
 * 2. Checking for security vulnerabilities
 * 3. Updating dependencies in a controlled manner
 * 4. Creating reports of dependency status
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configure workspaces
const WORKSPACES = ['apps/web', 'apps/mobile', 'apps/server'];
const ROOT_DIR = path.resolve(__dirname, '..');

// Create interface for command-line inputs
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Handle CLI arguments
const args = process.argv.slice(2);

if (args.includes('--generate-report')) {
  // Run report generation without prompting
  generateReport();
  process.exit(0);
} else if (args.includes('--check-outdated')) {
  // Check outdated dependencies for all workspaces
  checkOutdated();
  WORKSPACES.forEach(workspace => checkOutdated(workspace));
  process.exit(0);
} else if (args.includes('--check-vulnerabilities')) {
  // Check security vulnerabilities for all workspaces
  checkVulnerabilities();
  WORKSPACES.forEach(workspace => checkVulnerabilities(workspace));
  process.exit(0);
} else if (args.includes('--fix-vulnerabilities')) {
  // Fix vulnerabilities for all workspaces
  fixVulnerabilities();
  WORKSPACES.forEach(workspace => fixVulnerabilities(workspace));
  process.exit(0);
} else {
  // Show interactive menu if no arguments provided
  showMenu();
}

/**
 * Run a command and return the output
 */
function runCommand(command, cwd = ROOT_DIR) {
  try {
    return execSync(command, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.stdout ? error.stdout.toString() : error.message);
    return error.stdout ? error.stdout.toString() : '';
  }
}

/**
 * Check for outdated dependencies for a workspace
 */
function checkOutdated(workspacePath = null) {
  const cwd = workspacePath ? path.resolve(ROOT_DIR, workspacePath) : ROOT_DIR;
  const workspace = workspacePath || 'root';
  
  console.log(`\n===== Checking outdated packages in ${workspace} =====\n`);
  const result = runCommand('npm outdated --json', cwd);
  
  try {
    const outdated = JSON.parse(result);
    const outdatedCount = Object.keys(outdated).length;
    
    if (outdatedCount > 0) {
      console.log(`${outdatedCount} outdated packages found in ${workspace}:`);
      
      // Group by severity (major, minor, patch)
      const major = [];
      const minor = [];
      const patch = [];
      
      for (const [pkg, info] of Object.entries(outdated)) {
        if (info.current && info.latest) {
          const current = info.current.split('.');
          const latest = info.latest.split('.');
          
          if (current[0] !== latest[0]) {
            major.push(`${pkg}: ${info.current} → ${info.latest}`);
          } else if (current[1] !== latest[1]) {
            minor.push(`${pkg}: ${info.current} → ${info.latest}`);
          } else {
            patch.push(`${pkg}: ${info.current} → ${info.latest}`);
          }
        }
      }
      
      if (major.length > 0) {
        console.log('\nMajor updates (potentially breaking):');
        major.forEach(pkg => console.log(`- ${pkg}`));
      }
      
      if (minor.length > 0) {
        console.log('\nMinor updates (new features):');
        minor.forEach(pkg => console.log(`- ${pkg}`));
      }
      
      if (patch.length > 0) {
        console.log('\nPatch updates (bug fixes):');
        patch.forEach(pkg => console.log(`- ${pkg}`));
      }
    } else {
      console.log(`All packages are up to date in ${workspace}!`);
    }
  } catch (error) {
    console.log('No outdated packages found or error parsing output.');
  }
}

/**
 * Check for security vulnerabilities
 */
function checkVulnerabilities(workspacePath = null) {
  const cwd = workspacePath ? path.resolve(ROOT_DIR, workspacePath) : ROOT_DIR;
  const workspace = workspacePath || 'root';
  
  console.log(`\n===== Checking security vulnerabilities in ${workspace} =====\n`);
  const result = runCommand('npm audit --json', cwd);
  
  try {
    const audit = JSON.parse(result);
    const vulnerabilities = audit.vulnerabilities || {};
    const metadata = audit.metadata || {};
    
    if (metadata.vulnerabilities && metadata.vulnerabilities.total > 0) {
      console.log(`Found ${metadata.vulnerabilities.total} vulnerabilities in ${workspace}:`);
      console.log(`- Critical: ${metadata.vulnerabilities.critical || 0}`);
      console.log(`- High: ${metadata.vulnerabilities.high || 0}`);
      console.log(`- Moderate: ${metadata.vulnerabilities.moderate || 0}`);
      console.log(`- Low: ${metadata.vulnerabilities.low || 0}`);
      
      // Show details for critical and high
      console.log('\nCritical and high severity vulnerabilities:');
      Object.entries(vulnerabilities).forEach(([pkg, info]) => {
        if (info.severity === 'critical' || info.severity === 'high') {
          console.log(`- ${pkg}: ${info.severity} - ${info.title}`);
          console.log(`  Via: ${info.via.map(v => typeof v === 'string' ? v : v.name).join(', ')}`);
          if (info.fixAvailable) {
            console.log(`  Fix available: ${info.fixAvailable.name || 'Yes'}`);
          } else {
            console.log('  No direct fix available');
          }
          console.log();
        }
      });
    } else {
      console.log(`No vulnerabilities found in ${workspace}!`);
    }
  } catch (error) {
    console.log('No vulnerabilities found or error parsing output.');
  }
}

/**
 * Update dependencies with confirmation
 */
function updateDependencies(workspacePath = null, level = 'patch') {
  const cwd = workspacePath ? path.resolve(ROOT_DIR, workspacePath) : ROOT_DIR;
  const workspace = workspacePath || 'root';
  
  console.log(`\n===== Updating dependencies in ${workspace} (${level}) =====\n`);
  
  let updateCmd;
  if (level === 'patch') {
    updateCmd = 'npm update';
  } else if (level === 'minor') {
    updateCmd = 'npx npm-check-updates -u --target minor';
  } else if (level === 'major') {
    updateCmd = 'npx npm-check-updates -u';
  } else {
    console.error('Invalid update level. Use: patch, minor, or major');
    return;
  }
  
  // If not patch level, run npm-check-updates first, then install
  if (level !== 'patch') {
    console.log(`Running: ${updateCmd}`);
    const results = runCommand(updateCmd, cwd);
    console.log(results);
    
    console.log('Installing updated packages...');
    runCommand('npm install', cwd);
  } else {
    // For patch level, just run npm update
    console.log(`Running: ${updateCmd}`);
    const results = runCommand(updateCmd, cwd);
    console.log(results);
  }
  
  console.log(`\nDependency update completed for ${workspace}`);
}

/**
 * Fix security vulnerabilities
 */
function fixVulnerabilities(workspacePath = null) {
  const cwd = workspacePath ? path.resolve(ROOT_DIR, workspacePath) : ROOT_DIR;
  const workspace = workspacePath || 'root';
  
  console.log(`\n===== Fixing security vulnerabilities in ${workspace} =====\n`);
  
  // Try regular audit fix first
  const results = runCommand('npm audit fix', cwd);
  console.log(results);
  
  // Check if there are still vulnerabilities that require manual fixes
  const auditAfterFix = runCommand('npm audit --json', cwd);
  
  try {
    const audit = JSON.parse(auditAfterFix);
    const metadata = audit.metadata || {};
    
    if (metadata.vulnerabilities && metadata.vulnerabilities.total > 0) {
      console.log(`\nStill have ${metadata.vulnerabilities.total} vulnerabilities that require manual attention.`);
      console.log('Consider running: npm audit fix --force (with caution)');
    } else {
      console.log('\nAll vulnerabilities have been fixed!');
    }
  } catch (error) {
    console.log('Error analyzing remaining vulnerabilities.');
  }
}

/**
 * Generate a comprehensive report
 */
function generateReport() {
  const reportDir = path.resolve(ROOT_DIR, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.resolve(reportDir, `dependency-report-${new Date().toISOString().split('T')[0]}.md`);
  let reportContent = `# Dependency Status Report\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;
  
  // Add Node.js and npm versions
  reportContent += `## Environment\n\n`;
  reportContent += `- Node.js: ${process.version}\n`;
  reportContent += `- npm: ${runCommand('npm --version').trim()}\n\n`;
  
  // Check root and workspaces
  const allWorkspaces = ['root', ...WORKSPACES];
  
  for (const workspace of allWorkspaces) {
    const cwd = workspace === 'root' ? ROOT_DIR : path.resolve(ROOT_DIR, workspace);
    reportContent += `## ${workspace}\n\n`;
    
    // Add outdated info
    reportContent += `### Outdated Packages\n\n`;
    const outdatedResult = runCommand('npm outdated --json', cwd);
    try {
      const outdated = JSON.parse(outdatedResult);
      const outdatedCount = Object.keys(outdated).length;
      
      if (outdatedCount > 0) {
        reportContent += `${outdatedCount} outdated packages found.\n\n`;
        reportContent += `| Package | Current | Wanted | Latest |\n`;
        reportContent += `| ------- | ------- | ------ | ------ |\n`;
        
        for (const [pkg, info] of Object.entries(outdated)) {
          reportContent += `| ${pkg} | ${info.current || 'n/a'} | ${info.wanted || 'n/a'} | ${info.latest || 'n/a'} |\n`;
        }
      } else {
        reportContent += `All packages are up to date!\n`;
      }
    } catch (error) {
      reportContent += `Error analyzing outdated packages.\n`;
    }
    
    // Add vulnerability info
    reportContent += `\n### Security Vulnerabilities\n\n`;
    const auditResult = runCommand('npm audit --json', cwd);
    try {
      const audit = JSON.parse(auditResult);
      const metadata = audit.metadata || {};
      
      if (metadata.vulnerabilities && metadata.vulnerabilities.total > 0) {
        reportContent += `Found ${metadata.vulnerabilities.total} vulnerabilities:\n\n`;
        reportContent += `- Critical: ${metadata.vulnerabilities.critical || 0}\n`;
        reportContent += `- High: ${metadata.vulnerabilities.high || 0}\n`;
        reportContent += `- Moderate: ${metadata.vulnerabilities.moderate || 0}\n`;
        reportContent += `- Low: ${metadata.vulnerabilities.low || 0}\n\n`;
        
        if (Object.keys(audit.vulnerabilities || {}).length > 0) {
          reportContent += `| Package | Severity | Title | Fix Available |\n`;
          reportContent += `| ------- | -------- | ----- | ------------- |\n`;
          
          Object.entries(audit.vulnerabilities).forEach(([pkg, info]) => {
            const fix = info.fixAvailable ? (info.fixAvailable.name || 'Yes') : 'No';
            reportContent += `| ${pkg} | ${info.severity} | ${info.title} | ${fix} |\n`;
          });
        }
      } else {
        reportContent += `No vulnerabilities found!\n`;
      }
    } catch (error) {
      reportContent += `Error analyzing vulnerabilities.\n`;
    }
    
    reportContent += `\n`;
  }
  
  // Write report to file
  fs.writeFileSync(reportFile, reportContent);
  console.log(`Report generated at: ${reportFile}`);
}

/**
 * Main menu
 */
function showMenu() {
  console.log('\n===== Vibewell Dependency Manager =====');
  console.log('1. Check outdated dependencies');
  console.log('2. Check security vulnerabilities');
  console.log('3. Update dependencies');
  console.log('4. Fix security vulnerabilities');
  console.log('5. Generate comprehensive report');
  console.log('6. Exit');
  
  rl.question('\nSelect an option: ', (answer) => {
    switch (answer) {
      case '1':
        showWorkspaceMenu('check-outdated');
        break;
      case '2':
        showWorkspaceMenu('check-vulnerabilities');
        break;
      case '3':
        showWorkspaceMenu('update');
        break;
      case '4':
        showWorkspaceMenu('fix-vulnerabilities');
        break;
      case '5':
        generateReport();
        showMenu();
        break;
      case '6':
        rl.close();
        break;
      default:
        console.log('Invalid option');
        showMenu();
        break;
    }
  });
}

/**
 * Workspace selection menu
 */
function showWorkspaceMenu(action) {
  console.log('\n===== Select Workspace =====');
  console.log('0. All workspaces');
  console.log('1. Root project');
  
  WORKSPACES.forEach((workspace, index) => {
    console.log(`${index + 2}. ${workspace}`);
  });
  
  rl.question('\nSelect workspace: ', (answer) => {
    if (answer === '0') {
      // All workspaces
      if (action === 'check-outdated') {
        checkOutdated();
        WORKSPACES.forEach(workspace => checkOutdated(workspace));
      } else if (action === 'check-vulnerabilities') {
        checkVulnerabilities();
        WORKSPACES.forEach(workspace => checkVulnerabilities(workspace));
      } else if (action === 'update') {
        showUpdateLevelMenu('all');
      } else if (action === 'fix-vulnerabilities') {
        fixVulnerabilities();
        WORKSPACES.forEach(workspace => fixVulnerabilities(workspace));
      }
    } else if (answer === '1') {
      // Root project
      if (action === 'check-outdated') {
        checkOutdated();
      } else if (action === 'check-vulnerabilities') {
        checkVulnerabilities();
      } else if (action === 'update') {
        showUpdateLevelMenu(null);
      } else if (action === 'fix-vulnerabilities') {
        fixVulnerabilities();
      }
    } else {
      const workspaceIndex = parseInt(answer) - 2;
      if (workspaceIndex >= 0 && workspaceIndex < WORKSPACES.length) {
        const selectedWorkspace = WORKSPACES[workspaceIndex];
        if (action === 'check-outdated') {
          checkOutdated(selectedWorkspace);
        } else if (action === 'check-vulnerabilities') {
          checkVulnerabilities(selectedWorkspace);
        } else if (action === 'update') {
          showUpdateLevelMenu(selectedWorkspace);
        } else if (action === 'fix-vulnerabilities') {
          fixVulnerabilities(selectedWorkspace);
        }
      } else {
        console.log('Invalid workspace selection');
      }
    }
    
    // Return to main menu when done
    setTimeout(showMenu, 500);
  });
}

/**
 * Update level selection menu
 */
function showUpdateLevelMenu(workspace) {
  console.log('\n===== Select Update Level =====');
  console.log('1. Patch updates (bug fixes)');
  console.log('2. Minor updates (new features, no breaking changes)');
  console.log('3. Major updates (may include breaking changes)');
  
  rl.question('\nSelect update level: ', (answer) => {
    let level;
    if (answer === '1') {
      level = 'patch';
    } else if (answer === '2') {
      level = 'minor';
    } else if (answer === '3') {
      level = 'major';
    } else {
      console.log('Invalid selection, defaulting to patch updates');
      level = 'patch';
    }
    
    if (workspace === 'all') {
      updateDependencies(null, level);
      WORKSPACES.forEach(ws => updateDependencies(ws, level));
    } else {
      updateDependencies(workspace, level);
    }
  });
}

// Handle close
rl.on('close', () => {
  console.log('\nThank you for using the Dependency Manager!');
  process.exit(0);
}); 