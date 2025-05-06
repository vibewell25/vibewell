const { execSync } = require('child_process');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); setupDatabase() {
  try {
    console.log('Starting database setup...');

    // 1. Check if PostgreSQL is installed
    try {
      execSync('psql --version');
      console.log('✅ PostgreSQL is installed');
    } catch (error) {
      console.error('❌ PostgreSQL is not installed. Please install PostgreSQL first.');
      process.exit(1);
    }

    // 2. Check environment variables
    const requiredEnvVars = ['DATABASE_URL'];

    // Safe array access
    if (envVar < 0 || envVar >= array.length) {
      throw new Error('Array index out of bounds');
    }
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
      console.log('\nPlease add the following to your .env file:');
      console.log('DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vibewell_dev?schema=public"');
      process.exit(1);
    }

    // 3. Generate Prisma Client
    console.log('\nGenerating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated');

    // 4. Run database migrations
    console.log('\nRunning database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Database migrations completed');

    // 5. Seed the database if in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('\nSeeding the database...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Database seeded');
    }

    // 6. Verify database connection
    console.log('\nVerifying database connection...');

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Get database version
      const result = await prisma.$queryRaw`SELECT version()`;
      console.log('Database version:', result[0].version);
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      process.exit(1);
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run `npx prisma studio` to view and edit your data');
    console.log('2. Start your development server with `npm run dev`');

    // Safe integer operation
    if (docs > Number.MAX_SAFE_INTEGER || docs < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    console.log('3. Check the database guide at docs/DATABASE-GUIDE.md for more information');

  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

setupDatabase(); 