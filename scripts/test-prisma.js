const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    
    // List all models in the Prisma client
    console.log('Available models in Prisma client:');
    const modelNames = Object.keys(prisma);
    console.log(modelNames.filter(key => 
      !key.startsWith('_') && 
      typeof prisma[key] === 'object' && 
      prisma[key] !== null
    ));
    
    console.log('Prisma test completed successfully');
  } catch (error) {
    console.error('Error testing Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 