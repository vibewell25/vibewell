#!/usr/bin/env node

/**
 * Script to run all codemod transformations across the codebase
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPTS_DIR = path.resolve(__dirname);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Get all transform scripts
const transformScripts = fs.readdirSync(SCRIPTS_DIR)
  .filter(file => file.endsWith('-transform.js'))
  .map(file => path.join(SCRIPTS_DIR, file));

console.log(`Found ${transformScripts.length} transform scripts to run`);

// Define the directories to run transforms on
const directories = [
  'src/components',
  'src/contexts',
  'src/hooks',
  'src/lib',
  'src/middleware',
  'src/utils',
  'src/services',
  'src/config',
];

// Loop through each transform script
transformScripts.forEach(script => {
  const scriptName = path.basename(script);
  console.log(`\nRunning transform: ${scriptName}`);
  
  // Run each script on each directory
  directories.forEach(dir => {
    const targetDir = path.join(PROJECT_ROOT, dir);
    try {
      // Skip if directory doesn't exist
      if (!fs.existsSync(targetDir)) {
        console.log(`  Skipping ${dir} (directory does not exist)`);
        return;
      }
      
      console.log(`  Transforming files in ${dir}...`);
      
      // Run jscodeshift with different patterns depending on transform type
      if (scriptName.includes('hook')) {
        // For hooks, target tsx/ts files related to hooks
        execSync(`npx jscodeshift --extensions=tsx,ts -t ${script} "${targetDir}/**/use*.{ts,tsx}"`, 
          { stdio: 'inherit' });
      } else if (scriptName.includes('context') || scriptName.includes('function')) {
        // For contexts/functions, target all .tsx/.ts files
        execSync(`npx jscodeshift --extensions=tsx,ts -t ${script} "${targetDir}/**/*.{ts,tsx}"`, 
          { stdio: 'inherit' });
      } else if (scriptName.includes('import')) {
        // For import fixes, target test files
        execSync(`npx jscodeshift --extensions=tsx,ts -t ${script} "${targetDir}/**/*.test.{ts,tsx}" "${targetDir}/**/*.spec.{ts,tsx}"`, 
          { stdio: 'inherit' });
      } else {
        // Default: transform all TypeScript files
        execSync(`npx jscodeshift --extensions=tsx,ts -t ${script} "${targetDir}/**/*.{ts,tsx}"`, 
          { stdio: 'inherit' });
      }
    } catch (error) {
      console.error(`  Error transforming ${dir} with ${scriptName}:`, error.message);
    }
  });
});

console.log('\nAll transformations complete!');
console.log('Remember to run tests to verify the fixes were applied correctly.'); 