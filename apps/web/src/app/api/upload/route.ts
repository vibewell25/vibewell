import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@auth0/nextjs-auth0';
import { apiRateLimiter, applyRateLimit } from '@/app/api/auth/rate-limit-middleware';
import { FileUploadService } from '@/services/file-upload-service';

const fileUploadService = new FileUploadService();

// Security headers for upload endpoints
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Strict Transport Security - force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent content type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache control - no caching for upload endpoints
  response.headers.set('Cache-Control', 'no-store, private, max-age=0');
  
  return response;
}

// Define allowed file types and max file size
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 

// Validate upload request with Zod schema
const uploadSchema = z.object({
  filename: z.string()
    .min(3, "Filename is too short")
    .max(255, "Filename is too long")
    .regex(/^[a-zA-Z0-9_\-. ]+$/, "Filename contains invalid characters"),
  contentType: z.enum(ALLOWED_TYPES as [string, ...string[]]),
  fileSize: z.number().max(MAX_FILE_SIZE, `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`).optional()
});

// Validate file key request with Zod schema
const fileKeySchema = z.object({
  key: z.string().min(3).max(1024)
});

/**
 * Generate a pre-signed URL for direct file upload to S3
 */
export async function POST(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
    
    // Authentication check
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const result = uploadSchema.safeParse(body);
    
    if (!result.success) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const { filename, contentType, fileSize } = result.data;
    
    // Add user info to the filename to create secure paths
    const userId = session.user.sub;
    const sanitizedFilename = `${userId}/${Date.now()}-${filename}`;
    
    // Generate pre-signed URL for uploading
    const uploadUrl = await fileUploadService.getPresignedUploadUrl(
      sanitizedFilename, 
      contentType,
      fileSize
    );
    
    const successResponse = NextResponse.json({ 
      uploadUrl,
      key: sanitizedFilename
    });
    return addSecurityHeaders(successResponse);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Error generating upload URL' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

/**
 * Get a public URL for a previously uploaded file
 */
export async function GET(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
    
    // Authentication check
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Get the file key from query parameters
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      const errorResponse = NextResponse.json(
        { error: 'File key is required' }, 
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Security check: Only allow accessing files in the user's own directory
    // unless user is an admin
    const userId = session.user.sub;
    const userRoles = session.user.roles || [];
    const isAdmin = userRoles.includes('admin');
    
    if (!key.startsWith(`${userId}/`) && !isAdmin) {
      const errorResponse = NextResponse.json(
        { error: 'Access denied to this file' }, 
        { status: 403 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Get public URL for the file
    const url = fileUploadService.getPublicUrl(key);
    
    const successResponse = NextResponse.json({ url });
    return addSecurityHeaders(successResponse);
  } catch (error) {
    console.error('Error getting file URL:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Error getting file URL' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

/**
 * Delete a previously uploaded file
 */
export async function DELETE(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
    
    // Authentication check
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const result = fileKeySchema.safeParse(body);
    
    if (!result.success) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    const { key } = result.data;
    
    // Security check: Only allow deleting files in the user's own directory
    // unless user is an admin
    const userId = session.user.sub;
    const userRoles = session.user.roles || [];
    const isAdmin = userRoles.includes('admin');
    
    if (!key.startsWith(`${userId}/`) && !isAdmin) {
      const errorResponse = NextResponse.json(
        { error: 'Permission denied to delete this file' }, 
        { status: 403 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Importing here to avoid circular dependencies
    const { deleteFile } = await import('@/lib/s3');
    await deleteFile(key);
    
    const successResponse = NextResponse.json({ success: true });
    return addSecurityHeaders(successResponse);
  } catch (error) {
    console.error('Error deleting file:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete file' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}
