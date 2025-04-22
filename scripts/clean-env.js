const fs = require('fs');
const path = require('path');

function cleanEnvFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Filter out Supabase-related lines
    const filteredLines = lines.filter(line => {
      // Skip empty lines or comments
      if (!line.trim() || line.trim().startsWith('#')) return true;
      
      // Check if line contains a Supabase-related variable
      const isSupabaseVar = line.includes('SUPABASE_') || 
                           line.includes('NEXT_PUBLIC_SUPABASE_') ||
                           line.match(/=.*supabase/i);
      
      // If it's a Supabase variable, log it and filter it out
      if (isSupabaseVar) {
        console.log(`  📤 Removing: ${line.trim()}`);
        return false;
      }
      
      return true;
    });
    
    // Add a comment noting the migration
    const commentIndex = filteredLines.findIndex(line => !line.startsWith('#') && line.trim() !== '');
    if (commentIndex >= 0) {
      filteredLines.splice(
        commentIndex, 
        0, 
        '# Supabase environment variables have been removed as part of migration to Prisma',
        ''
      );
    }
    
    // Write back the filtered content
    fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf-8');
    
    console.log(`\n✅ Successfully cleaned up ${filePath}`);
    console.log(`📝 Removed ${lines.length - filteredLines.length + 2} Supabase-related entries\n`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Clean up both .env.local and .env.production
const envFiles = ['.env.local', '.env.production'];
envFiles.forEach(file => {
  console.log(`\n🧹 Cleaning up ${file}...`);
  cleanEnvFile(path.join(process.cwd(), file));
}); 