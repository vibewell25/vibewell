import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import redisClient, { RateLimitEvent } from '@/lib/redis-client';
import { logger } from '@/lib/logger';

// Session type
interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
// GET /api/admin/rate-limits
export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (session.user.role !== 'admin') {
      logger.warn(`Non-admin user ${session.user.id} attempted to access rate limits`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const timeRange = searchParams.get('timeRange') || '24h';

    const events = await redisClient.getRateLimitEvents();
    let filtered = events || [];

    const now = Date.now();
    const ms =
      timeRange === '24h' ? 24 * 60 * 60 * 1000 :
      timeRange === '1h' ? 60 * 60 * 1000 :
      7 * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((e: RateLimitEvent) => now - (e.timestamp || 0) <= ms);

    if (filter !== 'all') {
      if (filter === 'suspicious') {
        filtered = filtered.filter((e) => e.suspicious);
else {
        filtered = filtered.filter((e) =>
          e.limiterType.toLowerCase().includes(filter.toLowerCase()),
filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const stats = {
      total: filtered.length,
      exceeded: filtered.filter((e) => e.exceeded).length,
      suspicious: filtered.filter((e) => e.suspicious).length,
      uniqueIPs: new Set(filtered.map((e) => e.ip)).size,
const limiterStats = filtered.reduce((acc, e) => {
      const type = e.limiterType;
      if (!acc[type]) acc[type] = { total: 0, exceeded: 0, allowed: 0 };
      acc[type].total += 1;
      if (e.exceeded) acc[type].exceeded += 1;
      else acc[type].allowed += 1;
      return acc;
{} as Record<string, { total: number; exceeded: number; allowed: number }>);

    logger.info(`Admin ${session.user.id} retrieved ${filtered.length} rate limit events`);
    return NextResponse.json({ events: filtered, stats, limiterStats });
catch (error) {
    logger.error(
      `Error retrieving rate limit events: ${error instanceof Error ? error.message : String(error)}`
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// POST /api/admin/rate-limits
export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (session.user.role !== 'admin') {
      logger.warn(`Non-admin user ${session.user.id} attempted to modify rate limits`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
const { ip, action } = (await req.json()) as { ip?: string; action?: string };
    if (!ip) {
      return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
if (action === 'block') {
      await redisClient.blockIP(ip);
      logger.warn(`Admin ${session.user.id} blocked IP ${ip}`);
      return NextResponse.json({ success: true, message: `IP ${ip} blocked` });
if (action === 'unblock') {
      await redisClient.unblockIP(ip);
      logger.info(`Admin ${session.user.id} unblocked IP ${ip}`);
      return NextResponse.json({ success: true, message: `IP ${ip} unblocked` });
return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
catch (error) {
    logger.error(
      `Error managing rate limits: ${error instanceof Error ? error.message : String(error)}`
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
