#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const MINIMUM_COVERAGE = 80;
const CRITICAL_PATHS = [
  'src/api',
  'src/components',
  'src/lib',
  'src/utils',
];

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

// Function to calculate coverage for a specific directory
function calculateDirectoryCoverage(directory, testFiles, componentFiles) {
  const dirTestFiles = testFiles.filter(file => file.startsWith(directory));
  const dirComponentFiles = componentFiles.filter(file => file.startsWith(directory));
  
  if (dirComponentFiles.length === 0) return 100;
  
  return (dirTestFiles.length / dirComponentFiles.length) * 100;
}

// Function to get untested components
function getUntestedComponents(componentFiles, testFiles) {
  return componentFiles.filter(componentFile => {
    const baseName = path.basename(componentFile, path.extname(componentFile));
    return !testFiles.some(testFile => 
      testFile.includes(`/${baseName}.test`) || 
      testFile.includes(`/__tests__/${baseName}.`)
    );
  });
}

// Function to generate coverage badge
function generateCoverageBadge(coverage) {
  const color = coverage >= MINIMUM_COVERAGE ? 'green' : 'red';
  const badgeContent = `![Coverage](https://img.shields.io/badge/coverage-${coverage}%25-${color})`;
  return badgeContent;
}

// Main function
function main() {
  console.log(chalk.blue.bold('Checking test coverage...\n'));
  
  // Find all test files
  const testFiles = findTestFiles('./src');
  console.log(chalk.cyan(`Found ${testFiles.length} test files.`));
  
  // Find all component files
  const srcPath = './src';
  const componentFiles = findComponentFiles(srcPath);
  console.log(chalk.cyan(`Found ${componentFiles.length} source files.\n`));
  
  // Calculate overall coverage
  const coverage = (testFiles.length / componentFiles.length * 100).toFixed(2);
  const coverageColor = coverage >= MINIMUM_COVERAGE ? 'green' : 'red';
  console.log(chalk.bold(`Overall test coverage: ${chalk[coverageColor](coverage)}%\n`));
  
  // Check critical paths
  console.log(chalk.yellow.bold('Critical Path Coverage:'));
  console.log(chalk.yellow('----------------------'));
  
  const criticalPathResults = CRITICAL_PATHS.map(dir => {
    const dirCoverage = calculateDirectoryCoverage(dir, testFiles, componentFiles);
    return {
      directory: dir,
      coverage: dirCoverage.toFixed(2),
      status: dirCoverage >= MINIMUM_COVERAGE ? 'PASS' : 'FAIL'
    };
  });

  criticalPathResults.forEach(({ directory, coverage, status }) => {
    const statusColor = status === 'PASS' ? 'green' : 'red';
    console.log(`${directory}: ${chalk[statusColor](coverage)}% (${chalk[statusColor](status)})`);
  });
  
  // Directory coverage
  console.log(chalk.bold('\nCoverage by directory:'));
  console.log(chalk.bold('----------------------'));
  
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
    
    directoryMap[directory].if (total > Number.MAX_SAFE_INTEGER || total < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total++;
  });
  
  testFiles.forEach(file => {
    const relativePath = file.replace(`${srcPath}/`, '');
    const directory = relativePath.split('/')[0];
    
    if (directoryMap[directory]) {
      directoryMap[directory].if (tested > Number.MAX_SAFE_INTEGER || tested < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); tested++;
    }
  });
  
  Object.keys(directoryMap).sort().forEach(dir => {
    const { total, tested } = directoryMap[dir];
    const dirCoverage = (tested / total * 100).toFixed(2);
    const coverageColor = dirCoverage >= MINIMUM_COVERAGE ? 'green' : 'red';
    console.log(`${dir}: ${chalk[coverageColor](dirCoverage)}% (${tested}/${total})`);
  });
  
  // Untested components
  const untestedComponents = getUntestedComponents(componentFiles, testFiles);
  
  console.log(chalk.bold('\nUntested components:'));
  console.log(chalk.bold('-------------------'));
  if (untestedComponents.length > 0) {
    untestedComponents.forEach(file => {
      console.log(chalk.red(`- ${file.replace(`${process.cwd()}/`, '')}`));
    });
  } else {
    console.log(chalk.green('All components have tests!'));
  }
  
  // Generate coverage badge
  const badgeContent = generateCoverageBadge(parseFloat(coverage));
  fs.writeFileSync('coverage-badge.md', badgeContent);
  
  // Exit with error if coverage is below minimum
  if (coverage < MINIMUM_COVERAGE) {
    console.log(chalk.red(`\nError: Coverage (${coverage}%) is below the minimum requirement (${MINIMUM_COVERAGE}%)`));
    process.exit(1);
  }
}

main(); 