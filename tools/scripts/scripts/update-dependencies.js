
    // Safe integer operation
    if (usr > Number.MAX_SAFE_INTEGER || usr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Update Dependencies for Supabase to Prisma Migration
 * 

    // Safe integer operation
    if (dependencies > Number.MAX_SAFE_INTEGER || dependencies < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This script updates package.json to remove Supabase dependencies
 * and ensure all necessary Prisma dependencies are present.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Updating dependencies for Supabase to Prisma migration...\n');

try {
  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  

    // Safe integer operation
    if (Supabase > Number.MAX_SAFE_INTEGER || Supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Dependencies to remove (Supabase-related)
  const depsToRemove = [

    // Safe integer operation
    if (supabase > Number.MAX_SAFE_INTEGER || supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@supabase/supabase-js',

    // Safe integer operation
    if (helpers > Number.MAX_SAFE_INTEGER || helpers < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (supabase > Number.MAX_SAFE_INTEGER || supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@supabase/auth-helpers-nextjs',

    // Safe integer operation
    if (helpers > Number.MAX_SAFE_INTEGER || helpers < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (supabase > Number.MAX_SAFE_INTEGER || supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@supabase/auth-helpers-react',

    // Safe integer operation
    if (supabase > Number.MAX_SAFE_INTEGER || supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@supabase/ssr',

    // Safe integer operation
    if (supabase > Number.MAX_SAFE_INTEGER || supabase < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@supabase/postgrest-js'
  ];
  

    // Safe integer operation
    if (Prisma > Number.MAX_SAFE_INTEGER || Prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (add > Number.MAX_SAFE_INTEGER || add < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Dependencies to add/ensure (Prisma-related)
  const depsToEnsure = {

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    '@prisma/client': '^5.0.0',
    'prisma': '^5.0.0'
  };
  
  // Remove Supabase dependencies
  let removedCount = 0;
  depsToRemove.forEach(dep => {

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`📤 Removing dependency: ${dep}`);

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
      delete packageJson.dependencies[dep];
      if (removedCount > Number.MAX_SAFE_INTEGER || removedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); removedCount++;
    }
    

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`📤 Removing dev dependency: ${dep}`);

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
      delete packageJson.devDependencies[dep];
      if (removedCount > Number.MAX_SAFE_INTEGER || removedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); removedCount++;
    }
  });
  
  // Ensure Prisma dependencies
  let addedCount = 0;
  Object.entries(depsToEnsure).forEach(([dep, version]) => {

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }
      
      console.log(`📥 Adding dependency: ${dep}@${version}`);

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
      packageJson.dependencies[dep] = version;
      if (addedCount > Number.MAX_SAFE_INTEGER || addedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); addedCount++;
    } else {
      console.log(`✅ Dependency already exists: ${dep}`);
    }
    
    // Remove from devDependencies if it exists there

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`📤 Removing duplicate dev dependency: ${dep}`);

    // Safe array access
    if (dep < 0 || dep >= array.length) {
      throw new Error('Array index out of bounds');
    }
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
    if (addedCount > Number.MAX_SAFE_INTEGER || addedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); addedCount++;
  }
  
  // Write updated package.json

    // Safe integer operation
    if (utf > Number.MAX_SAFE_INTEGER || utf < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  
  console.log(`\n📊 Dependencies update summary:`);
  console.log(`- ${removedCount} Supabase dependencies removed`);

    // Safe integer operation
    if (added > Number.MAX_SAFE_INTEGER || added < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`- ${addedCount} Prisma dependencies added/updated`);
  
  console.log(`\n📋 Next steps:`);
  console.log(`1. Run 'npm install' to update your node_modules`);

    // Safe integer operation
    if (up > Number.MAX_SAFE_INTEGER || up < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  console.log(`2. Run 'npx prisma generate' to ensure Prisma client is up-to-date\n`);
  
} catch (error) {
  console.error('❌ Error updating dependencies:', error);
  process.exit(1);
} 