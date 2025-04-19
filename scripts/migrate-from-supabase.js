#!/usr/bin/env node

/**
 * Supabase to Prisma Migration Helper
 * 
 * This script helps identify and migrate Supabase client usage to Prisma in the codebase.
 * It scans for Supabase imports and suggests replacements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 Scanning for Supabase usage in codebase...\n');

// Find all files with Supabase imports
try {
  const supabaseImports = execSync(`grep -r "from .*supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src`, { encoding: 'utf-8' });
  
  console.log('📋 Files with Supabase imports:');
  console.log(supabaseImports);
  
  console.log('\n📊 Summary of findings:');
  const lines = supabaseImports.split('\n').filter(Boolean);
  console.log(`- Found ${lines.length} files with Supabase imports`);
  
  // Count deprecated imports
  const deprecatedImports = lines.filter(line => 
    line.includes('@/lib/supabase/client') || 
    line.includes('@/lib/supabase/index') || 
    line.includes('@/lib/supabase/config')
  );
  
  console.log(`- ${deprecatedImports.length} files import from deprecated paths`);
  console.log(`- ${lines.length - deprecatedImports.length} files import directly from @supabase/supabase-js\n`);
  
  // Check for environment variables
  const envLocal = fs.existsSync(path.join(process.cwd(), '.env.local')) 
    ? fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8')
    : '';
    
  const envProd = fs.existsSync(path.join(process.cwd(), '.env.production')) 
    ? fs.readFileSync(path.join(process.cwd(), '.env.production'), 'utf-8')
    : '';
    
  const hasSupabaseEnvVars = 
    envLocal.includes('NEXT_PUBLIC_SUPABASE_URL') || 
    envProd.includes('NEXT_PUBLIC_SUPABASE_URL');
    
  if (hasSupabaseEnvVars) {
    console.log('⚠️ Found Supabase environment variables that can be removed after migration is complete');
  }
  
  // Check Prisma setup
  const hasPrismaSchema = fs.existsSync(path.join(process.cwd(), 'prisma/schema.prisma'));
  if (!hasPrismaSchema) {
    console.log('❌ Prisma schema not found. Run `npx prisma init` to create it.');
  } else {
    console.log('✅ Prisma schema found.');
  }
  
  // Print migration steps
  console.log('\n📝 Next steps for migration:');
  console.log('1. Update imports:');
  console.log('   - Replace: import { supabase } from \'@/lib/supabase/client\';');
  console.log('   - With:    import { prisma } from \'@/lib/database/client\';');
  console.log('\n2. Update query patterns:');
  console.log('   - Replace: const { data, error } = await supabase.from(\'users\').select(\'*\').eq(\'id\', userId);');
  console.log('   - With:    const user = await prisma.user.findUnique({ where: { id: userId } });');
  console.log('\n3. Run `npx prisma generate` to ensure Prisma client is up-to-date');
  console.log('\n4. Remove Supabase environment variables when migration is complete\n');
  
  // Check if compatibility layer is imported
  const usesCompatLayer = execSync(`grep -r "from '@/lib/database/client'" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src | grep -i "supabase"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  
  if (usesCompatLayer) {
    console.log('⚠️ Some files are using the compatibility layer. These should be updated to use Prisma directly.');
  }
  
} catch (error) {
  if (error.status === 1) {
    console.log('✅ No Supabase imports found. Migration might be complete!');
  } else {
    console.error('❌ Error scanning codebase:', error.message);
  }
}

console.log('\n📚 For detailed migration instructions, see MIGRATION-GUIDE.md');
console.log('🐞 For troubleshooting help, see TROUBLESHOOTING-GUIDE.md\n'); 