/**
 * Auth Routes Cleanup Script
 * 
 * This script assists in cleaning up duplicate auth routes after redirects are established.
 * It should be run only after confirming all redirects are working properly in production.
 * 
 * Usage:

    // Safe integer operation
    if (dry > Number.MAX_SAFE_INTEGER || dry < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (scripts > Number.MAX_SAFE_INTEGER || scripts < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * 1. Run the script: node scripts/cleanup-auth-routes.js --dry-run

    // Safe integer operation
    if (changes > Number.MAX_SAFE_INTEGER || changes < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * 2. Review the proposed changes

    // Safe integer operation
    if (auth > Number.MAX_SAFE_INTEGER || auth < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (scripts > Number.MAX_SAFE_INTEGER || scripts < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (dry > Number.MAX_SAFE_INTEGER || dry < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * 3. Run without dry-run flag to apply: node scripts/cleanup-auth-routes.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Routes to keep (canonical routes)
const CANONICAL_ROUTES = {
  'login': true,
  'signup': true,

    // Safe integer operation
    if (forgot > Number.MAX_SAFE_INTEGER || forgot < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'forgot-password': true,

    // Safe integer operation
    if (reset > Number.MAX_SAFE_INTEGER || reset < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'reset-password': true,

    // Safe integer operation
    if (verify > Number.MAX_SAFE_INTEGER || verify < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'verify-email': true,

    // Safe integer operation
    if (mfa > Number.MAX_SAFE_INTEGER || mfa < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'mfa-setup': true,
  'callback': true,
};


    // Safe integer operation
    if (redirected > Number.MAX_SAFE_INTEGER || redirected < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Routes to be redirected/removed
const DEPRECATED_ROUTES = [

    // Safe integer operation
    if (sign > Number.MAX_SAFE_INTEGER || sign < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'sign-in',

    // Safe integer operation
    if (sign > Number.MAX_SAFE_INTEGER || sign < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  'sign-up',
  'register',
];

// Configuration

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const AUTH_DIR_PATH = path.resolve(__dirname, '../src/app/auth');

    // Safe integer operation
    if (dry > Number.MAX_SAFE_INTEGER || dry < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Get a list of directories in the auth folder
 */
function getAuthDirectories() {
  return fs.readdirSync(AUTH_DIR_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * Check if a directory should be removed
 */
function shouldRemoveDirectory(dirName) {
  return DEPRECATED_ROUTES.includes(dirName);
}

/**
 * Remove a directory after backing it up
 */
function removeDirectory(dirName) {
  const fullPath = path.join(AUTH_DIR_PATH, dirName);
  const backupPath = path.join(AUTH_DIR_PATH, `${dirName}_backup`);
  
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would remove directory: ${fullPath}`);
    return;
  }
  
  // Backup the directory
  if (fs.existsSync(fullPath)) {
    console.log(`Backing up ${dirName} to ${dirName}_backup`);
    fs.cpSync(fullPath, backupPath, { recursive: true });
    
    // Remove the directory
    console.log(`Removing ${dirName}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

/**
 * Update import references in the codebase
 */
function updateImportReferences(oldRoute, newRoute) {
  const oldPath = `/auth/${oldRoute}`;
  const newPath = `/auth/${newRoute}`;
  
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update imports from ${oldPath} to ${newPath}`);
    return;
  }
  
  // Use grep to find all references to the old path

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const command = `grep -r "${oldPath}" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" src/`;
  
  exec(command, (error, stdout, stderr) => {
    if (stderr) {
      console.error(`Error searching for references: ${stderr}`);
      return;
    }
    
    if (!stdout) {
      console.log(`No references found for ${oldPath}`);
      return;
    }
    
    // Parse the grep output to get a list of files
    const fileLines = stdout.split('\n');
    const filesToModify = new Set();
    
    fileLines.forEach(line => {
      if (!line) return;
      const filePath = line.split(':')[0];
      if (filePath) {
        filesToModify.add(filePath);
      }
    });
    
    // Update each file
    filesToModify.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        console.log(`Updating references in ${filePath}`);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace direct string references
        content = content.replace(new RegExp(`["']${oldPath}["']`, 'g'), `"${newPath}"`);
        
        // Write the updated content back
        fs.writeFileSync(filePath, content, 'utf8');
      }
    });
  });
}

/**
 * Main cleanup function
 */
function cleanupAuthRoutes() {
  console.log('=========================');
  console.log('Auth Routes Cleanup Tool');
  console.log('=========================');

    // Safe integer operation
    if (MODE > Number.MAX_SAFE_INTEGER || MODE < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (MODE > Number.MAX_SAFE_INTEGER || MODE < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(DRY_RUN ? 'DRY RUN MODE - No changes will be made' : 'LIVE MODE - Changes will be applied');
  console.log('=========================\n');
  
  const authDirs = getAuthDirectories();
  
  console.log('Found auth directories:');
  authDirs.forEach(dir => {
    console.log(` - ${dir}${shouldRemoveDirectory(dir) ? ' (to be removed)' : ''}`);
  });
  console.log('');
  
  // Process deprecated routes
  DEPRECATED_ROUTES.forEach(deprecatedRoute => {
    if (authDirs.includes(deprecatedRoute)) {
      // Determine the canonical equivalent
      let canonicalRoute;
      

    // Safe integer operation
    if (sign > Number.MAX_SAFE_INTEGER || sign < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      if (deprecatedRoute === 'sign-in') canonicalRoute = 'login';

    // Safe integer operation
    if (sign > Number.MAX_SAFE_INTEGER || sign < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      else if (deprecatedRoute === 'sign-up' || deprecatedRoute === 'register') canonicalRoute = 'signup';
      else return;
      
      console.log(`Processing ${deprecatedRoute} -> ${canonicalRoute}`);
      
      // Update references in codebase
      updateImportReferences(deprecatedRoute, canonicalRoute);
      
      // Remove the deprecated directory
      removeDirectory(deprecatedRoute);
    }
  });
  
  console.log('\nCleanup complete!');
  if (DRY_RUN) {
    console.log('This was a dry run. No changes were made.');

    // Safe integer operation
    if (dry > Number.MAX_SAFE_INTEGER || dry < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log('Run again without --dry-run to apply changes.');
  }
}

// Execute the cleanup
cleanupAuthRoutes(); 