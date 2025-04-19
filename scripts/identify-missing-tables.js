#!/usr/bin/env node

/**
 * Identifies tables in Supabase migrations that are missing from Prisma schema
 * This helps with completing the migration from Supabase to Prisma
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read Prisma schema to extract table names
function extractPrismaTableNames() {
  try {
    const prismaSchemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (!fs.existsSync(prismaSchemaPath)) {
      console.error('❌ Prisma schema not found at prisma/schema.prisma');
      return [];
    }

    const content = fs.readFileSync(prismaSchemaPath, 'utf-8');
    
    // Extract model names and any explicit table names from @@map annotations
    const modelRegex = /model\s+(\w+)\s+{/g;
    const mapRegex = /@{2}map\("([^"]+)"\)/g;
    
    let match;
    const tables = new Set();
    
    // Add model names
    while ((match = modelRegex.exec(content)) !== null) {
      tables.add(match[1].toLowerCase());
    }
    
    // Add explicit table names from @@map
    while ((match = mapRegex.exec(content)) !== null) {
      tables.add(match[1].toLowerCase());
    }
    
    return Array.from(tables);
  } catch (error) {
    console.error('Error extracting Prisma table names:', error);
    return [];
  }
}

// Scan Supabase migration files to extract table names
function extractSupabaseTables() {
  try {
    const supabaseMigrationsDir = path.join(process.cwd(), 'supabase/migrations');
    if (!fs.existsSync(supabaseMigrationsDir)) {
      console.error('❌ Supabase migrations directory not found');
      return [];
    }
    
    // Get all SQL files in the migrations directory
    const migrationFiles = fs.readdirSync(supabaseMigrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => path.join(supabaseMigrationsDir, file));
    
    // Extract table names from CREATE TABLE statements
    const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:[\w\.]+\.)?(\w+)/gi;
    const tables = new Set();
    
    migrationFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      let match;
      while ((match = tableRegex.exec(content)) !== null) {
        tables.add(match[1].toLowerCase());
      }
    });
    
    return Array.from(tables);
  } catch (error) {
    console.error('Error extracting Supabase table names:', error);
    return [];
  }
}

// Main function
function main() {
  console.log('\n🔍 Identifying missing tables in Prisma schema...\n');
  
  const prismaTables = extractPrismaTableNames();
  const supabaseTables = extractSupabaseTables();
  
  console.log(`Found ${prismaTables.length} tables in Prisma schema.`);
  console.log(`Found ${supabaseTables.length} tables in Supabase migrations.\n`);
  
  // Find tables in Supabase that aren't in Prisma
  const missingTables = supabaseTables.filter(table => !prismaTables.includes(table));
  
  if (missingTables.length > 0) {
    console.log('📋 Tables from Supabase missing in Prisma schema:');
    missingTables.forEach(table => console.log(`  - ${table}`));
    
    console.log('\n🔄 Next steps:');
    console.log('1. Add these tables to your Prisma schema');
    console.log('2. Run the following command to pull the table structure from the database:');
    console.log('   npx prisma db pull');
    console.log('3. Or manually create the models in schema.prisma');
  } else {
    console.log('✅ All tables from Supabase migrations are present in Prisma schema!');
  }
  
  // Identify potentially redundant schemas in Prisma (tables that don't exist in Supabase)
  const redundantTables = prismaTables.filter(table => !supabaseTables.includes(table) && 
                                              !['account', 'session'].includes(table)); // Exclude Auth.js tables
  
  if (redundantTables.length > 0) {
    console.log('\n⚠️ Tables in Prisma that don\'t exist in Supabase migrations:');
    redundantTables.forEach(table => console.log(`  - ${table}`));
    console.log('\nNote: These might be new tables or tables created outside of migrations.');
  }
  
  console.log('\n📚 For detailed migration instructions, see docs/supabase-to-prisma-migration.md\n');
}

main(); 