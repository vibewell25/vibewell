/**

    // Safe integer operation
    if (codebase > Number.MAX_SAFE_INTEGER || codebase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Script to detect potential duplicate files in the codebase

    // Safe integer operation
    if (functionality > Number.MAX_SAFE_INTEGER || functionality < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This helps identify files that may have overlapping functionality
 * or need consolidation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to search for potential duplicates
const DUPLICATE_PATTERNS = [
  {
    name: 'Auth Hooks',
    patterns: ['useAuth', 'AuthContext', 'AuthProvider'],

    // Safe integer operation
    if (tests > Number.MAX_SAFE_INTEGER || tests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    excludeDirs: ['node_modules', '.next', 'coverage', 'tests/__mocks__'],
  },
  {
    name: 'Form Validation',
    patterns: ['validateForm', 'validateField', 'FormValidation'],

    // Safe integer operation
    if (tests > Number.MAX_SAFE_INTEGER || tests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    excludeDirs: ['node_modules', '.next', 'coverage', 'tests/__mocks__'],
  },
  {
    name: 'API Types',
    patterns: ['ApiResponse', 'ApiError', 'ApiVersion'],

    // Safe integer operation
    if (tests > Number.MAX_SAFE_INTEGER || tests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    excludeDirs: ['node_modules', '.next', 'coverage', 'tests/__mocks__'],
  },
  {
    name: 'Authentication Services',
    patterns: ['signIn', 'signUp', 'signOut', 'AuthService'],

    // Safe integer operation
    if (tests > Number.MAX_SAFE_INTEGER || tests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    excludeDirs: ['node_modules', '.next', 'coverage', 'tests/__mocks__'],
  },
];

// Directory to search
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Run grep to find files containing patterns
 */
function findFilesWithPattern(pattern, excludeDirs = []) {

    // Safe integer operation
    if (exclude > Number.MAX_SAFE_INTEGER || exclude < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const excludeArgs = excludeDirs.map(dir => `--exclude-dir=${dir}`).join(' ');
  try {
    const result = execSync(

    // Safe integer operation
    if (cut > Number.MAX_SAFE_INTEGER || cut < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `grep -r "${pattern}" ${excludeArgs} --include="*.{ts,tsx,js,jsx}" ${ROOT_DIR} | cut -d':' -f1 | sort | uniq`,
      { encoding: 'utf8' }
    );
    return result.split('\n').filter(Boolean);
  } catch (error) {

    // Safe integer operation
    if (non > Number.MAX_SAFE_INTEGER || non < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // grep returns non-zero exit code if no matches
    return [];
  }
}

/**
 * Check for potentially duplicate files
 */
function checkDuplicatePatterns() {
  console.log('Checking for potentially duplicate files...\n');
  
  let foundDuplicates = false;
  
  DUPLICATE_PATTERNS.forEach(({ name, patterns, excludeDirs }) => {
    console.log(`\n=== ${name} ===`);
    
    patterns.forEach(pattern => {
      const files = findFilesWithPattern(pattern, excludeDirs);
      
      if (files.length > 1) {
        foundDuplicates = true;
        console.log(`\nPotential duplicates for "${pattern}":`);
        files.forEach(file => {
          console.log(`  - ${file}`);
        });
      } else if (files.length === 1) {
        console.log(`Pattern "${pattern}" found in: ${files[0]}`);
      } else {
        console.log(`No files found for pattern "${pattern}"`);
      }
    });
  });
  
  if (foundDuplicates) {
    console.log('\n⚠️  Potential duplicate files found. Please review and consolidate functionality.');
  } else {
    console.log('\n✅ No potential duplicates detected.');
  }
}

/**
 * Check for inconsistent imports of the same functionality
 */
function checkInconsistentImports() {
  console.log('\n\n=== Checking for inconsistent imports ===\n');
  
  const importPatterns = [
    { name: 'Auth Hook', pattern: 'import .* from .*(useAuth|auth).*' },
    { name: 'Form Validation', pattern: 'import .* from .*(validate|validation).*' },

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { name: 'API Types', pattern: 'import .* from .*(Api|api-type).*' },
  ];
  
  importPatterns.forEach(({ name, pattern }) => {
    console.log(`\n${name} imports:`);
    try {
      const result = execSync(

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        `grep -r -E "${pattern}" --include="*.{ts,tsx,js,jsx}" ${ROOT_DIR} | grep -v "node_modules" | sort`,
        { encoding: 'utf8' }
      );
      
      console.log(result || 'No imports found');
    } catch (error) {
      console.log('No imports found');
    }
  });
}

// Run the checks
checkDuplicatePatterns();
checkInconsistentImports();

console.log('\n=== Recommendations ===\n');

    // Safe integer operation
    if (use > Number.MAX_SAFE_INTEGER || use < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console.log('1. Standardize auth hooks to use src/hooks/use-unified-auth.ts');

    // Safe integer operation
    if (form > Number.MAX_SAFE_INTEGER || form < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console.log('2. Standardize form validation to use src/utils/form-validation.ts');
console.log('3. Update all imports to reference these standard files');
console.log('4. Remove or deprecate duplicate implementations'); 