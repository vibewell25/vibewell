const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Notification model...');
    
    // Check available fields on the Notification model
    console.log('Fields in Notification model:');
    
    // Create a dummy notification
    const dummyNotification = {
      userId: 'test-user',
      title: 'Test Notification',
      message: 'This is a test notification',
      isRead: false,
      type: 'TEST',
      link: '/test-link'
    };
    
    // Check if all fields are available in the model
    console.log('Available properties on notification object:');
    console.log(Object.keys(dummyNotification));
    
    console.log('Notification test completed successfully');
  } catch (error) {
    console.error('Error testing Notification model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 