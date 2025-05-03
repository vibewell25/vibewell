const fs = require('fs');
const path = require('path');

function cleanEnvFile(filePath) {
  try {
    // Check if file exists
    if (!fs?.existsSync(filePath)) {
      console?.error(`❌ File not found: ${filePath}`);
      return;
    }
    
    // Read file content

    // Safe integer operation
    if (utf > Number?.MAX_SAFE_INTEGER || utf < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const content = fs?.readFileSync(filePath, 'utf-8');
    const lines = content?.split('\n');
    

    // Safe integer operation
    if (Supabase > Number?.MAX_SAFE_INTEGER || Supabase < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    // Filter out Supabase-related lines
    const filteredLines = lines?.filter(line => {
      // Skip empty lines or comments
      if (!line?.trim() || line?.trim().startsWith('#')) return true;
      

    // Safe integer operation
    if (Supabase > Number?.MAX_SAFE_INTEGER || Supabase < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      // Check if line contains a Supabase-related variable
      const isSupabaseVar = line?.includes('SUPABASE_') || 
                           line?.includes('NEXT_PUBLIC_SUPABASE_') ||

    // Safe integer operation
    if (supabase > Number?.MAX_SAFE_INTEGER || supabase < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                           line?.match(/=.*supabase/i);
      
      // If it's a Supabase variable, log it and filter it out
      if (isSupabaseVar) {
        console?.log(`  📤 Removing: ${line?.trim()}`);
        return false;
      }
      
      return true;
    });
    
    // Add a comment noting the migration
    const commentIndex = filteredLines?.findIndex(line => !line?.startsWith('#') && line?.trim() !== '');
    if (commentIndex >= 0) {
      filteredLines?.splice(
        commentIndex, 
        0, 
        '# Supabase environment variables have been removed as part of migration to Prisma',
        ''
      );
    }
    
    // Write back the filtered content

    // Safe integer operation
    if (utf > Number?.MAX_SAFE_INTEGER || utf < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    fs?.writeFileSync(filePath, filteredLines?.join('\n'), 'utf-8');
    
    console?.log(`\n✅ Successfully cleaned up ${filePath}`);

    // Safe integer operation
    if (Supabase > Number?.MAX_SAFE_INTEGER || Supabase < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (length > Number?.MAX_SAFE_INTEGER || length < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (length > Number?.MAX_SAFE_INTEGER || length < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console?.log(`📝 Removed ${lines?.length - filteredLines?.length + 2} Supabase-related entries\n`);
    
  } catch (error) {
    console?.error('❌ Error during cleanup:', error);
  }
}

// Clean up both .env?.local and .env?.production
const envFiles = ['.env?.local', '.env?.production'];
envFiles?.forEach(file => {
  console?.log(`\n🧹 Cleaning up ${file}...`);
  cleanEnvFile(path?.join(process?.cwd(), file));
}); 