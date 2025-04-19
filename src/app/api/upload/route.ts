import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl, generateS3Key } from '@/lib/s3';
import { withAuth } from '@/app/api/auth/middleware';

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const data = await req.json();
      const { fileName, contentType, folder = 'uploads' } = data;

      if (!fileName || !contentType) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Generate a unique key for this file
      const key = generateS3Key(folder, fileName, user.sub);

      // Get a presigned URL for uploading
      const { url, key: finalKey } = await getPresignedUploadUrl(key, contentType);

      return NextResponse.json({
        uploadUrl: url,
        key: finalKey,
        fileUrl: `${process.env.NEXT_PUBLIC_FILE_BASE_URL || ''}/${finalKey}`,
      });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      return NextResponse.json(
        { error: 'Failed to get upload URL' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { key } = await req.json();

      if (!key) {
        return NextResponse.json(
          { error: 'Missing file key' },
          { status: 400 }
        );
      }

      // Check if the user has permission to delete this file
      // For example, ensure that the file key contains the user ID
      if (!key.includes(user.sub) && !user['vibewell/roles']?.includes('admin')) {
        return NextResponse.json(
          { error: 'Permission denied to delete this file' },
          { status: 403 }
        );
      }

      // Importing inside the function to avoid circular dependencies
      const { deleteFile } = await import('@/lib/s3');
      await deleteFile(key);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }
  });
} 