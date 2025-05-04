
import { NextRequest, NextResponse } from 'next/server';

import { getPresignedUploadUrl } from '@/lib/s3';


import { withAuth } from '@/app/api/auth/middleware';

import { auth } from '@/lib/auth';


import { FileUploadService } from '@/services/file-upload-service';

const fileUploadService = new FileUploadService();

const ALLOWED_TYPES = [

  'image/jpeg',

  'image/png',

  'image/gif',

  'application/pdf',

  'application/msword',


  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and content type are required' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const uploadUrl = await fileUploadService.getPresignedUploadUrl(filename, contentType);

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ error: 'Error generating upload URL' }, { status: 500 });
  }
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    const url = fileUploadService.getPublicUrl(key);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error getting file URL:', error);
    return NextResponse.json({ error: 'Error getting file URL' }, { status: 500 });
  }
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); DELETE(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { key } = await req.json();

      if (!key) {
        return NextResponse.json({ error: 'Missing file key' }, { status: 400 });
      }

      // Check if the user has permission to delete this file
      // For example, ensure that the file key contains the user ID

      if (!key.includes(user.sub) && !user['vibewell/roles'].includes('admin')) {
        return NextResponse.json(
          { error: 'Permission denied to delete this file' },
          { status: 403 },
        );
      }

      // Importing inside the function to avoid circular dependencies

      const { deleteFile } = await import('@/lib/s3');
      await deleteFile(key);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
  });
}
