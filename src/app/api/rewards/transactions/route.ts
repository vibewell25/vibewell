import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 most recent transactions
    });

    return NextResponse.json({
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        points: transaction.points,
        description: transaction.description,
        date: transaction.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching loyalty transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty transactions' }, { status: 500 });
  }
}
