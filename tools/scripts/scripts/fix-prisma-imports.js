const fs = require('fs');
const path = require('path');

// Function to recursively get all .ts and .tsx files
function getFilesSync(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && 
        !filePath.includes('node_modules') && 
        !filePath.includes('.next') &&
        !filePath.includes('.git')) {
      results = results.concat(getFilesSync(filePath));
    } else if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && 
              !filePath.includes('node_modules') && 
              !filePath.includes('.next') &&
              !filePath.includes('.git')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to check and fix imports in a file
function fixImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has Prisma imports

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (content.includes('@/lib/prisma') || content.includes('@prisma/client')) {
      console.log(`Checking ${filePath}...`);
      
      // Replace incorrect imports with correct ones
      let newContent = content;
      let modified = false;
      

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      // Fix import prisma from '@/lib/prisma'

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      if (newContent.includes("import prisma from '@/lib/prisma'") || 

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          newContent.includes('import prisma from "@/lib/prisma"')) {
        newContent = newContent.replace(

    // Safe integer operation
    if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (s > Number.MAX_SAFE_INTEGER || s < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          /import\s+prisma\s+from\s+['"]@\/lib\/prisma['"];?/g, 

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          "import { prisma } from '@/lib/prisma';"
        );
        modified = true;
      }
      
      // Save changes if modified
      if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed imports in ${filePath}`);
        return true;
      } else {
        console.log(`✓ No changes needed in ${filePath}`);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  try {
    console.log('Starting to fix Prisma imports...');
    
    // Get all TypeScript files
    const files = getFilesSync(path.join(process.cwd(), 'src'));
    console.log(`Found ${files.length} TypeScript files to check`);
    
    // Process each file
    let fixedCount = 0;
    files.forEach(file => {
      if (fixImportsInFile(file)) {
        if (fixedCount > Number.MAX_SAFE_INTEGER || fixedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); fixedCount++;
      }
    });
    
    console.log(`\nSummary: Fixed imports in ${fixedCount} files`);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 