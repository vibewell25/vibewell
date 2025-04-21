/**
 * Script to update imports across the codebase
 * This helps standardize imports to use the consolidated utilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define import mappings: old import → new import
const importMappings = [
  // Auth hook mappings
  {
    pattern: /import\s+(?:{[^}]*(?:useAuth|useAuthFromContext)[^}]*}\s+from\s+['"])@\/hooks\/useAuth['"]/g,
    replacement: match => match.replace('@/hooks/useAuth', '@/hooks/use-unified-auth')
  },
  {
    pattern: /import\s+(?:{[^}]*(?:useAuth|useAuthFromContext)[^}]*}\s+from\s+['"])@\/hooks\/use-auth['"]/g,
    replacement: match => match.replace('@/hooks/use-auth', '@/hooks/use-unified-auth')
  },
  {
    pattern: /import\s+(?:{[^}]*(?:useAuth|useAuthFromContext)[^}]*}\s+from\s+['"])@\/hooks\/unified-auth['"]/g,
    replacement: match => match.replace('@/hooks/unified-auth', '@/hooks/use-unified-auth')
  },
  {
    pattern: /import\s+(?:{[^}]*(?:useAuth|useAuthFromContext)[^}]*}\s+from\s+['"])@\/lib\/auth['"]/g,
    replacement: match => match.replace('@/lib/auth', '@/hooks/use-unified-auth')
  },
  {
    pattern: /import\s+(?:{[^}]*(?:useAuth|useAuthFromContext)[^}]*}\s+from\s+['"])@\/contexts\/auth-context['"]/g,
    replacement: match => match.replace('@/contexts/auth-context', '@/hooks/use-unified-auth')
  },
  
  // Form validation mappings
  {
    pattern: /import\s+(?:{[^}]*(?:validateForm|validateField)[^}]*}\s+from\s+['"])[^'"]*['"]/g,
    replacement: match => {
      if (match.includes('@/utils/form-validation')) {
        return match; // Already using the correct import
      }
      // Extract the imported functions
      const importPart = match.match(/import\s+({[^}]*})/)[1];
      return `import ${importPart} from '@/utils/form-validation'`;
    }
  },
  
  // API types mappings
  {
    pattern: /import\s+(?:{[^}]*(?:ApiResponse|ApiError|ApiVersion)[^}]*}\s+from\s+['"])[^'"]*['"]/g,
    replacement: match => {
      if (match.includes('@/types/api')) {
        return match; // Already using the correct import
      }
      // Extract the imported types
      const importPart = match.match(/import\s+({[^}]*})/)[1];
      return `import ${importPart} from '@/types/api'`;
    }
  }
];

/**
 * Update imports in a single file
 */
function updateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let fileChanged = false;
    
    importMappings.forEach(({ pattern, replacement }) => {
      const newContent = updatedContent.replace(pattern, replacement);
      if (newContent !== updatedContent) {
        fileChanged = true;
        updatedContent = newContent;
      }
    });
    
    if (fileChanged) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated imports in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Find all TypeScript/JavaScript files in the src directory
 */
function findFiles() {
  try {
    const result = execSync(
      `find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`,
      { encoding: 'utf8' }
    );
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

/**
 * Generate a report of the changes
 */
function generateReport(updatedFiles, totalFiles) {
  console.log('\n====== IMPORT UPDATE REPORT ======');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files updated: ${updatedFiles.length}`);
  console.log(`Percentage complete: ${Math.round((updatedFiles.length / totalFiles) * 100)}%`);
  
  console.log('\nUpdated files:');
  updatedFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  console.log('\nNext steps:');
  console.log('1. Verify the updates with "npm run test" or "yarn test"');
  console.log('2. Check for TypeScript errors with "npx tsc --noEmit"');
  console.log('3. Run the application to ensure functionality is preserved');
}

/**
 * Main function
 */
function main() {
  console.log('Starting import consolidation...\n');
  
  const files = findFiles();
  const updatedFiles = [];
  
  files.forEach(file => {
    const updated = updateImports(file);
    if (updated) {
      updatedFiles.push(file);
    }
  });
  
  generateReport(updatedFiles, files.length);
}

// Run the script
main(); 