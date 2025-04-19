#!/usr/bin/env node

/**
 * Update Dependencies for Supabase to Prisma Migration
 * 
 * This script updates package.json to remove Supabase dependencies
 * and ensure all necessary Prisma dependencies are present.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Updating dependencies for Supabase to Prisma migration...\n');

try {
  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Dependencies to remove (Supabase-related)
  const depsToRemove = [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-react',
    '@supabase/ssr',
    '@supabase/postgrest-js'
  ];
  
  // Dependencies to add/ensure (Prisma-related)
  const depsToEnsure = {
    '@prisma/client': '^5.0.0',
    'prisma': '^5.0.0'
  };
  
  // Remove Supabase dependencies
  let removedCount = 0;
  depsToRemove.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`📤 Removing dependency: ${dep}`);
      delete packageJson.dependencies[dep];
      removedCount++;
    }
    
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`📤 Removing dev dependency: ${dep}`);
      delete packageJson.devDependencies[dep];
      removedCount++;
    }
  });
  
  // Ensure Prisma dependencies
  let addedCount = 0;
  Object.entries(depsToEnsure).forEach(([dep, version]) => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }
      
      console.log(`📥 Adding dependency: ${dep}@${version}`);
      packageJson.dependencies[dep] = version;
      addedCount++;
    } else {
      console.log(`✅ Dependency already exists: ${dep}`);
    }
    
    // Remove from devDependencies if it exists there
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`📤 Removing duplicate dev dependency: ${dep}`);
      delete packageJson.devDependencies[dep];
    }
  });
  
  // Make sure prisma is in devDependencies if it's not already in dependencies
  if (!packageJson.dependencies['prisma'] && (!packageJson.devDependencies || !packageJson.devDependencies['prisma'])) {
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    
    console.log(`📥 Adding dev dependency: prisma@^5.0.0`);
    packageJson.devDependencies['prisma'] = '^5.0.0';
    addedCount++;
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  
  console.log(`\n📊 Dependencies update summary:`);
  console.log(`- ${removedCount} Supabase dependencies removed`);
  console.log(`- ${addedCount} Prisma dependencies added/updated`);
  
  console.log(`\n📋 Next steps:`);
  console.log(`1. Run 'npm install' to update your node_modules`);
  console.log(`2. Run 'npx prisma generate' to ensure Prisma client is up-to-date\n`);
  
} catch (error) {
  console.error('❌ Error updating dependencies:', error);
  process.exit(1);
} 