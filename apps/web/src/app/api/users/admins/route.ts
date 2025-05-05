import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import { prisma } from '@/lib/database/client';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Check if requesting user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
// Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
return NextResponse.json(admins);
catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Check if requesting user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
// Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
return NextResponse.json(updatedUser);
catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// Check if requesting user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
// Prevent removing the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot remove the last admin user' }, { status: 400 });
// Update user role to regular user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'USER' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
return NextResponse.json(updatedUser);
catch (error) {
    console.error('Error removing admin user:', error);
    return NextResponse.json({ error: 'Failed to remove admin user' }, { status: 500 });
