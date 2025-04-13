import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user has admin role to access all profiles
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const role = searchParams.get('role');

    // Prepare where conditions
    const whereConditions: any = {};
    
    // Add role filter if provided
    if (role) {
      whereConditions.role = role;
    }

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      take: Math.min(limit, 50), // Cap at 50 for performance
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereConditions,
    });

    return NextResponse.json({
      data: users,
      count: users.length,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
} 