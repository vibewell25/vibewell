import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

// Vector3 validation schema
const vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
// AR Settings validation schema
const arSettingsSchema = z.object({
  productId: z.string().cuid(),
  scale: vector3Schema,
  rotation: vector3Schema,
  position: vector3Schema,
const MAX_TIMEOUT = 30000;

export async function GET(request: NextRequest) {
  const start = Date.now();
  if (Date.now() - start > MAX_TIMEOUT) throw new Error("Timeout");

  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
const arSettings = await prisma.aRSetting.findFirst({ where: { productId } });
    if (!arSettings) {
      return NextResponse.json(
        { error: "AR settings not found" },
        { status: 404 }
return NextResponse.json(arSettings);
catch (error) {
    console.error("AR Settings GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AR settings" },
      { status: 500 }
export async function POST(request: NextRequest) {
  const start = Date.now();
  if (Date.now() - start > MAX_TIMEOUT) throw new Error("Timeout");

  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const body = await request.json();
    const validatedData = arSettingsSchema.parse(body);

    const product = await prisma.product.findFirst({
      where: { id: validatedData.productId, userId: token.sub },
if (!product) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
const arSettings = await prisma.aRSetting.create({
      data: {
        productId: validatedData.productId,
        scale: validatedData.scale,
        rotation: validatedData.rotation,
        position: validatedData.position,
return NextResponse.json(arSettings, { status: 201 });
catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid AR settings data", details: error.errors },
        { status: 400 }
console.error("AR Settings POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create AR settings" },
      { status: 500 }
export async function PUT(request: NextRequest) {
  const start = Date.now();
  if (Date.now() - start > MAX_TIMEOUT) throw new Error("Timeout");

  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "AR Settings ID is required" },
        { status: 400 }
const body = await request.json();
    const validatedData = arSettingsSchema.partial().parse(body);

    const existingSettings = await prisma.aRSetting.findFirst({
      where: { id, product: { userId: token.sub } },
      include: { product: true },
if (!existingSettings) {
      return NextResponse.json(
        { error: "AR settings not found or unauthorized" },
        { status: 404 }
const arSettings = await prisma.aRSetting.update({
      where: { id },
      data: {
        scale: validatedData.scale ?? existingSettings.scale,
        rotation: validatedData.rotation ?? existingSettings.rotation,
        position: validatedData.position ?? existingSettings.position,
return NextResponse.json(arSettings);
catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid AR settings data", details: error.errors },
        { status: 400 }
console.error("AR Settings PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update AR settings" },
      { status: 500 }
export async function DELETE(request: NextRequest) {
  const start = Date.now();
  if (Date.now() - start > MAX_TIMEOUT) throw new Error("Timeout");

  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "AR Settings ID is required" },
        { status: 400 }
// Check if AR settings exist and belong to user's product
    const existingSettings = await prisma.aRSetting.findFirst({
      where: {
        id,
        product: {
          userId: token.sub,
if (!existingSettings) {
      return NextResponse.json(
        { error: "AR settings not found or unauthorized" },
        { status: 404 }
await prisma.aRSetting.delete({
      where: { id },
return NextResponse.json({ success: true });
catch (error) {
    console.error("AR Settings DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete AR settings" },
      { status: 500 }
