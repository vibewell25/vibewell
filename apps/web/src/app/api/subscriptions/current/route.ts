import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/prisma';

import { authOptions } from '@/lib/auth';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
if (!user.subscription) {
      return NextResponse.json(null);
return NextResponse.json({
      status: user.subscription.status,
      plan: user.subscription.plan,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
