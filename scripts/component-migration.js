#!/usr/bin/env node

/**
 * Component Migration Script
 * 
 * This script helps identify and migrate component usages across the codebase.
 * It can be used to:
 * 1. Scan the codebase for component usages
 * 2. Generate a report of component usages
 * 3. Automatically update import paths (with --fix flag)
 * 
 * Usage:
 *   node scripts/component-migration.js --scan
 *   node scripts/component-migration.js --report
 *   node scripts/component-migration.js --fix
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  componentsToMigrate: [
    {
      name: 'Button',
      oldPaths: [
        'components/ui/Button',
        'src/components/Button',
        'src/components/ui/button',
        'src/components/base/Button/Button',
        'src/components/common/Button'
      ],
      newPath: '@/components/ui/Button',
    },
    {
      name: 'Input',
      oldPaths: [
        'components/ui/Input',
        'src/components/common/Input',
        'src/components/ui/input',
        'src/components/base/Input/Input'
      ],
      newPath: '@/components/ui/Input',
    },
    {
      name: 'Card',
      oldPaths: [
        'components/ui/Card',
        'src/components/Card',
        'src/components/ui/card',
        'src/components/common/Card',
      ],
      newPath: '@/components/ui/Card',
    },
    {
      name: 'Checkbox',
      oldPaths: [
        'components/ui/Checkbox',
        'src/components/ui/checkbox',
        'src/components/common/Checkbox',
      ],
      newPath: '@/components/ui/Checkbox',
    },
    {
      name: 'Select',
      oldPaths: [
        'components/ui/Select',
        'src/components/ui/select',
        'src/components/common/Select',
      ],
      newPath: '@/components/ui/Select',
    }
  ],
  excludeDirs: [
    'node_modules',
    '.next',
    'build',
    'dist',
    'coverage',
  ],
  fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
};

/**
 * Scans the codebase for component usages
 */
function scanComponentUsages() {
  console.log('Scanning for component usages...');
  
  const results = {};
  
  CONFIG.componentsToMigrate.forEach(component => {
    results[component.name] = {
      usages: [],
      importPaths: new Set(),
    };
    
    // Use grep to find component usages
    component.oldPaths.forEach(oldPath => {
      try {
        const grepCmd = `grep -r "from ['\\"].*${oldPath}.*['\\"]" --include="*.{tsx,jsx,ts,js}" ${CONFIG.rootDir} | grep -v "node_modules" | grep -v ".next"`;
        const output = execSync(grepCmd, { encoding: 'utf-8' });
        
        if (output) {
          const lines = output.split('\n').filter(Boolean);
          
          lines.forEach(line => {
            const [file, match] = line.split(':', 2);
            const relativeFile = path.relative(CONFIG.rootDir, file);
            
            if (match && !CONFIG.excludeDirs.some(dir => relativeFile.startsWith(dir))) {
              // Extract the import path
              const importPathMatch = match.match(/from\s+(['"])(.*?)\1/);
              const importPath = importPathMatch ? importPathMatch[2] : null;
              
              if (importPath) {
                results[component.name].usages.push({
                  file: relativeFile,
                  importPath,
                  line: match.trim(),
                });
                
                results[component.name].importPaths.add(importPath);
              }
            }
          });
        }
      } catch (error) {
        // Grep might return non-zero exit code if no matches found
        if (!error.message.includes('No such file or directory')) {
          console.error(`Error scanning for ${oldPath}:`, error.message);
        }
      }
    });
    
    // Convert Set to Array for easier serialization
    results[component.name].importPaths = Array.from(results[component.name].importPaths);
  });
  
  // Write results to a JSON file
  fs.writeFileSync(
    path.join(CONFIG.rootDir, 'component-migration-scan.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('Scan complete. Results saved to component-migration-scan.json');
  
  return results;
}

/**
 * Generates a report of component usages
 */
function generateReport(results) {
  if (!results) {
    try {
      results = JSON.parse(
        fs.readFileSync(path.join(CONFIG.rootDir, 'component-migration-scan.json'), 'utf-8')
      );
    } catch (error) {
      console.error('Error reading scan results. Run --scan first.');
      process.exit(1);
    }
  }
  
  console.log('\nComponent Migration Report');
  console.log('=========================\n');
  
  let totalUsages = 0;
  
  Object.keys(results).forEach(componentName => {
    const component = results[componentName];
    const usagesCount = component.usages.length;
    totalUsages += usagesCount;
    
    console.log(`${componentName}: ${usagesCount} usages found`);
    
    if (component.importPaths.length > 0) {
      console.log('Import paths:');
      component.importPaths.forEach(importPath => {
        console.log(`  - ${importPath}`);
      });
    }
    
    console.log('');
  });
  
  console.log(`Total: ${totalUsages} component usages to migrate`);
  console.log('\nRun with --fix to automatically update import paths');
}

/**
 * Fixes component import paths across the codebase
 */
function fixImportPaths(results) {
  if (!results) {
    try {
      results = JSON.parse(
        fs.readFileSync(path.join(CONFIG.rootDir, 'component-migration-scan.json'), 'utf-8')
      );
    } catch (error) {
      console.error('Error reading scan results. Run --scan first.');
      process.exit(1);
    }
  }
  
  console.log('Updating component import paths...');
  
  let updateCount = 0;
  const updatedFiles = new Set();
  
  CONFIG.componentsToMigrate.forEach(component => {
    const componentResults = results[component.name];
    
    if (!componentResults || !componentResults.usages) {
      console.log(`No usages found for ${component.name}`);
      return;
    }
    
    componentResults.usages.forEach(usage => {
      const filePath = path.join(CONFIG.rootDir, usage.file);
      
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        const oldImportRegex = new RegExp(`from\\s+(['"])(${usage.importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\1`, 'g');
        
        const updatedContent = content.replace(oldImportRegex, `from $1${component.newPath}$1`);
        
        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
          updatedFiles.add(usage.file);
          updateCount++;
        }
      } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
      }
    });
  });
  
  console.log(`Updated ${updateCount} import statements in ${updatedFiles.size} files`);
}

/**
 * Add deprecation warnings to old component files
 */
function addDeprecationWarnings() {
  console.log('Adding deprecation warnings to old component files...');
  
  CONFIG.componentsToMigrate.forEach(component => {
    component.oldPaths.forEach(oldPath => {
      // Skip paths that start with @
      if (oldPath.startsWith('@')) return;
      
      const fullPath = path.join(CONFIG.rootDir, `${oldPath}.tsx`);
      
      if (fs.existsSync(fullPath)) {
        try {
          let content = fs.readFileSync(fullPath, 'utf-8');
          
          // Only add warning if it doesn't already exist
          if (!content.includes('@deprecated')) {
            const deprecationComment = `/**
 * @deprecated This component is deprecated. Use the standardized ${component.name} component from '${component.newPath}' instead.
 * This is maintained for backwards compatibility only.
 */\n\n`;
            
            // Add after any existing imports
            const lines = content.split('\n');
            let lastImportIndex = -1;
            
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].trim().startsWith('import ')) {
                lastImportIndex = i;
              }
            }
            
            if (lastImportIndex >= 0) {
              lines.splice(lastImportIndex + 1, 0, deprecationComment);
              content = lines.join('\n');
            } else {
              content = deprecationComment + content;
            }
            
            fs.writeFileSync(fullPath, content);
            console.log(`Added deprecation warning to ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error updating ${fullPath}:`, error.message);
        }
      }
    });
  });
  
  console.log('Finished adding deprecation warnings');
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--scan')) {
    const results = scanComponentUsages();
    generateReport(results);
  } else if (args.includes('--report')) {
    generateReport();
  } else if (args.includes('--fix')) {
    const results = scanComponentUsages();
    fixImportPaths(results);
    addDeprecationWarnings();
  } else {
    console.log('Usage:');
    console.log('  node scripts/component-migration.js --scan   # Scan for component usages');
    console.log('  node scripts/component-migration.js --report # Generate a report');
    console.log('  node scripts/component-migration.js --fix    # Fix import paths');
  }
}

main(); 