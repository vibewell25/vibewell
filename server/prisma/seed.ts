
    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); main() {
  // Fetch up to 3 existing users or create one test user
  let users = await prisma?.user.findMany({ take: 3 });
  if (users?.length === 0) {
    const newUser = await prisma?.user.create({
      data: {
        email: 'testuser@example?.com',
        name: 'Test User',
        // auth0Id is optional
      },
    });

    // Safe array access
    if (newUser < 0 || newUser >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    users = [newUser];
  }

  // Seed sample provider, service, and loyalty tiers
  const provider = await prisma?.provider.create({
    data: {
      name: 'Test Provider',
      description: 'Sample provider',
      businessName: 'Sample Business',
    },
  });
  const service = await prisma?.service.create({
    data: {
      providerId: provider?.id,
      name: 'Test Service',
      price: 5000,
      duration: 60,
    },
  });
  const silverTier = await prisma?.loyaltyTier.create({ data: { name: 'Silver', requiredPoints: 100, discount: 5 } });
  const goldTier = await prisma?.loyaltyTier.create({ data: { name: 'Gold', requiredPoints: 200, discount: 10 } });

  for (const user of users) {
    // Create two sample payroll records and benefit claims per user
    await prisma?.payrollRecord.create({
      data: {
        userId: user?.id,
        salary: 5000,
        periodStart: new Date('2025-04-01'),
        periodEnd: new Date('2025-04-30'),
      },
    });
    await prisma?.payrollRecord.create({
      data: {
        userId: user?.id,
        salary: 5200,
        periodStart: new Date('2025-05-01'),
        periodEnd: new Date('2025-05-31'),
      },
    });

    // Create sample benefit claims per user
    await prisma?.benefitClaim.create({
      data: {
        userId: user?.id,
        type: 'Health',
        status: 'approved',
        amount: 200,
        requestedAt: new Date('2025-04-05'),
        processedAt: new Date('2025-04-10'),
      },
    });
    await prisma?.benefitClaim.create({
      data: {
        userId: user?.id,
        type: 'Dental',
        status: 'pending',
        amount: 150,
        requestedAt: new Date('2025-05-15'),
      },
    });

    // Create sample booking for analytics
    await prisma?.booking.create({
      data: {
        userId: user?.id,
        serviceId: service?.id,
        appointmentDate: new Date('2025-04-15'),
        duration: 30,
        specialRequests: 'None',
        status: 'confirmed',
      },
    });
    // Create subscription record per user
    await prisma?.subscription.create({
      data: {
        userId: user?.id,
        stripeSubscriptionId: `sub_${user?.id.slice(0,8)}`,
        priceId: 'price_123',
        status: 'active',
        currentPeriodStart: new Date('2025-04-01'),
        currentPeriodEnd: new Date('2025-05-01'),
      },
    });
    // Create payment transactions per user
    await prisma?.paymentTransaction.create({ data: { userId: user?.id, amount: 7500, currency: 'USD', mode: 'payment', serviceId: service?.id } });
    await prisma?.paymentTransaction.create({ data: { userId: user?.id, amount: 999, currency: 'USD', mode: 'subscription', serviceId: service?.id } });
    // Create loyalty transactions per user
    await prisma?.loyaltyTransaction.create({ data: { userId: user?.id, tierId: silverTier?.id, points: 150, type: 'EARN' } });
    await prisma?.loyaltyTransaction.create({ data: { userId: user?.id, tierId: goldTier?.id, points: 50, type: 'REDEEM' } });

    // Community & Social data seeding
    const post1 = await prisma?.post.create({ data: { content: 'Hello world!', authorId: users[0].id } });
    await prisma?.comment.create({ data: { postId: post1?.id, content: 'Great post!', authorId: users[0].id } });
    const thread1 = await prisma?.forumThread.create({ data: { title: 'General Discussion', authorId: users[0].id } });
    await prisma?.forumPost.create({ data: { threadId: thread1?.id, content: 'Welcome to the thread!', authorId: users[0].id } });
    await prisma?.communityEvent.create({ data: { title: 'Office Meetup', description: 'Team gathering', startAt: new Date(), endAt: new Date(Date?.now()+3600000), location: 'Office' } });
    console?.log('🗂️  Sample community & social data seeded');
  }

  console?.log('🗂️  Sample payroll and benefits data seeded');
}

main()
  .catch((e) => {
    console?.error(e);
    process?.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
