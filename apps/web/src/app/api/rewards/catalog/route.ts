
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rewards = await prisma.reward.findMany({
      where: {
        available: true,
      },
      orderBy: {
        points: 'asc',
      },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch rewards catalog' }, { status: 500 });
  }
}
