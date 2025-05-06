#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  filePatterns: ['**/*.{ts,tsx,js,jsx}'],
  excludePatterns: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  importMappings: [
    // State management imports
    { 
      pattern: /@\/utils\/state-manager/g, 
      replacement: '@/utils/state',
      description: 'Fix state manager imports'
    },
    // Component imports
    { 
      pattern: /['"]\.\.?\/(components|src\/components)\/ui\/([^'"]+)['"]/g, 
      replacement: (match, p1, p2) => `'@/components/ui/${p2}'`,
      description: 'Standardize UI component imports'
    },
    // Utils imports
    { 
      pattern: /['"]\.\.?\/(utils|src\/utils)\/([^'"]+)['"]/g, 
      replacement: (match, p1, p2) => `'@/utils/${p2}'`,
      description: 'Standardize utils imports'
    },
    // Types imports
    { 
      pattern: /['"]\.\.?\/(types|src\/types)\/([^'"]+)['"]/g, 
      replacement: (match, p1, p2) => `'@/types/${p2}'`,
      description: 'Standardize types imports'
    },
    // Shared imports
    {
      pattern: /['"]\.\.?\/shared\/([^'"]+)['"]/g,
      replacement: (match, p1) => `'@/shared/${p1}'`,
      description: 'Standardize shared imports'
    }
  ],
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  help: process.argv.includes('--help') || process.argv.includes('-h'),
};

// Help message
if (CONFIG.help) {
  console.log(`
  ${chalk.bold('Import Path Fixer')}
  
  Fix import paths according to our project standards.
  
  ${chalk.bold('Usage:')}
    node fix-imports.js [options]
  
  ${chalk.bold('Options:')}
    --dry-run      Show what would be changed without making changes
    --verbose      Show detailed logs
    --help, -h     Show this help message
  
  ${chalk.bold('Description:')}
    This script finds and fixes common import path issues:
    ${CONFIG.importMappings.map(m => `- ${m.description}`).join('\n    ')}
  `);
  process.exit(0);
}

// Statistics
const stats = {
  filesChecked: 0,
  filesChanged: 0,
  importsFixed: 0,
};

// Get files to process
const getFiles = () => {
  const patterns = CONFIG.filePatterns.map(pattern => path.join(CONFIG.rootDir, pattern));
  const ignore = CONFIG.excludePatterns;
  
  return glob.sync(patterns, { ignore });
};

// Process a file
const processFile = (filePath) => {
  try {
    stats.filesChecked++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let currentImportsFixes = 0;
    
    // Apply each import mapping
    CONFIG.importMappings.forEach(mapping => {
      const originalContent = content;
      content = content.replace(mapping.pattern, mapping.replacement);
      
      // Count changes
      if (content !== originalContent) {
        const matches = originalContent.match(mapping.pattern);
        if (matches) {
          currentImportsFixes += matches.length;
          hasChanges = true;
          
          if (CONFIG.verbose) {
            console.log(`  - Applied ${chalk.cyan(mapping.description)} in ${chalk.yellow(path.relative(CONFIG.rootDir, filePath))}`);
          }
        }
      }
    });
    
    // Write changes
    if (hasChanges) {
      stats.filesChanged++;
      stats.importsFixed += currentImportsFixes;
      
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      console.log(`${chalk.green('✓')} Fixed ${chalk.bold(currentImportsFixes)} imports in ${chalk.yellow(path.relative(CONFIG.rootDir, filePath))}`);
    }
  } catch (error) {
    console.error(`${chalk.red('✘')} Error processing ${chalk.yellow(path.relative(CONFIG.rootDir, filePath))}: ${error.message}`);
  }
};

// Main function
const main = () => {
  console.log(chalk.bold(`Import Path Fixer ${CONFIG.dryRun ? '(DRY RUN)' : ''}`));
  console.log(chalk.gray('Scanning for files...'));
  
  const files = getFiles();
  console.log(chalk.gray(`Found ${files.length} files to check`));
  
  files.forEach(file => {
    processFile(file);
  });
  
  console.log('\nSummary:');
  console.log(`${chalk.bold(stats.filesChecked)} files checked`);
  console.log(`${chalk.bold(stats.filesChanged)} files modified`);
  console.log(`${chalk.bold(stats.importsFixed)} imports fixed`);
  
  if (CONFIG.dryRun) {
    console.log(`\n${chalk.yellow('Note:')} This was a dry run. No changes were made. Run without --dry-run to apply changes.`);
  }
};

// Run the script
main(); 