imported into test files
 */


import { NextRequest, NextResponse } from 'next/server';

// Define the common route handler types for HTTP methods

declare module '@/app/api/*/*/route' {
  export function GET(request: NextRequest): Promise<NextResponse>;
  export function POST(request: NextRequest): Promise<NextResponse>;
  export function PUT(request: NextRequest): Promise<NextResponse>;
  export function DELETE(request: NextRequest): Promise<NextResponse>;
  export function PATCH(request: NextRequest): Promise<NextResponse>;
// Specifically define the login route


declare module '@/app/api/auth/login/route' {
  export function POST(request: NextRequest): Promise<NextResponse>;
