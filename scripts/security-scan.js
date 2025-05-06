#!/usr/bin/env node

/**
 * security-scan.js
 * 
 * This script scans the codebase for potential security vulnerabilities,
 * including hardcoded credentials, insecure practices, and other security issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createHash } = require('crypto');

// ANSI color codes for terminal output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m'
};

// Configuration
const CONFIG = {
  // Directories to scan (relative to project root)
  scanDirs: ['apps', 'packages', 'src', 'lib', 'scripts'],
  
  // Files to exclude
  excludePaths: [
    'node_modules',
    '.next',
    'dist',
    'coverage',
    '.git',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '__snapshots__',
  ],
  
  // File extensions to scan
  fileExtensions: [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.yml', '.yaml', '.md',
    '.html', '.css', '.scss', '.sass', '.less', '.config.js', '.sh', '.bash'
  ],
  
  // Patterns to identify security vulnerabilities
  patterns: {
    // Hardcoded credentials
    hardcodedCredentials: [
      // API Keys
      { regex: /(['"`])(?:api|app)?(?:_|-)?(?:key|token|secret)(?:_|-)?[a-z0-9_-]*['"`]\s*:\s*(['"`])[a-zA-Z0-9_!@#$%^&*()-=+~.]+\2/gi, severity: 'HIGH', name: 'Hardcoded API Key/Token' },
      { regex: /(['"`])Authorization['"`]\s*:\s*(['"`])(?:bearer|token|api-key|apikey|basic)\s+[a-zA-Z0-9_!@#$%^&*()-=+~/\.,<>:;]+\2/gi, severity: 'HIGH', name: 'Hardcoded Authorization Header' },
      { regex: /(['"`])(?:access|refresh|session|auth)(?:_|-)?token['"`]\s*(?:=|:)\s*(['"`])[a-zA-Z0-9_!@#$%^&*()-=+~./]+\2/gi, severity: 'HIGH', name: 'Hardcoded Access Token' },
      
      // Passwords
      { regex: /(?:password|passwd|pwd|secret)(?:_|-)?[a-z0-9_-]*\s*[=:]\s*(['"`])[a-zA-Z0-9_!@#$%^&*()-=+~.]{6,}\1/gi, severity: 'HIGH', name: 'Hardcoded Password' },
      { regex: /['"`](?:password|passwd|pwd)['"`]\s*:\s*(['"`])[a-zA-Z0-9_!@#$%^&*()-=+~.]{6,}\1/gi, severity: 'HIGH', name: 'Hardcoded Password' },
      
      // AWS
      { regex: /(['"`])(?:aws)?_?(?:access_?key_?id|ACCESS_?KEY_?ID)['"`]\s*[=:]\s*(['"`])[A-Z0-9]{20}\2/gi, severity: 'CRITICAL', name: 'AWS Access Key ID' },
      { regex: /(['"`])(?:aws)?_?(?:secret_?access_?key|SECRET_?ACCESS_?KEY)['"`]\s*[=:]\s*['"`][A-Za-z0-9/+]{40}['"`]/gi, severity: 'CRITICAL', name: 'AWS Secret Access Key' },
      
      // Database
      { regex: /(?:mysql|postgres|postgresql|mongodb|mongo|db)(?:_|-)?(?:uri|url|connection(?:_|-)?string)\s*[=:]\s*(['"`])(?:mongodb(?:\+srv)?:|mysql:|postgresql:)[^\1]+\1/gi, severity: 'CRITICAL', name: 'Database Connection String' },
      
      // Webhook/callback URLs with tokens
      { regex: /https?:\/\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_/.?&=-]+token=[a-zA-Z0-9_!@#$%^&*()-=+~./]+/gi, severity: 'MEDIUM', name: 'URL with Token' },
      
      // Private Keys
      { regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH)? ?PRIVATE KEY( BLOCK)?-----[a-zA-Z0-9\s+/=]+-----END (?:RSA|DSA|EC|OPENSSH)? ?PRIVATE KEY( BLOCK)?-----/gm, severity: 'CRITICAL', name: 'Private Key' },
    ],
  
    // Insecure practices
    insecurePractices: [
      // Basic auth without HTTPS
      { regex: /http:\/\/[a-zA-Z0-9_-]+:[a-zA-Z0-9_!@#$%^&*()-=+~]+@/gi, severity: 'HIGH', name: 'Basic Auth without HTTPS' },
      
      // Insecure randomness
      { regex: /Math\.random\(\)/gi, severity: 'LOW', name: 'Use of Math.random() for security purposes' },
      
      // Commented security tokens
      { regex: /\/\/.*(?:key|token|secret|password|pwd|pass).*[a-zA-Z0-9_!@#$%^&*()-=+~./]{8,}/gi, severity: 'MEDIUM', name: 'Possible Commented Credential' },
    ],
    
    // Environment variable handling issues
    environmentIssues: [
      // Direct process.env in client-side code
      { regex: /process\.env\.(?!NODE_ENV|NEXT_PUBLIC_)[A-Z0-9_]+/gi, severity: 'MEDIUM', name: 'Direct process.env usage in client-side code' },
      
      // Missing validation
      { regex: /process\.env\.([A-Z0-9_]+)/g, severity: 'LOW', name: 'Potential missing env validation', transform: (match) => `process.env.${match[1]}` },
    ]
  }
};

// Risk levels
const RISK_LEVELS = {
  CRITICAL: { color: COLORS.RED + COLORS.BOLD, value: 4 },
  HIGH: { color: COLORS.RED, value: 3 },
  MEDIUM: { color: COLORS.YELLOW, value: 2 },
  LOW: { color: COLORS.CYAN, value: 1 },
  INFO: { color: COLORS.BLUE, value: 0 }
};

// Stats
const stats = {
  filesScanned: 0,
  issuesFound: 0,
  byRiskLevel: {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0
  }
};

// Issues found
const issues = [];

// Get project root directory
const projectRoot = execSync('git rev-parse --show-toplevel').toString().trim();

// Function to obfuscate the credential in the output while preserving length
function obfuscateCredential(credential) {
  if (!credential) return '';
  return credential.replace(/[a-zA-Z0-9]/g, (c) => {
    return /[0-9]/.test(c) ? '0' : /[A-Z]/.test(c) ? 'X' : 'x';
  });
}

// Create a unique hash for the issue (to avoid duplicates)
function createIssueHash(issue) {
  return createHash('md5')
    .update(`${issue.file}:${issue.line}:${issue.pattern}:${issue.match}`)
    .digest('hex');
}

// Start the scan
console.log(`${COLORS.BOLD}🔍 Starting Security Scan${COLORS.RESET}`);
console.log('===========================================');

// Scan each directory
CONFIG.scanDirs.forEach(dir => {
  const fullDir = path.join(projectRoot, dir);
  if (fs.existsSync(fullDir)) {
    scanDirectory(fullDir);
  }
});

// Sort issues by severity
issues.sort((a, b) => {
  return RISK_LEVELS[b.severity].value - RISK_LEVELS[a.severity].value;
});

// Print results
console.log('\n📊 Scan Summary');
console.log('===========================================');
console.log(`Files scanned: ${stats.filesScanned}`);
console.log(`Total issues found: ${stats.issuesFound}`);
console.log(`Issues by severity:`);
console.log(`  ${RISK_LEVELS.CRITICAL.color}CRITICAL: ${stats.byRiskLevel.CRITICAL}${COLORS.RESET}`);
console.log(`  ${RISK_LEVELS.HIGH.color}HIGH: ${stats.byRiskLevel.HIGH}${COLORS.RESET}`);
console.log(`  ${RISK_LEVELS.MEDIUM.color}MEDIUM: ${stats.byRiskLevel.MEDIUM}${COLORS.RESET}`);
console.log(`  ${RISK_LEVELS.LOW.color}LOW: ${stats.byRiskLevel.LOW}${COLORS.RESET}`);
console.log(`  ${RISK_LEVELS.INFO.color}INFO: ${stats.byRiskLevel.INFO}${COLORS.RESET}`);

// Print issues
if (issues.length > 0) {
  console.log('\n⚠️ Security Issues Detected');
  console.log('===========================================');
  issues.forEach((issue, idx) => {
    console.log(`\n${COLORS.BOLD}#${idx + 1} ${RISK_LEVELS[issue.severity].color}[${issue.severity}]${COLORS.RESET} ${COLORS.BOLD}${issue.name}${COLORS.RESET}`);
    console.log(`File: ${COLORS.GREEN}${issue.file}${COLORS.RESET}:${COLORS.YELLOW}${issue.line}${COLORS.RESET}`);
    console.log(`Description: ${issue.description}`);
    
    // Prepare the obfuscated match for display
    let displayMatch = issue.match;
    if (issue.name.includes('Hardcoded') || issue.name.includes('Credential') || issue.name.includes('Key') || issue.name.includes('Token')) {
      // Try to extract just the credential part for hardcoded credentials
      const credentialMatch = issue.match.match(/(['"`])[a-zA-Z0-9_!@#$%^&*()-=+~./]+\1/);
      if (credentialMatch) {
        const credential = credentialMatch[0].slice(1, -1); // Remove quotes
        displayMatch = issue.match.replace(credential, obfuscateCredential(credential));
      } else {
        displayMatch = obfuscateCredential(issue.match);
      }
    }
    
    console.log(`Code: ${displayMatch}`);
    console.log(`Recommendation: ${issue.recommendation}`);
  });
}

// Exit with appropriate code
if (stats.byRiskLevel.CRITICAL > 0 || stats.byRiskLevel.HIGH > 0) {
  console.log(`\n${COLORS.RED}${COLORS.BOLD}❌ Security scan failed due to CRITICAL or HIGH severity issues.${COLORS.RESET}`);
  process.exit(1);
} else if (stats.byRiskLevel.MEDIUM > 0) {
  console.log(`\n${COLORS.YELLOW}⚠️ Security scan completed with MEDIUM severity issues.${COLORS.RESET}`);
  process.exit(0);
} else {
  console.log(`\n${COLORS.GREEN}✅ Security scan completed successfully.${COLORS.RESET}`);
  process.exit(0);
}

/**
 * Recursively scan a directory for files to check
 */
function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip excluded paths
      if (shouldSkipPath(fullPath)) continue;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && shouldScanFile(entry.name)) {
        scanFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
}

/**
 * Check if a path should be skipped
 */
function shouldSkipPath(filePath) {
  return CONFIG.excludePaths.some(exclude => {
    if (exclude.startsWith('*')) {
      // Handle glob patterns
      const extension = exclude.slice(1);
      return filePath.endsWith(extension);
    }
    return filePath.includes(exclude);
  });
}

/**
 * Check if a file should be scanned based on its extension
 */
function shouldScanFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return CONFIG.fileExtensions.includes(ext) || 
         CONFIG.fileExtensions.some(e => fileName.endsWith(e));
}

/**
 * Get a relative path from the project root
 */
function getRelativePath(fullPath) {
  return path.relative(projectRoot, fullPath);
}

/**
 * Scan a file for security issues
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relPath = getRelativePath(filePath);
    
    stats.filesScanned++;
    
    // Check for hardcoded credentials
    Object.entries(CONFIG.patterns).forEach(([categoryKey, patterns]) => {
      patterns.forEach(pattern => {
        const regex = pattern.regex;
        let match;
        
        // Reset regex state
        regex.lastIndex = 0;
        
        while ((match = regex.exec(content)) !== null) {
          // Find the line number by counting newlines
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          const lineContent = lines[lineNumber - 1];
          
          // Skip test files (for certain patterns)
          if (
            (relPath.includes('/test/') || 
             relPath.includes('/__test__/') || 
             relPath.includes('/__mocks__/') || 
             relPath.includes('/fixtures/') ||
             relPath.includes('/examples/')) &&
            (pattern.name.includes('Hardcoded') || pattern.name.includes('Credential'))
          ) {
            // But still flag critical issues
            if (pattern.severity !== 'CRITICAL') {
              continue;
            }
          }
          
          // Skip commented-out code (for some patterns)
          if (
            (lineContent.trim().startsWith('//') || 
             lineContent.trim().startsWith('/*') ||
             lineContent.trim().startsWith('*')) &&
            (pattern.name.includes('Hardcoded') || pattern.name.includes('Credential'))
          ) {
            // But still flag critical issues
            if (pattern.severity !== 'CRITICAL') {
              continue;
            }
          }
          
          const matchedText = match[0];
          
          // Create issue
          const issue = {
            file: relPath,
            line: lineNumber,
            match: matchedText,
            pattern: pattern.name,
            name: pattern.name,
            severity: pattern.severity,
            category: categoryKey,
            description: getIssueDescription(categoryKey, pattern.name),
            recommendation: getRecommendation(categoryKey, pattern.name)
          };
          
          // Generate hash to prevent duplicates
          const issueHash = createIssueHash(issue);
          
          // Check if this issue already exists
          const issueExists = issues.some(i => createIssueHash(i) === issueHash);
          
          if (!issueExists) {
            issues.push(issue);
            stats.issuesFound++;
            stats.byRiskLevel[issue.severity]++;
          }
        }
      });
    });
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Get a description for an issue based on its category and pattern
 */
function getIssueDescription(category, patternName) {
  switch (category) {
    case 'hardcodedCredentials':
      return `Found potential hardcoded ${patternName.toLowerCase().replace('hardcoded ', '')} in the code. Hardcoded credentials are a serious security risk as they may be exposed in version control systems or to anyone with access to the code.`;
    
    case 'insecurePractices':
      switch (patternName) {
        case 'Use of Math.random() for security purposes':
          return 'Math.random() is not cryptographically secure and should not be used for security-related purposes like generating tokens, passwords, or session IDs.';
        case 'Basic Auth without HTTPS':
          return 'Basic authentication over HTTP (not HTTPS) sends credentials in base64 encoding which can be easily intercepted and decoded.';
        case 'Possible Commented Credential':
          return 'Commented-out code may contain sensitive credentials that could be exposed in version control systems.';
        default:
          return `Detected an insecure practice: ${patternName}`;
      }
    
    case 'environmentIssues':
      if (patternName.includes('Direct process.env usage')) {
        return 'Direct usage of process.env in client-side code can leak sensitive server environment variables to the client.';
      } else if (patternName.includes('missing env validation')) {
        return 'Environment variables are being used without validation, which could lead to undefined behavior if the variable is missing.';
      } else {
        return `Environment variable issue: ${patternName}`;
      }
    
    default:
      return `Security issue detected: ${patternName}`;
  }
}

/**
 * Get a recommendation for fixing an issue
 */
function getRecommendation(category, patternName) {
  switch (category) {
    case 'hardcodedCredentials':
      return 'Move the credential to environment variables and access it through process.env (server-side) or use a secure credential management system. For client-side code, only use public, non-sensitive values.';
    
    case 'insecurePractices':
      switch (patternName) {
        case 'Use of Math.random() for security purposes':
          return 'Use crypto.randomBytes() or crypto.randomUUID() for generating secure random values.';
        case 'Basic Auth without HTTPS':
          return 'Always use HTTPS for transmitting sensitive information. Consider using token-based authentication instead of basic auth.';
        case 'Possible Commented Credential':
          return 'Remove commented-out code containing credentials. Store credentials in environment variables or a secure credential store.';
        default:
          return 'Review and replace with secure alternatives following best practices.';
      }
    
    case 'environmentIssues':
      if (patternName.includes('Direct process.env usage')) {
        return 'Use NEXT_PUBLIC_ prefix for client-safe environment variables, or create a server API endpoint to retrieve sensitive data.';
      } else if (patternName.includes('missing env validation')) {
        return 'Add validation for environment variables at application startup to fail fast if required variables are missing.';
      } else {
        return 'Review environment variable usage and follow best practices.';
      }
    
    default:
      return 'Review and fix according to security best practices.';
  }
} 