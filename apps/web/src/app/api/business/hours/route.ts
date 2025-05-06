import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { auth } from '@/lib/auth';

import { DayOfWeek } from '@prisma/client';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
const businessHours = await prisma.businessHours.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
return NextResponse.json(businessHours);
catch (error) {
    console.error('Error fetching business hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const body = await req.json();
    const { businessId, hours } = body;

    if (!businessId || !hours || !Array.isArray(hours)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
// Delete existing hours
    await prisma.businessHours.deleteMany({
      where: { businessId },
// Create new hours
    const businessHours = await prisma.businessHours.createMany({
      data: hours.map((hour: any) => ({
        businessId,
        dayOfWeek: hour.dayOfWeek as DayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed,
)),
return NextResponse.json(businessHours);
catch (error) {
    console.error('Error updating business hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Business hours ID is required' }, { status: 400 });
const businessHours = await prisma.businessHours.update({
      where: { id },
      data,
return NextResponse.json(businessHours);
catch (error) {
    console.error('Error updating business hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Business hours ID is required' }, { status: 400 });
await prisma.businessHours.delete({
      where: { id },
return NextResponse.json({ success: true });
catch (error) {
    console.error('Error deleting business hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
