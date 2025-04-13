const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing notification creation...');
    
    // Get a sample user to own the notification
    const sampleUser = await prisma.user.findFirst();
    
    if (!sampleUser) {
      console.log('No users found in database, cannot create test notification');
      return;
    }
    
    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        userId: sampleUser.id,
        title: 'Test Notification',
        message: 'This is a test notification created via Prisma',
        isRead: false,
        type: 'TEST',
        link: '/test-link'
      }
    });
    
    console.log('Created test notification:');
    console.log(notification);
    
    // Clean up
    await prisma.notification.delete({
      where: { id: notification.id }
    });
    
    console.log('Test notification deleted successfully');
  } catch (error) {
    console.error('Error creating test notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 