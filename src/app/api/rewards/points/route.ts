import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's loyalty points and level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        loyaltyPoints: true,
        loyaltyLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent transactions
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate progress to next level
    const currentLevel = user.loyaltyLevel;
    const nextLevel = currentLevel === 'GOLD' ? null : currentLevel === 'SILVER' ? 'GOLD' : 'SILVER';
    const pointsForNextLevel = nextLevel === 'GOLD' ? 1000 : nextLevel === 'SILVER' ? 500 : 0;
    const progress = nextLevel ? (user.loyaltyPoints / pointsForNextLevel) * 100 : 100;

    // Get benefits for current level
    const benefits = {
      BRONZE: ['5% off all services', 'Basic rewards program access'],
      SILVER: ['10% off all services', 'Priority booking', 'Free consultation'],
      GOLD: ['15% off all services', 'VIP booking', 'Free monthly treatment', 'Exclusive events'],
    };

    return NextResponse.json({
      points: user.loyaltyPoints,
      level: user.loyaltyLevel,
      nextLevel,
      progress,
      benefits: benefits[user.loyaltyLevel],
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        points: transaction.points,
        description: transaction.description,
        date: transaction.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching loyalty data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const LOYALTY_LEVELS = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, benefits: ['5% off services', 'Basic rewards'] },
  { name: 'Silver', minPoints: 1000, maxPoints: 4999, benefits: ['10% off services', 'Priority booking', 'Free upgrades'] },
  { name: 'Gold', minPoints: 5000, maxPoints: 9999, benefits: ['15% off services', 'VIP treatment', 'Free gifts', 'Exclusive events'] },
  { name: 'Platinum', minPoints: 10000, maxPoints: Infinity, benefits: ['20% off services', 'Personal concierge', 'Luxury gifts', 'First access to new services'] },
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's total points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyPoints: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine current level and next level
    const currentLevel = LOYALTY_LEVELS.find(
      level => user.loyaltyPoints >= level.minPoints && user.loyaltyPoints < level.maxPoints
    ) || LOYALTY_LEVELS[0];

    const nextLevel = LOYALTY_LEVELS.find(
      level => level.minPoints > currentLevel.minPoints
    );

    // Calculate progress to next level
    const progress = nextLevel
      ? ((user.loyaltyPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
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
    return NextResponse.json(
      { error: 'Failed to fetch loyalty points' },
      { status: 500 }
    );
  }
} 