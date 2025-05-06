#!/usr/bin/env node

/**
 * Documentation Verification Script
 * 
 * This script verifies documentation references by:
 * 1. Checking for broken links between documentation files
 * 2. Verifying that referenced files exist in the codebase
 * 3. Detecting outdated references to implementation details
 * 
 * Usage:
 *   node scripts/verify-documentation.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  docsDir: path.join(process.cwd(), 'docs'),
  ignoreDirs: [
    'node_modules',
    '.next',
    'build',
    'dist',
    'coverage',
  ],
  fileExtensions: ['.md', '.mdx'],
};

// Parse command line arguments
const args = process.argv.slice(2);
const isCiMode = args.includes('--ci');
const isVerbose = args.includes('--verbose');
const shouldScan = args.includes('--scan-only');

// Collect all documentation files
function getAllDocFiles() {
  let docFiles = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !CONFIG.ignoreDirs.includes(file)) {
        scanDirectory(filePath);
      } else if (
        stat.isFile() && 
        CONFIG.fileExtensions.includes(path.extname(file).toLowerCase())
      ) {
        docFiles.push(filePath);
      }
    });
  }
  
  scanDirectory(CONFIG.docsDir);
  return docFiles;
}

// Extract links from markdown content
function extractLinks(content) {
  const links = [];
  
  // Match Markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      isExternal: match[2].startsWith('http') || match[2].startsWith('www'),
    });
  }
  
  // Match bare file references like `file.md` or `path/to/file.md`
  const fileRefRegex = /`([^`]+\.md[^`]*)`/g;
  
  while ((match = fileRefRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[1],
      isExternal: false,
    });
  }
  
  return links;
}

// Verify that a linked file exists
function verifyFileReference(link, fromFile) {
  if (link.isExternal) {
    // Skip external links for now
    return { valid: true, link, fromFile };
  }
  
  // Normalize the URL to a file path
  let filePath = link.url;
  
  // Handle relative paths
  if (!path.isAbsolute(filePath)) {
    filePath = path.join(path.dirname(fromFile), filePath);
  }
  
  // Remove URL fragments
  filePath = filePath.split('#')[0];
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return { valid: false, link, fromFile, reason: 'File not found' };
  }
  
  return { valid: true, link, fromFile };
}

// Verify implementation references
function verifyImplementationReferences(content, filePath) {
  const issues = [];
  
  // Look for references to implementation files and verify they exist
  const implementationRegex = /(src\/\S+\.[jt]sx?)/g;
  let match;
  
  while ((match = implementationRegex.exec(content)) !== null) {
    const implementationPath = path.join(CONFIG.rootDir, match[1]);
    
    if (!fs.existsSync(implementationPath)) {
      issues.push({
        type: 'missingImplementation',
        path: match[1],
        docFile: filePath,
      });
    }
  }
  
  return issues;
}

// Check for outdated Redis documentation
function checkRedisDocumentation(docFiles) {
  const issues = [];
  const redisClientPath = path.join(CONFIG.rootDir, 'src', 'lib', 'redis-client.ts');
  
  if (!fs.existsSync(redisClientPath)) {
    return [{ type: 'missingFile', path: redisClientPath }];
  }
  
  const redisClientContent = fs.readFileSync(redisClientPath, 'utf-8');
  
  // Check documentation for references to Redis implementation
  docFiles.forEach(docFile => {
    if (docFile.includes('redis') || docFile.includes('Redis')) {
      const docContent = fs.readFileSync(docFile, 'utf-8');
      
      // Check if the documentation includes code samples that don't match implementation
      if (docContent.includes('RedisClient') || docContent.includes('redis-client')) {
        // Look for code blocks in the documentation
        const codeBlockRegex = /```(typescript|javascript|tsx|jsx|js|ts)\s+([\s\S]+?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(docContent)) !== null) {
          const codeBlock = match[2];
          
          // Check if the code block references Redis implementation
          if (codeBlock.includes('RedisClient') || codeBlock.includes('redis-client')) {
            // Perform basic verification that method signatures match
            const methodRegex = /async\s+(\w+)\s*\(/g;
            let methodMatch;
            
            while ((methodMatch = methodRegex.exec(codeBlock)) !== null) {
              const methodName = methodMatch[1];
              
              // Skip common method names that might not be specific to our implementation
              if (['constructor', 'connect', 'disconnect'].includes(methodName)) {
                continue;
              }
              
              // Check if the method exists in the actual implementation
              if (!redisClientContent.includes(`async ${methodName}(`)) {
                issues.push({
                  type: 'outdatedRedisMethod',
                  method: methodName,
                  docFile,
                  codeBlock: codeBlock.substring(0, 100) + '...',
                });
              }
            }
          }
        }
      }
    }
  });
  
  return issues;
}

// Main verification function
function verifyDocumentation({ verbose, scanOnly, ciMode, outputResults }) {
  console.log('Starting documentation verification...');
  
  const docFiles = getAllDocFiles();
  console.log(`Found ${docFiles.length} documentation files`);
  
  let brokenLinks = [];
  let implementationIssues = [];
  
  // Check each documentation file
  docFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(content);
    
    // Verify links
    links.forEach(link => {
      const result = verifyFileReference(link, file);
      if (!result.valid) {
        brokenLinks.push(result);
      }
    });
    
    // Verify implementation references
    const impIssues = verifyImplementationReferences(content, file);
    implementationIssues = implementationIssues.concat(impIssues);
  });
  
  // Check Redis documentation specifically
  const redisIssues = checkRedisDocumentation(docFiles);
  
  // Generate report
  console.log('\nDocumentation Verification Report');
  console.log('================================\n');
  
  // Broken links
  console.log(`Found ${brokenLinks.length} broken links:`);
  if (brokenLinks.length > 0) {
    brokenLinks.forEach(brokenLink => {
      console.log(`- [${brokenLink.link.text}](${brokenLink.link.url}) in ${path.relative(CONFIG.rootDir, brokenLink.fromFile)}`);
    });
  } else {
    console.log('No broken links found!');
  }
  
  console.log('');
  
  // Implementation issues
  console.log(`Found ${implementationIssues.length} implementation reference issues:`);
  if (implementationIssues.length > 0) {
    implementationIssues.forEach(issue => {
      console.log(`- Reference to non-existent file: ${issue.path} in ${path.relative(CONFIG.rootDir, issue.docFile)}`);
    });
  } else {
    console.log('No implementation reference issues found!');
  }
  
  console.log('');
  
  // Redis issues
  console.log(`Found ${redisIssues.length} Redis documentation issues:`);
  if (redisIssues.length > 0) {
    redisIssues.forEach(issue => {
      if (issue.type === 'missingFile') {
        console.log(`- Redis client implementation file not found: ${issue.path}`);
      } else if (issue.type === 'outdatedRedisMethod') {
        console.log(`- Outdated Redis method reference: ${issue.method} in ${path.relative(CONFIG.rootDir, issue.docFile)}`);
        console.log(`  Code: ${issue.codeBlock}`);
      }
    });
  } else {
    console.log('No Redis documentation issues found!');
  }
  
  console.log('');
  
  // Summary
  const totalIssues = brokenLinks.length + implementationIssues.length + redisIssues.length;
  if (totalIssues > 0) {
    console.log(`Found ${totalIssues} documentation issues to fix.`);
    if (ciMode) {
      process.exitCode = 1;
    }
  } else {
    console.log('Documentation verification completed successfully!');
    if (ciMode) {
      process.exitCode = 0;
    }
  }
  
  if (scanOnly) {
    return;
  }
  
  if (outputResults) {
    outputResults(docFiles.length, brokenLinks);
  }
}

// Run the verification
verifyDocumentation({
  verbose: isVerbose,
  scanOnly: shouldScan,
  ciMode: isCiMode,
  outputResults: null
}); 