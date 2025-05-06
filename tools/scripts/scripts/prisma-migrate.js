#!/usr/bin/env node

/**
 * Prisma migration script
 * Safely runs migrations with validation and error handling
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const MIGRATION_NAME_PREFIX = 'deploy-';
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'DIRECT_URL'];
const PRISMA_SCHEMA_PATH = path.join(process.cwd(), 'prisma/schema.prisma');

/**
 * Validate that required environment variables are set
 */
function validateEnvironment() {
  console.log('🔍 Validating environment configuration...');
  
  const missingVars = [];
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these variables in your .env file or environment');
    process.exit(1);
  }
  
  // Validate that the schema file exists
  if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
    console.error(`❌ Prisma schema not found at ${PRISMA_SCHEMA_PATH}`);
    process.exit(1);
  }
  
  console.log('✅ Environment validation successful');
}

/**
 * Check database connection
 */
function checkDatabaseConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    execSync('npx prisma db pull --schema=prisma/schema.prisma', { stdio: 'inherit' });
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Failed to connect to the database');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Reset the database (development only)
 */
function resetDatabase() {
  if (process.env.NODE_ENV !== 'development' && !process.argv.includes('--force-reset')) {
    console.error('❌ Database reset is only allowed in development environment');
    console.error('If you want to reset in another environment, use the --force-reset flag');
    process.exit(1);
  }
  
  console.log('🗑️ Resetting database...');
  
  try {
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    console.log('✅ Database reset successful');
  } catch (error) {
    console.error('❌ Failed to reset database');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Apply pending migrations
 */
function applyMigrations() {
  console.log('🚀 Applying migrations...');
  
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply migrations');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Create a new migration
 */
function createMigration(name) {
  if (!name) {
    console.error('❌ Migration name is required');
    console.error('Usage: node scripts/prisma-migrate.js create <migration-name>');
    process.exit(1);
  }
  
  const migrationName = `${MIGRATION_NAME_PREFIX}${name}`;
  console.log(`📝 Creating migration: ${migrationName}...`);
  
  try {
    execSync(`npx prisma migrate dev --name ${migrationName} --create-only`, { stdio: 'inherit' });
    console.log('✅ Migration created successfully');
  } catch (error) {
    console.error('❌ Failed to create migration');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Generate Prisma client
 */
function generateClient() {
  console.log('🔧 Generating Prisma client...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  const command = process.argv[2];
  
  // Always validate environment first
  validateEnvironment();
  
  switch (command) {
    case 'reset':
      resetDatabase();
      applyMigrations();
      generateClient();
      break;
      
    case 'deploy':
      checkDatabaseConnection();
      applyMigrations();
      generateClient();
      break;
      
    case 'create':
      const migrationName = process.argv[3];
      createMigration(migrationName);
      break;
      
    case 'generate':
      generateClient();
      break;
      
    default:
      console.log('📚 Prisma Migration Tool');
      console.log('------------------------');
      console.log('Commands:');
      console.log('  deploy    Apply pending migrations');
      console.log('  reset     Reset database and apply migrations (dev only)');
      console.log('  create    Create a new migration');
      console.log('  generate  Generate Prisma client');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/prisma-migrate.js deploy');
      console.log('  node scripts/prisma-migrate.js create add-user-fields');
      break;
  }
}

// Run the script
main(); 