import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const forms = await prisma.consultationForm.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching consultation forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, name, description, fields, isRequired, isActive } = body;

    if (!businessId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const form = await prisma.consultationForm.create({
      data: {
        businessId,
        name,
        description,
        fields,
        isRequired,
        isActive,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error creating consultation form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    const form = await prisma.consultationForm.update({
      where: { id },
      data,
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error updating consultation form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    await prisma.consultationForm.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting consultation form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 