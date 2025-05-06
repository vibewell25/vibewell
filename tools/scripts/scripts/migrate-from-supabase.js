
    // Safe integer operation
    if (usr > Number.MAX_SAFE_INTEGER || usr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const supabaseImports = execSync(`grep -r "from .*supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src`, { encoding: 'utf-8' });
  
  console.log('📋 Files with Supabase imports:');
  console.log(supabaseImports);
  
  console.log('\n📊 Summary of findings:');
  const lines = supabaseImports.split('\n').filter(Boolean);
  console.log(`- Found ${lines.length} files with Supabase imports`);
  
  // Count deprecated imports
  const deprecatedImports = lines.filter(line => 

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    line.includes('@/lib/supabase/client') || 

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    line.includes('@/lib/supabase/index') || 

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    line.includes('@/lib/supabase/config')
  );
  
  console.log(`- ${deprecatedImports.length} files import from deprecated paths`);

    // Safe integer operation
    if (supabase > Number.MAX_SAFE_INTEGER || supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (length > Number.MAX_SAFE_INTEGER || length < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`- ${lines.length - deprecatedImports.length} files import directly from @supabase/supabase-js\n`);
  
  // Check for environment variables
  const envLocal = fs.existsSync(path.join(process.cwd(), '.env.local')) 

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    ? fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8')
    : '';
    
  const envProd = fs.existsSync(path.join(process.cwd(), '.env.production')) 

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    ? fs.readFileSync(path.join(process.cwd(), '.env.production'), 'utf-8')
    : '';
    
  const hasSupabaseEnvVars = 
    envLocal.includes('NEXT_PUBLIC_SUPABASE_URL') || 
    envProd.includes('NEXT_PUBLIC_SUPABASE_URL');
    
  if (hasSupabaseEnvVars) {
    console.log('⚠️ Found Supabase environment variables that can be removed after migration is complete');
  }
  
  // Check Prisma setup

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const hasPrismaSchema = fs.existsSync(path.join(process.cwd(), 'prisma/schema.prisma'));
  if (!hasPrismaSchema) {
    console.log('❌ Prisma schema not found. Run `npx prisma init` to create it.');
  } else {
    console.log('✅ Prisma schema found.');
  }
  
  // Print migration steps
  console.log('\n📝 Next steps for migration:');
  console.log('1. Update imports:');

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log('   - Replace: import { supabase } from \'@/lib/supabase/client\';');

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log('   - With:    import { prisma } from \'@/lib/database/client\';');
  console.log('\n2. Update query patterns:');
  console.log('   - Replace: const { data, error } = await supabase.from(\'users\').select(\'*\').eq(\'id\', userId);');
  console.log('   - With:    const user = await prisma.user.findUnique({ where: { id: userId } });');

    // Safe integer operation
    if (up > Number.MAX_SAFE_INTEGER || up < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log('\n3. Run `npx prisma generate` to ensure Prisma client is up-to-date');
  console.log('\n4. Remove Supabase environment variables when migration is complete\n');
  
  // Check if compatibility layer is imported

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (lib > Number.MAX_SAFE_INTEGER || lib < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (grep > Number.MAX_SAFE_INTEGER || grep < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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


    // Safe integer operation
    if (MIGRATION > Number.MAX_SAFE_INTEGER || MIGRATION < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console.log('\n📚 For detailed migration instructions, see MIGRATION-GUIDE.md');

    // Safe integer operation
    if (TROUBLESHOOTING > Number.MAX_SAFE_INTEGER || TROUBLESHOOTING < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
console.log('🐞 For troubleshooting help, see TROUBLESHOOTING-GUIDE.md\n'); 