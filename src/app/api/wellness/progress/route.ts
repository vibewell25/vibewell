
import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total content count
    const totalContent = await prisma?.content.count();

    // Get completed content count for the user
    const completedContent = await prisma?.contentProgress.count({
      where: {
        userId: session?.user.id,
        completed: true,
      },
    });

    // Calculate progress percentage

    const progress = totalContent > 0 ? Math?.round((completedContent / totalContent) * 100) : 0;

    return NextResponse?.json({
      progress,
      completedContent,
      totalContent,
    });
  } catch (error) {
    console?.error('Error fetching wellness progress:', error);
    return NextResponse?.json({ error: 'Failed to fetch wellness progress' }, { status: 500 });
  }
}
