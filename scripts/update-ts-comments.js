#!/usr/bin/env node

/**
 * Script to update TypeScript comment directives in the codebase
 * 
 * This script scans the codebase for TypeScript directives like @ts-ignore
 * and updates them to use more specific directives like @ts-expect-error
 * with explanatory comments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to exclude
const EXCLUDED_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];

// Comment patterns to look for
const TS_IGNORE_PATTERN = /\/\/\s*@ts-ignore/g;
const TS_NOCHECK_PATTERN = /\/\/\s*@ts-nocheck/g;

/**
 * Convert @ts-ignore to @ts-expect-error with a reason
 * @param {string} content - The file content
 * @returns {string} - Updated content
 */
function replaceIgnoreWithExpectError(content) {
  return content.replace(
    TS_IGNORE_PATTERN,
    (match) => {
      // Check if there's already a comment after the directive
      const hasComment = match.includes('-');
      if (hasComment) {
        return match.replace('@ts-ignore', '@ts-expect-error');
      }
      return '// @ts-expect-error - Temporarily suppressing type error, needs review';
    }
  );
}

/**
 * Add comments to @ts-nocheck to explain why it's necessary
 * @param {string} content - The file content
 * @param {string} filePath - The path of the file
 * @returns {string} - Updated content
 */
function addCommentsToNocheck(content, filePath) {
  return content.replace(
    TS_NOCHECK_PATTERN,
    (match) => {
      // Check if there's already a comment after the directive
      const hasComment = match.includes('-');
      if (hasComment) {
        return match;
      }
      
      // Add a specific comment based on file type/path
      if (filePath.includes('test-utils')) {
        return '// @ts-nocheck - Test utilities with complex types that need proper typing';
      } else if (filePath.includes('__tests__')) {
        return '// @ts-nocheck - Test file with complex mocking requiring proper typing';
      } else {
        return '// @ts-nocheck - Temporarily disabled type checking, needs refactoring';
      }
    }
  );
}

/**
 * Process a file to update TypeScript directives
 * @param {string} filePath - The path of the file to process
 */
function processFile(filePath) {
  // Only process TypeScript and JavaScript files
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;
    
    // Replace @ts-ignore with @ts-expect-error
    if (content.match(TS_IGNORE_PATTERN)) {
      updated = replaceIgnoreWithExpectError(updated);
      console.log(`Updated @ts-ignore in ${filePath}`);
    }
    
    // Add comments to @ts-nocheck
    if (content.match(TS_NOCHECK_PATTERN)) {
      updated = addCommentsToNocheck(updated, filePath);
      console.log(`Updated @ts-nocheck in ${filePath}`);
    }
    
    // Write back if changes were made
    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Recursively scan a directory for files
 * @param {string} dir - The directory to scan
 */
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        scanDir(filePath);
      }
    } else {
      processFile(filePath);
    }
  }
}

/**
 * Main function
 */
function main() {
  const rootDir = process.argv[2] || process.cwd();
  console.log(`Scanning directory: ${rootDir}`);
  
  scanDir(rootDir);
  console.log('Finished updating TypeScript directives');
}

main(); 