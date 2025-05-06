#!/usr/bin/env node

/**
 * fix-integer-overflow.js
 * 
 * This script scans the codebase for potential integer overflow vulnerabilities
 * and either applies fixes automatically or suggests fixes for manual review.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Directories to scan (relative to project root)
  scanDirs: ['apps/web/src', 'packages'],
  
  // Files to exclude
  excludePaths: [
    'node_modules',
    '.next',
    'dist',
    'coverage',
    'test',
    '__tests__',
    '*.test.ts',
    '*.test.tsx',
    '*.spec.ts',
    '*.spec.tsx',
  ],
  
  // Risk patterns to look for
  patterns: {
    // Arithmetic operations at risk of overflow
    arithmeticOverflow: [
      // Multiplication without safety checks
      /(\w+)\s*\*\s*(\w+)/g,
      // Addition without safety checks
      /(\w+)\s*\+\s*(\w+)/g,
      // Left shift without safety checks
      /(\w+)\s*<<\s*(\w+)/g,
    ],
    
    // Unsafe type conversions
    unsafeConversions: [
      // Parse string to int without bounds checking
      /parseInt\(([^,)]+)(,\s*\d+)?\)/g,
      // Number constructor
      /Number\(([^)]+)\)/g,
      // Unary plus operator
      /\+([a-zA-Z_]\w*)/g,
    ],
    
    // Array length issues
    arrayLengthIssues: [
      // Array access without bounds checking
      /(\w+)(\[\w+\])/g,
      // Loop over array without bounds checking
      /for\s*\(\s*(?:let|var|const)?\s*(\w+)\s*=\s*\d+\s*;\s*\1\s*<\s*([^;]+)\.length\s*;/g,
    ],
  }
};

// Risk levels
const RISK_LEVELS = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

// Counters
const stats = {
  filesScanned: 0,
  risksFound: 0,
  autoFixed: 0,
  manualReviewNeeded: 0,
};

// Fixes that need manual review
const manualReviewNeeded = [];

// Get the project root directory
const projectRoot = execSync('git rev-parse --show-toplevel').toString().trim();

// Start the scan
console.log('🔍 Starting Integer Overflow Protection Scan');
console.log('===========================================');

// Scan each directory
CONFIG.scanDirs.forEach(dir => {
  scanDirectory(path.join(projectRoot, dir));
});

// Print summary
console.log('\n📊 Scan Summary');
console.log('===========================================');
console.log(`Files scanned: ${stats.filesScanned}`);
console.log(`Potential risks found: ${stats.risksFound}`);
console.log(`Auto-fixed: ${stats.autoFixed}`);
console.log(`Manual review needed: ${stats.manualReviewNeeded}`);

// Print manual review items
if (manualReviewNeeded.length > 0) {
  console.log('\n⚠️ Items Needing Manual Review');
  console.log('===========================================');
  manualReviewNeeded.forEach((item, idx) => {
    console.log(`\n${idx + 1}) ${item.file}:${item.line}`);
    console.log(`   Risk Level: ${item.riskLevel}`);
    console.log(`   Issue: ${item.issue}`);
    console.log(`   Code: ${item.code.trim()}`);
    console.log(`   Suggestion: ${item.suggestion}`);
  });
}

/**
 * Scan a directory recursively for files to check
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
      } else if (entry.isFile() && isRelevantFile(entry.name)) {
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
      // Handle glob patterns like *.test.ts
      const extension = exclude.slice(1);
      return filePath.endsWith(extension);
    }
    return filePath.includes(exclude);
  });
}

/**
 * Check if a file is relevant for scanning
 */
function isRelevantFile(fileName) {
  return /\.(js|jsx|ts|tsx)$/.test(fileName);
}

/**
 * Scan a file for potential integer overflow issues
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let modifiedContent = content;
    
    stats.filesScanned++;
    
    // Check each line for issues
    lines.forEach((line, idx) => {
      const lineNumber = idx + 1;
      
      // Check arithmetic operations
      CONFIG.patterns.arithmeticOverflow.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          stats.risksFound++;
          
          const op1 = match[1];
          const op2 = match[2];
          const operationType = match[0].includes('*') ? 'multiplication' : 
                               match[0].includes('+') ? 'addition' :
                               match[0].includes('<<') ? 'bit shift' : 'operation';
          
          // Determine if we can auto-fix
          const isSafelyFixable = isSimpleExpression(op1) && isSimpleExpression(op2);
          
          if (isSafelyFixable && isNumericVariable(op1, line) && isNumericVariable(op2, line)) {
            // Auto-fix with safe math utility
            const replacement = getSafeOperation(match[0], operationType);
            modifiedContent = modifiedContent.replace(match[0], replacement);
            modified = true;
            stats.autoFixed++;
          } else {
            // Add to manual review list
            manualReviewNeeded.push({
              file: filePath,
              line: lineNumber,
              riskLevel: operationType === 'multiplication' ? RISK_LEVELS.HIGH : RISK_LEVELS.MEDIUM,
              issue: `Potential integer overflow in ${operationType}`,
              code: line,
              suggestion: `Consider using a safe math utility: ${getSafeOperation(match[0], operationType)}`
            });
            stats.manualReviewNeeded++;
          }
        });
      });
      
      // Check unsafe conversions
      CONFIG.patterns.unsafeConversions.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          stats.risksFound++;
          
          // Determine conversion type
          const conversionType = match[0].startsWith('parseInt') ? 'parseInt' :
                               match[0].startsWith('Number') ? 'Number constructor' :
                               'unary plus';
          
          // Determine if auto-fixable
          const isSafelyFixable = conversionType === 'parseInt' || conversionType === 'Number constructor';
          
          if (isSafelyFixable) {
            // Auto-fix with safe conversion utility
            const replacement = getSafeConversion(match[0], conversionType);
            modifiedContent = modifiedContent.replace(match[0], replacement);
            modified = true;
            stats.autoFixed++;
          } else {
            // Add to manual review list
            manualReviewNeeded.push({
              file: filePath,
              line: lineNumber,
              riskLevel: RISK_LEVELS.MEDIUM,
              issue: `Potentially unsafe numeric conversion using ${conversionType}`,
              code: line,
              suggestion: `Consider using a safe conversion utility: ${getSafeConversion(match[0], conversionType)}`
            });
            stats.manualReviewNeeded++;
          }
        });
      });
      
      // Check array length issues
      CONFIG.patterns.arrayLengthIssues.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          // Only flag array access patterns if they're simple
          if (pattern.toString().includes('\\[\\w+\\]') && isLikelySafe(match[0])) {
            return;
          }
          
          stats.risksFound++;
          
          // Determine array issue type
          const issueType = match[0].includes('for') ? 'loop bounds check' : 'array access';
          
          // Add to manual review list (these often need context to fix properly)
          manualReviewNeeded.push({
            file: filePath,
            line: lineNumber,
            riskLevel: RISK_LEVELS.MEDIUM,
            issue: `Missing bounds check in ${issueType}`,
            code: line,
            suggestion: getSafeArrayAccess(match[0], issueType)
          });
          stats.manualReviewNeeded++;
        });
      });
    });
    
    // Write back fixed content if needed
    if (modified) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`✅ Fixed issues in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Check if an expression is simple enough to safely auto-fix
 */
function isSimpleExpression(expr) {
  return /^[a-zA-Z_]\w*$/.test(expr.trim()) || /^\d+$/.test(expr.trim());
}

/**
 * Check if a variable is likely numeric based on context
 */
function isNumericVariable(expr, context) {
  // Numbers are always numeric
  if (/^\d+$/.test(expr.trim())) return true;
  
  // Check for common numeric variable patterns
  const numericPatterns = [
    `let ${expr}\\s*=\\s*\\d+`,
    `const ${expr}\\s*=\\s*\\d+`,
    `var ${expr}\\s*=\\s*\\d+`,
    `${expr}\\s*=\\s*\\d+`,
    `${expr}\\s*:\\s*number`,
    `${expr}: \\d+`,
  ];
  
  return numericPatterns.some(pattern => new RegExp(pattern).test(context));
}

/**
 * Determine if an array access is likely safe based on common patterns
 */
function isLikelySafe(code) {
  // Array accesses inside standard for-loops with a clear bound are generally safe
  if (/for\s*\(.+;\s*i\s*<\s*\w+\.length\s*;/.test(code)) return true;
  
  // Accesses with optional chaining are likely safe
  if (code.includes('?.')) return true;
  
  // Accesses with a defensive check are likely safe
  if (/if\s*\(\s*\w+(\.\w+)*\s*(&&|\?)/.test(code)) return true;
  
  return false;
}

/**
 * Get safe operation replacement
 */
function getSafeOperation(expr, type) {
  switch (type) {
    case 'multiplication':
      return `safeMath.multiply(${expr.split('*')[0].trim()}, ${expr.split('*')[1].trim()})`;
    case 'addition':
      return `safeMath.add(${expr.split('+')[0].trim()}, ${expr.split('+')[1].trim()})`;
    case 'bit shift':
      return `safeMath.shiftLeft(${expr.split('<<')[0].trim()}, ${expr.split('<<')[1].trim()})`;
    default:
      return `/* Review this operation */ ${expr}`;
  }
}

/**
 * Get safe conversion replacement
 */
function getSafeConversion(expr, type) {
  switch (type) {
    case 'parseInt':
      const match = expr.match(/parseInt\(([^,)]+)(,\s*\d+)?\)/);
      const radix = match[2] ? match[2] : ', 10';
      return `safeConversion.toInteger(${match[1]}${radix})`;
    case 'Number constructor':
      return `safeConversion.toNumber(${expr.match(/Number\(([^)]+)\)/)[1]})`;
    case 'unary plus':
      return `safeConversion.toNumber(${expr.slice(1)})`;
    default:
      return `/* Review this conversion */ ${expr}`;
  }
}

/**
 * Get suggestion for safe array access
 */
function getSafeArrayAccess(expr, type) {
  if (type === 'loop bounds check') {
    return `Add bounds checking: for (...) { if (i >= 0 && i < array.length) { ... } }`;
  }
  return `Add bounds checking: if (index >= 0 && index < array.length) { ${expr} }`;
} 