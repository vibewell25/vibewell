#!/usr/bin/env node

/**
 * Cleanup Supabase Files and References
 * 
 * This script removes the Supabase directory and any remaining references
 * after the migration to Prisma is complete.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🧹 Starting Supabase cleanup...\n');

// Directories to remove
const directoriesToRemove = [
  'src/lib/supabase',
  'supabase'
];

// Create backups of directories before removing
directoriesToRemove.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📦 Creating backup of ${dir}...`);
    
    // Create a backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', `${timestamp}`);
    
    // Create backup directory if it doesn't exist
    fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Copy the directory to the backup location
    try {
      execSync(`cp -r "${fullPath}" "${backupDir}/"`);
      console.log(`✅ Backup created at backups/${timestamp}/${path.basename(dir)}`);
    } catch (error) {
      console.error(`❌ Error creating backup of ${dir}:`, error.message);
    }
    
    // Remove the directory
    console.log(`🗑️ Removing ${dir}...`);
    try {
      execSync(`rm -rf "${fullPath}"`);
      console.log(`✅ Removed ${dir}`);
    } catch (error) {
      console.error(`❌ Error removing ${dir}:`, error.message);
    }
  } else {
    console.log(`⚠️ Directory ${dir} does not exist, skipping.`);
  }
});

// Check if there are any remaining Supabase imports in the codebase
console.log('\n🔍 Checking for remaining Supabase imports...');

try {
  const result = execSync(
    'grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "supabase" src || true',
    { encoding: 'utf8' }
  );
  
  if (result.trim()) {
    console.log('⚠️ Found remaining Supabase references:');
    console.log(result);
    console.log('\n⚠️ Please update these files to use Prisma instead.');
  } else {
    console.log('✅ No remaining Supabase imports found.');
  }
} catch (error) {
  console.error('❌ Error checking for Supabase imports:', error.message);
}

// Mark migration scripts as deprecated
const migrationScripts = [
  'scripts/migrate-remaining-supabase.js',
  'scripts/remove-supabase-env-vars.js'
];

migrationScripts.forEach(scriptPath => {
  const fullPath = path.join(process.cwd(), scriptPath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📝 Marking ${scriptPath} as deprecated...`);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const updatedContent = `/**
 * DEPRECATED: This script is no longer needed as migration is complete.
 * Keeping for historical reference only.
 */\n\n${content}`;
      
      fs.writeFileSync(fullPath, updatedContent);
      console.log(`✅ ${scriptPath} marked as deprecated`);
    } catch (error) {
      console.error(`❌ Error updating ${scriptPath}:`, error.message);
    }
  } else {
    console.log(`⚠️ Script ${scriptPath} does not exist, skipping.`);
  }
});

console.log('\n✅ Supabase cleanup completed!\n');
console.log('To complete the migration:');
console.log('1. Make sure all remaining Supabase references are updated');
console.log('2. Run tests to ensure everything works correctly');
console.log('3. Update documentation to remove Supabase references\n'); 