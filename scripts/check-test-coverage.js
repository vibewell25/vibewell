#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to find all test files recursively
function findTestFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      results = results.concat(findTestFiles(filePath));
    } else if (
      (file.endsWith('.test.js') || 
       file.endsWith('.test.jsx') || 
       file.endsWith('.test.ts') || 
       file.endsWith('.test.tsx') || 
       file.endsWith('.spec.js') || 
       file.endsWith('.spec.jsx') || 
       file.endsWith('.spec.ts') || 
       file.endsWith('.spec.tsx'))
    ) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to find all component files recursively
function findComponentFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('__tests__')) {
      results = results.concat(findComponentFiles(filePath));
    } else if (
      (file.endsWith('.js') || 
       file.endsWith('.jsx') || 
       file.endsWith('.ts') || 
       file.endsWith('.tsx')) && 
      !file.includes('.test.') && 
      !file.includes('.spec.') &&
      !file.includes('.d.ts')
    ) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Main function
function main() {
  console.log('Checking test coverage...\n');
  
  // Find all test files
  const testFiles = findTestFiles('./src');
  console.log(`Found ${testFiles.length} test files.`);
  
  // Find all component files
  const srcPath = './src';
  const componentFiles = findComponentFiles(srcPath);
  console.log(`Found ${componentFiles.length} source files.\n`);
  
  // Calculate percentage
  const coverage = (testFiles.length / componentFiles.length * 100).toFixed(2);
  console.log(`Test file coverage: ${coverage}%\n`);
  
  // Group by directory
  const directoryMap = {};
  componentFiles.forEach(file => {
    const relativePath = file.replace(`${srcPath}/`, '');
    const directory = relativePath.split('/')[0];
    
    if (!directoryMap[directory]) {
      directoryMap[directory] = {
        total: 0,
        tested: 0
      };
    }
    
    directoryMap[directory].total++;
  });
  
  testFiles.forEach(file => {
    const relativePath = file.replace(`${srcPath}/`, '');
    const directory = relativePath.split('/')[0];
    
    if (directoryMap[directory]) {
      directoryMap[directory].tested++;
    }
  });
  
  // Print directory coverage
  console.log('Coverage by directory:');
  console.log('----------------------');
  
  Object.keys(directoryMap).sort().forEach(dir => {
    const { total, tested } = directoryMap[dir];
    const dirCoverage = (tested / total * 100).toFixed(2);
    console.log(`${dir}: ${dirCoverage}% (${tested}/${total})`);
  });
  
  console.log('\nTest files:');
  console.log('-----------');
  testFiles.forEach(file => {
    console.log(file.replace(`${process.cwd()}/`, ''));
  });
  
  console.log('\nUntested components (sample):');
  console.log('---------------------------');
  
  // Find components without test files
  const untestedComponents = componentFiles.filter(componentFile => {
    const baseName = path.basename(componentFile, path.extname(componentFile));
    return !testFiles.some(testFile => testFile.includes(`/${baseName}.test`));
  });
  
  // Show sample of 10 untested components
  untestedComponents.slice(0, 10).forEach(file => {
    console.log(file.replace(`${process.cwd()}/`, ''));
  });
  
  console.log(`\n...and ${untestedComponents.length - 10} more untested components.`);
  
  // Recommend components to test next
  console.log('\nRecommended components to test next:');
  console.log('----------------------------------');
  
  // Focus on UI components first
  const uiComponents = untestedComponents.filter(file => 
    file.includes('/components/ui/') || 
    file.includes('/components/form/') ||
    file.includes('/components/layout/')
  );
  
  // Show top 5 UI components to test
  uiComponents.slice(0, 5).forEach(file => {
    console.log(file.replace(`${process.cwd()}/`, ''));
  });
}

main(); 