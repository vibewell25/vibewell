import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role') || undefined;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Basic validation
    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 },
// Prepare where conditions
    const whereConditions: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
// Add role filter if provided
    if (role) {
      whereConditions.role = role;
// Fetch users matching the search criteria
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
take: Math.min(limit, 50), // Cap at 50 for performance
      skip: offset,
      orderBy: {
        name: 'asc',
// Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereConditions,
return NextResponse.json({
      data: users,
      count: users.length,
      total: totalCount,
      limit,
      offset,
catch (error) {
    console.error('Error searching profiles:', error);
    return NextResponse.json({ error: 'Failed to search profiles' }, { status: 500 });
