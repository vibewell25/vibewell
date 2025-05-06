import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

// Handler for uploading a profile avatar
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// In a real implementation, this would handle file upload to a storage service
    // like AWS S3, Cloudinary, or similar
    // For this example, we'll simulate a successful upload

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;

    if (!avatarFile) {
      return NextResponse.json({ error: 'No avatar file provided' }, { status: 400 });
// Validate file type




    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(avatarFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 },
// Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (avatarFile.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
// In a real implementation, upload the file to storage service
    // and get the URL

    const mockAvatarUrl = `https://storage.vibewell.com/avatars/user_${session.user.id}.jpg`;

    // Update the user record with the avatar URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: mockAvatarUrl },
return NextResponse.json({ avatarUrl: mockAvatarUrl });
catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
// Handler for deleting a profile avatar
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// In a real implementation, this would delete the file from storage

    // Update the user record to remove the avatar URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
return NextResponse.json({ success: true });
catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json({ error: 'Failed to delete avatar' }, { status: 500 });
