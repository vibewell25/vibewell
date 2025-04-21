import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Loyalty level definitions
const LOYALTY_LEVELS = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 1000,
    benefits: ['5% off selected services', 'Birthday surprise'],
  },
  {
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 3000,
    benefits: ['10% off selected services', 'Priority booking', 'Free consultation'],
  },
  {
    name: 'Gold',
    minPoints: 3000,
    maxPoints: 7000,
    benefits: [
      '15% off all services',
      'VIP events access',
      'Exclusive promotions',
      'Personalized wellness plan',
    ],
  },
  {
    name: 'Platinum',
    minPoints: 7000,
    maxPoints: Infinity,
    benefits: [
      '20% off all services',
      '24/7 concierge',
      'Free monthly treatment',
      'Partner benefits',
    ],
  },
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's total points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyPoints: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine current level and next level
    const currentLevel =
      LOYALTY_LEVELS.find(
        level => user.loyaltyPoints >= level.minPoints && user.loyaltyPoints < level.maxPoints
      ) || LOYALTY_LEVELS[0];

    const nextLevel = LOYALTY_LEVELS.find(level => level.minPoints > currentLevel.minPoints);

    // Calculate progress to next level
    const progress = nextLevel
      ? ((user.loyaltyPoints - currentLevel.minPoints) /
          (nextLevel.minPoints - currentLevel.minPoints)) *
        100
      : 100;

    // Get recent transactions
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        points: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      points: user.loyaltyPoints,
      level: currentLevel.name,
      benefits: currentLevel.benefits,
      progress: Math.min(progress, 100),
      nextLevel: nextLevel?.name,
      pointsToNextLevel: nextLevel ? nextLevel.minPoints - user.loyaltyPoints : 0,
      transactions: transactions.map(t => ({
        ...t,
        date: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty points' }, { status: 500 });
  }
}
