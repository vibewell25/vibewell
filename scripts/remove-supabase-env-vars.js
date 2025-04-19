#!/usr/bin/env node

/**
 * Supabase Environment Variables Cleanup
 * 
 * This script removes Supabase-related environment variables from .env files
 * as part of the migration from Supabase to Prisma.
 */

const fs = require('fs');
const path = require('path');

// Get target file from command line arguments
const targetFile = process.argv[2];

if (!targetFile) {
  console.error('❌ Please provide a target file, e.g., .env.local');
  process.exit(1);
}

console.log(`\n🔍 Removing Supabase environment variables from ${targetFile}...\n`);

try {
  // Check if file exists
  if (!fs.existsSync(targetFile)) {
    console.error(`❌ File not found: ${targetFile}`);
    process.exit(1);
  }
  
  // Read file content
  const content = fs.readFileSync(targetFile, 'utf-8');
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
  fs.writeFileSync(targetFile, filteredLines.join('\n'), 'utf-8');
  
  console.log(`\n✅ Successfully cleaned up ${targetFile}`);
  console.log(`📝 Removed ${lines.length - filteredLines.length + 2} Supabase-related entries\n`);
  
} catch (error) {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
} 