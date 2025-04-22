import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateModuleContentInput, UpdateModuleContentInput } from '@/types/module';

// GET /api/training/module/[moduleId]/content
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.moduleContent.findMany({
      where: { moduleId: params.moduleId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching module content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module content' },
      { status: 500 }
    );
  }
}

// POST /api/training/module/[moduleId]/content
export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateModuleContentInput = await request.json();
    const content = await prisma.moduleContent.create({
      data: {
        ...data,
        moduleId: params.moduleId,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating module content:', error);
    return NextResponse.json(
      { error: 'Failed to create module content' },
      { status: 500 }
    );
  }
}

// PUT /api/training/module/[moduleId]/content
export async function PUT(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: UpdateModuleContentInput = await request.json();
    const { id, ...updateData } = data;

    const content = await prisma.moduleContent.update({
      where: { id, moduleId: params.moduleId },
      data: updateData,
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating module content:', error);
    return NextResponse.json(
      { error: 'Failed to update module content' },
      { status: 500 }
    );
  }
}

// DELETE /api/training/module/[moduleId]/content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    await prisma.moduleContent.delete({
      where: { id: contentId, moduleId: params.moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module content:', error);
    return NextResponse.json(
      { error: 'Failed to delete module content' },
      { status: 500 }
    );
  }
} 