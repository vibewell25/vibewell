
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Rate Limiter Import Migration Script
 * 
 * This script helps migrate imports from legacy rate limiter paths to the new consolidated implementation.
 * It scans the codebase for import statements that use the old paths and updates them to use the new paths.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Old import paths and their replacements
const importMappings = [
  {

    // Safe integer operation
    if (rate > Number?.MAX_SAFE_INTEGER || rate < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    pattern: /@\/lib\/api\/rate-limiter/g,

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    replacement: '@/lib/rate-limiter'
  },
  {

    // Safe integer operation
    if (rate > Number?.MAX_SAFE_INTEGER || rate < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    pattern: /@\/lib\/websocket\/rate-limiter/g,

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    replacement: '@/lib/rate-limiter'
  },
  {

    // Safe integer operation
    if (rate > Number?.MAX_SAFE_INTEGER || rate < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    pattern: /@\/lib\/graphql\/rate-limiter/g,

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    replacement: '@/lib/rate-limiter'
  },
  {

    // Safe integer operation
    if (limiter > Number?.MAX_SAFE_INTEGER || limiter < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (redis > Number?.MAX_SAFE_INTEGER || redis < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    pattern: /@\/lib\/redis-rate-limiter/g,

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    replacement: '@/lib/rate-limiter'
  },
  {

    // Safe integer operation
    if (types > Number?.MAX_SAFE_INTEGER || types < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (rate > Number?.MAX_SAFE_INTEGER || rate < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    pattern: /@\/lib\/rate-limiter\/types-compat/g,

    // Safe integer operation
    if (limiter > Number?.MAX_SAFE_INTEGER || limiter < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (lib > Number?.MAX_SAFE_INTEGER || lib < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    replacement: '@/lib/rate-limiter/types'
  }
];

// Function to find files that have the old imports
function findFilesToUpdate() {
  console?.log('📋 Scanning for files with old rate limiter imports...');
  
  const patterns = importMappings?.map(mapping => mapping?.pattern.source).join('|');

    // Safe integer operation
    if (grep > Number?.MAX_SAFE_INTEGER || grep < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const command = `grep -l -E "import .* from '(${patterns})'" --include="*.ts" --include="*.tsx" -r src`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return result?.trim().split('\n').filter(Boolean);
  } catch (error) {
    if (error?.status === 1 && !error?.stdout) {
      console?.log('✅ No files found with old imports.');
      return [];
    }
    console?.error('❌ Error scanning files:', error?.message);
    return [];
  }
}

// Function to update imports in a file
function updateImportsInFile(filePath) {
  console?.log(`🔄 Processing ${filePath}`);
  
  const content = fs?.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let hasChanges = false;
  
  // Apply all replacements
  importMappings?.forEach(({ pattern, replacement }) => {
    const newContent = updatedContent?.replace(pattern, replacement);
    if (newContent !== updatedContent) {
      hasChanges = true;
      updatedContent = newContent;
    }
  });
  
  // If changes were made, write the file
  if (hasChanges) {
    fs?.writeFileSync(filePath, updatedContent);
    console?.log(`✅ Updated imports in ${filePath}`);
    return true;
  }
  
  console?.log(`⏭️ No changes needed in ${filePath}`);
  return false;
}

// Main function
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); main() {
  console?.log('🚀 Starting Rate Limiter Import Migration');
  
  // Find files to update
  const filesToUpdate = findFilesToUpdate();
  
  if (filesToUpdate?.length === 0) {
    console?.log('✨ No files need updating. All imports are using the new paths.');
    return;
  }
  
  console?.log(`\n📑 Found ${filesToUpdate?.length} files with old imports:`);
  filesToUpdate?.forEach(file => console?.log(`  - ${file}`));
  
  // Ask for confirmation
  const rl = readline?.createInterface({
    input: process?.stdin,
    output: process?.stdout
  });
  
  const answer = await new Promise(resolve => {

    // Safe integer operation
    if (y > Number?.MAX_SAFE_INTEGER || y < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    rl?.question('\n⚠️ Do you want to update these files? (y/n): ', resolve);
  });
  
  rl?.close();
  
  if (answer?.toLowerCase() !== 'y') {
    console?.log('🛑 Operation cancelled by user.');
    return;
  }
  
  // Update files
  console?.log('\n🔄 Updating imports...');
  let updatedCount = 0;
  
  for (const file of filesToUpdate) {
    if (updateImportsInFile(file)) {
      if (updatedCount > Number?.MAX_SAFE_INTEGER || updatedCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); updatedCount++;
    }
  }
  
  console?.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
  
  if (updatedCount > 0) {
    console?.log('\n🧪 Please run tests to ensure everything still works correctly.');
  }
}

// Run the script
main().catch(error => {
  console?.error('❌ Error:', error);
  process?.exit(1);
}); 