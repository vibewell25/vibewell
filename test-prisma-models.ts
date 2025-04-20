import { PrismaClient, PaymentStatus, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testModels() {
  try {
    // Test PaymentStatus enum
    const payment = await prisma.payment.findFirst({
      where: {
        status: PaymentStatus.PENDING
      }
    });
    console.log('Payment query successful');

    // Test practitioner relation
    const userWithPractitioner = await prisma.user.findFirst({
      include: {
        practitioner: true
      }
    });
    console.log('User with practitioner query successful');

    // Test ServiceBooking
    const booking = await prisma.serviceBooking.findFirst({
      where: {
        status: BookingStatus.PENDING
      }
    });
    console.log('ServiceBooking query successful');

    // Test ServiceReview with businessId
    const review = await prisma.serviceReview.findFirst({
      where: {
        businessId: 'some-business-id'
      }
    });
    console.log('ServiceReview query successful');

  } catch (error) {
    console.error('Error testing models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModels(); 