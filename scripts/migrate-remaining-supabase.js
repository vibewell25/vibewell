#!/usr/bin/env node

/**
 * Supabase to Prisma Migration Helper - Automated Migration
 * 
 * This script automates the migration from Supabase to Prisma in the codebase.
 * It replaces Supabase imports with Prisma imports and updates query patterns.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 Starting automated Supabase to Prisma migration...\n');

// Find all files with Supabase imports
try {
  // Get all files that import from Supabase
  const supabaseImportFiles = execSync(
    `grep -r "from .*supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src | cut -d':' -f1 | sort | uniq`,
    { encoding: 'utf-8' }
  ).split('\n').filter(Boolean);
  
  console.log(`📋 Found ${supabaseImportFiles.length} files with Supabase imports\n`);
  
  let successCount = 0;
  let skippedCount = 0;
  
  // Process each file
  for (const filePath of supabaseImportFiles) {
    console.log(`Processing ${filePath}...`);
    
    try {
      // Read the file content
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      
      // Replace Supabase client imports
      if (content.includes('@supabase/supabase-js')) {
        console.log(`  - Replacing Supabase client imports`);
        content = content.replace(
          /import\s+{\s*createClient\s*}\s+from\s+['"]@supabase\/supabase-js['"]/g,
          `import { prisma } from '@/lib/database/client'`
        );
        modified = true;
      }
      
      // Replace local Supabase imports
      if (content.includes('from \'@/lib/supabase')) {
        console.log(`  - Replacing local Supabase imports`);
        content = content.replace(
          /import\s+{\s*supabase\s*}\s+from\s+['"]@\/lib\/supabase.*['"]/g,
          `import { prisma } from '@/lib/database/client'`
        );
        modified = true;
      }
      
      // Replace Supabase client initialization
      if (content.includes('createClient(') && 
          (content.includes('NEXT_PUBLIC_SUPABASE_URL') || 
           content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'))) {
        console.log(`  - Removing Supabase client initialization`);
        content = content.replace(
          /const\s+supabase\s+=\s+createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^)]*\);?/gs,
          ``
        );
        modified = true;
      }
      
      // Replace common Supabase query patterns
      if (content.includes('supabase.from(')) {
        console.log(`  - Updating Supabase query patterns`);
        
        // This is a simplistic replacement that works for basic cases
        // More complex queries will need manual attention
        
        // From: const { data, error } = await supabase.from('users').select('*').eq('id', userId);
        // To:   const users = await prisma.user.findMany({ where: { id: userId } });
        content = content.replace(
          /const\s+{\s*data(?::\s*([a-zA-Z0-9_]+))?\s*(?:,\s*error(?::\s*[a-zA-Z0-9_]+)?)?\s*}\s+=\s+await\s+supabase\s*\.\s*from\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)\s*\.\s*select\([^)]*\)\s*\.\s*eq\(\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*([^)]+)\)/g,
          (_, varName, table, column, value) => {
            const modelName = table.endsWith('s') ? table.slice(0, -1) : table;
            const dataVarName = varName || table;
            return `const ${dataVarName} = await prisma.${modelName}.findMany({ where: { ${column}: ${value} } })`;
          }
        );
        
        // From: const { data, error } = await supabase.from('users').select('*');
        // To:   const users = await prisma.user.findMany();
        content = content.replace(
          /const\s+{\s*data(?::\s*([a-zA-Z0-9_]+))?\s*(?:,\s*error(?::\s*[a-zA-Z0-9_]+)?)?\s*}\s+=\s+await\s+supabase\s*\.\s*from\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)\s*\.\s*select\([^)]*\)/g,
          (_, varName, table) => {
            const modelName = table.endsWith('s') ? table.slice(0, -1) : table;
            const dataVarName = varName || table;
            return `const ${dataVarName} = await prisma.${modelName}.findMany()`;
          }
        );
        
        // From: const { error } = await supabase.from('users').insert({ name: 'John' });
        // To:   await prisma.user.create({ data: { name: 'John' } });
        content = content.replace(
          /const\s+{\s*(?:data(?::\s*[a-zA-Z0-9_]+)?\s*,\s*)?error(?::\s*[a-zA-Z0-9_]+)?\s*}\s+=\s+await\s+supabase\s*\.\s*from\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)\s*\.\s*insert\(\s*(\{[^}]+\})\s*\)/g,
          (_, table, data) => {
            const modelName = table.endsWith('s') ? table.slice(0, -1) : table;
            return `await prisma.${modelName}.create({ data: ${data} })`;
          }
        );
        
        // From: const { error } = await supabase.from('users').update({ name: 'John' }).eq('id', userId);
        // To:   await prisma.user.update({ where: { id: userId }, data: { name: 'John' } });
        content = content.replace(
          /const\s+{\s*(?:data(?::\s*[a-zA-Z0-9_]+)?\s*,\s*)?error(?::\s*[a-zA-Z0-9_]+)?\s*}\s+=\s+await\s+supabase\s*\.\s*from\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)\s*\.\s*update\(\s*(\{[^}]+\})\s*\)\s*\.\s*eq\(\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*([^)]+)\)/g,
          (_, table, data, column, value) => {
            const modelName = table.endsWith('s') ? table.slice(0, -1) : table;
            return `await prisma.${modelName}.update({ where: { ${column}: ${value} }, data: ${data} })`;
          }
        );
        
        // From: const { error } = await supabase.from('users').delete().eq('id', userId);
        // To:   await prisma.user.delete({ where: { id: userId } });
        content = content.replace(
          /const\s+{\s*(?:data(?::\s*[a-zA-Z0-9_]+)?\s*,\s*)?error(?::\s*[a-zA-Z0-9_]+)?\s*}\s+=\s+await\s+supabase\s*\.\s*from\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)\s*\.\s*delete\(\s*\)\s*\.\s*eq\(\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*([^)]+)\)/g,
          (_, table, column, value) => {
            const modelName = table.endsWith('s') ? table.slice(0, -1) : table;
            return `await prisma.${modelName}.delete({ where: { ${column}: ${value} } })`;
          }
        );
        
        modified = true;
      }
      
      // Write back the modified content
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ Updated ${filePath}`);
        successCount++;
      } else {
        console.log(`  ⚠️ No changes made to ${filePath} - may need manual attention`);
        skippedCount++;
      }
    } catch (fileError) {
      console.error(`  ❌ Error processing ${filePath}:`, fileError.message);
      skippedCount++;
    }
    
    console.log('');
  }
  
  console.log(`\n📊 Migration summary:`);
  console.log(`- ${successCount} files updated successfully`);
  console.log(`- ${skippedCount} files skipped (need manual attention)`);
  console.log(`- ${supabaseImportFiles.length} total files processed\n`);
  
  // Find remaining Supabase environment variables
  const envFiles = ['.env.local', '.env.example', '.env.production', '.env.development'];
  
  console.log('🔍 Checking for Supabase environment variables...');
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const envContent = fs.readFileSync(file, 'utf-8');
      const supabaseVarsCount = (envContent.match(/SUPABASE|NEXT_PUBLIC_SUPABASE/g) || []).length;
      
      if (supabaseVarsCount > 0) {
        console.log(`  ⚠️ Found ${supabaseVarsCount} Supabase environment variables in ${file}`);
        console.log(`  To remove them, run: node scripts/remove-supabase-env-vars.js ${file}`);
      } else {
        console.log(`  ✅ No Supabase environment variables found in ${file}`);
      }
    }
  });
  
  console.log('\n📋 Next steps:');
  console.log('1. Manually review and update skipped files');
  console.log('2. Remove Supabase environment variables from .env files');
  console.log('3. Remove Supabase dependencies from package.json');
  console.log('4. Run tests to verify everything works correctly');
  console.log('5. Update documentation to remove Supabase references\n');
  
} catch (error) {
  console.error('❌ Error during migration process:', error);
  process.exit(1);
}

console.log('📚 For detailed migration instructions, see docs/supabase-to-prisma-migration.md\n'); 