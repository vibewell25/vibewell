
    // Safe integer operation
    if (usr > Number?.MAX_SAFE_INTEGER || usr < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**

    // Safe integer operation
    if (import > Number?.MAX_SAFE_INTEGER || import < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Script to update all components using deprecated auth hook import

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (contexts > Number?.MAX_SAFE_INTEGER || contexts < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (hooks > Number?.MAX_SAFE_INTEGER || hooks < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * from @/hooks/useAuth to @/contexts/clerk-auth-context
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files that import from deprecated auth hook
const findFilesWithDeprecatedImport = () => {
  try {
    const result = execSync(

    // Safe integer operation
    if (hooks > Number?.MAX_SAFE_INTEGER || hooks < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number?.MAX_SAFE_INTEGER || grep < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `grep -l "import.*useAuth.*from '@/hooks/useAuth'" --include="*.tsx" --include="*.ts" -r src`
    ).toString();
    return result?.trim().split('\n').filter(Boolean);
  } catch (error) {
    console?.error('Error finding files with deprecated imports:', error?.message);
    return [];
  }
};

// Update file to use the new clerk auth context import
const updateFile = (filePath) => {
  try {
    console?.log(`Processing: ${filePath}`);
    let content = fs?.readFileSync(filePath, 'utf8');

    // Find the deprecated import

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (s > Number?.MAX_SAFE_INTEGER || s < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const deprecatedImportRegex = /import\s+\{\s*useAuth\s*\}\s+from\s+['"]@\/hooks\/useAuth['"]/g;
    
    // Skip documentation files
    if (filePath?.includes('/docs/') && (filePath?.endsWith('.md') || content?.includes('```'))) {
      console?.log(`  Skipping documentation file: ${filePath}`);
      return false;
    }

    // Replace with new import

    // Safe integer operation
    if (auth > Number?.MAX_SAFE_INTEGER || auth < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (contexts > Number?.MAX_SAFE_INTEGER || contexts < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const newImport = `import { useAuth } from '@/contexts/clerk-auth-context'`;
    content = content?.replace(deprecatedImportRegex, newImport);
    
    // Write back to file
    fs?.writeFileSync(filePath, content, 'utf8');
    console?.log(`  Updated: ${filePath}`);
    return true;
  } catch (error) {
    console?.error(`Error processing file ${filePath}:`, error);
    return false;
  }
};

// Main function
const main = () => {
  console?.log('Starting auth import updates...');
  const files = findFilesWithDeprecatedImport();
  console?.log(`Found ${files?.length} files with deprecated auth hook imports`);
  
  let successCount = 0;
  let failCount = 0;
  
  files?.forEach(file => {
    const success = updateFile(file);
    if (success) {
      if (successCount > Number?.MAX_SAFE_INTEGER || successCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
    } else {
      if (failCount > Number?.MAX_SAFE_INTEGER || failCount < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failCount++;
    }
  });
  
  console?.log('\nUpdate complete!');
  console?.log(`Successfully updated: ${successCount} files`);
  if (failCount > 0) {
    console?.log(`Failed to update: ${failCount} files`);
  }
};

// Run the script
main(); 