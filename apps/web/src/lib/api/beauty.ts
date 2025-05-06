import { prisma } from '@/lib/database/client';

import { Prisma } from '@prisma/client';

export type SkinCareRoutine = {
  id: string;
  userId: string;
  name: string;
  description: string;
  timeOfDay: 'morning' | 'evening' | 'both';
  products: SkinCareProduct[];
  createdAt: string;
  updatedAt: string;
export type SkinCareProduct = {
  id: string;
  name: string;
  brand: string;
  category: SkinCareCategory;
  frequency: string;
  notes?: string;
  ingredients?: string[];
export type SkinCareCategory =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'mask'
  | 'treatment'
  | 'eye_care'
  | 'exfoliant'
  | 'other';

export type SkinConditionLog = {
  id: string;
  date: string;
  concerns: SkinConcern[];
  mood: number;
  stress: number;
  sleep: number;
  hydration: number;
  notes?: string;
  photos?: string[];
export type SkinConcern =
  | 'acne'
  | 'dryness'
  | 'oiliness'
  | 'redness'
  | 'sensitivity'
  | 'dark_spots'
  | 'fine_lines'
  | 'other';

// Get user's skincare routines
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getSkinCareRoutines(userId: string): Promise<SkinCareRoutine[]> {
  try {
    const routines = await prisma.skinCareRoutine.findMany({
      where: { userId },
      include: {
        products: true,
orderBy: { createdAt: 'desc' },
return routines.map((routine) => ({
      id: routine.id,
      userId: routine.userId,
      name: routine.name,
      description: routine.description,
      timeOfDay: routine.timeOfDay as 'morning' | 'evening' | 'both',
      products: routine.products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category as SkinCareCategory,
        frequency: product.frequency,
        notes: product.notes || undefined,
        ingredients: (product.ingredients as string[]) || undefined,
)),
      createdAt: routine.createdAt.toISOString(),
      updatedAt: routine.updatedAt.toISOString(),
));
catch (error) {
    console.error('Error in getSkinCareRoutines:', error);
    return [];
// Create a new skincare routine
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createSkinCareRoutine(
  userId: string,
  routineData: Omit<SkinCareRoutine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<SkinCareRoutine | null> {
  try {
    const routine = await prisma.skinCareRoutine.create({
      data: {
        userId,
        name: routineData.name,
        description: routineData.description,
        timeOfDay: routineData.timeOfDay,
        products: {
          create: routineData.products.map((product) => ({
            name: product.name,
            brand: product.brand,
            category: product.category,
            frequency: product.frequency,
            notes: product.notes,
            ingredients: product.ingredients,
)),
include: {
        products: true,
return {
      id: routine.id,
      userId: routine.userId,
      name: routine.name,
      description: routine.description,
      timeOfDay: routine.timeOfDay as 'morning' | 'evening' | 'both',
      products: routine.products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category as SkinCareCategory,
        frequency: product.frequency,
        notes: product.notes || undefined,
        ingredients: (product.ingredients as string[]) || undefined,
)),
      createdAt: routine.createdAt.toISOString(),
      updatedAt: routine.updatedAt.toISOString(),
catch (error) {
    console.error('Error in createSkinCareRoutine:', error);
    return null;
// Log daily skin condition
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); logSkinCondition(
  userId: string,
  logData: Omit<SkinConditionLog, 'id'>,
): Promise<SkinConditionLog | null> {
  try {
    const log = await prisma.skinConditionLog.create({
      data: {
        userId,
        date: logData.date,
        concerns: logData.concerns,
        mood: logData.mood,
        stress: logData.stress,
        sleep: logData.sleep,
        hydration: logData.hydration,
        notes: logData.notes,
        photos: logData.photos,
return {
      id: log.id,
      date: log.date,
      concerns: log.concerns as SkinConcern[],
      mood: log.mood,
      stress: log.stress,
      sleep: log.sleep,
      hydration: log.hydration,
      notes: log.notes || undefined,
      photos: (log.photos as string[]) || undefined,
catch (error) {
    console.error('Error in logSkinCondition:', error);
    return null;
// Get skin condition logs within a date range
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getSkinConditionLogs(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<SkinConditionLog[]> {
  try {
    const where: Prisma.SkinConditionLogWhereInput = { userId };

    if (startDate) where.date = { gte: startDate };
    if (endDate) where.date = { ...where.date, lte: endDate };

    const logs = await prisma.skinConditionLog.findMany({
      where,
      orderBy: { date: 'desc' },
return logs.map((log) => ({
      id: log.id,
      date: log.date,
      concerns: log.concerns as SkinConcern[],
      mood: log.mood,
      stress: log.stress,
      sleep: log.sleep,
      hydration: log.hydration,
      notes: log.notes || undefined,
      photos: (log.photos as string[]) || undefined,
));
catch (error) {
    console.error('Error in getSkinConditionLogs:', error);
    return [];
// Get beauty progress summary
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getBeautyProgressSummary(userId: string): Promise<{
  totalRoutines: number;
  totalProducts: number;
  consistencyScore: number;
  commonConcerns: SkinConcern[];
  recentImprovements: string[];
> {
  try {
    const [routines, products, recentLogs] = await Promise.all([
      prisma.skinCareRoutine.count({ where: { userId } }),
      prisma.skinCareProduct.count({
        where: { routine: { userId } },
),
      prisma.skinConditionLog.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
orderBy: { date: 'desc' },
),
    ]);

    // Calculate consistency score (0-100) based on logging frequency
    const daysWithLogs = new Set(recentLogs.map((log) => log.date)).size;

    const consistencyScore = Math.round((daysWithLogs / 30) * 100);

    // Analyze common skin concerns
    const concernCounts = recentLogs.reduce(
      (acc, log) => {
        (log.concerns as SkinConcern[]).forEach((concern) => {

    acc[concern] = (acc[concern] || 0) + 1;
return acc;
{} as Record<SkinConcern, number>,
const commonConcerns = Object.entries(concernCounts)

      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    .map(([concern]) => concern as SkinConcern);

    // Analyze improvements
    const recentImprovements = analyzeImprovements(recentLogs);

    return {
      totalRoutines: routines,
      totalProducts: products,
      consistencyScore,
      commonConcerns,
      recentImprovements,
catch (error) {
    console.error('Error in getBeautyProgressSummary:', error);
    return {
      totalRoutines: 0,
      totalProducts: 0,
      consistencyScore: 0,
      commonConcerns: [],
      recentImprovements: [],
// Helper function to analyze improvements
function analyzeImprovements(logs: any[]): string[] {
  const improvements: string[] = [];

  if (logs.length < 7) return improvements;

  const recent = logs.slice(0, 7);
  const older = logs.slice(7, 14);

  // Compare average metrics
  const getAverage = (arr: any[], key: string) =>

    arr.reduce((sum, log) => sum + log[key], 0) / arr.length;

  const metrics = {
    hydration: { recent: getAverage(recent, 'hydration'), older: getAverage(older, 'hydration') },
    stress: { recent: getAverage(recent, 'stress'), older: getAverage(older, 'stress') },
    sleep: { recent: getAverage(recent, 'sleep'), older: getAverage(older, 'sleep') },
if (metrics.hydration.recent > metrics.hydration.older + 1) {
    improvements.push('Skin hydration has improved');
if (metrics.stress.recent < metrics.stress.older - 1) {
    improvements.push('Stress levels have decreased');
if (metrics.sleep.recent > metrics.sleep.older + 1) {
    improvements.push('Sleep quality has improved');
// Analyze concern frequency
  const recentConcerns = new Set(recent.flatMap((log) => log.concerns));
  const olderConcerns = new Set(older.flatMap((log) => log.concerns));

  olderConcerns.forEach((concern) => {
    if (!recentConcerns.has(concern)) {
      improvements.push(`${concern.replace('_', ' ')} has improved`);
return improvements;
export interface RoutineStep {
  id: string;
  order: number;
  name: string;
  category: string;
  completed: boolean;
export interface Routine {
  id: string;
  type: string;
  steps: RoutineStep[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getRoutines(): Promise<Routine[]> {
  const routines = await prisma.beautyRoutine.findMany({
    where: {

      userId: 'current-user-id', // TODO: Replace with actual user ID from auth
include: {
      steps: {
        orderBy: {
          order: 'asc',
return routines.map((routine) => ({
    id: routine.id,
    type: routine.type,
    steps: routine.steps.map((step) => ({
      id: step.id,
      order: step.order,
      name: step.name,
      category: step.category,
      completed: step.completed,
)),
    userId: routine.userId,
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
));
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); createRoutine(
  routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Routine> {
  const { steps, ...routineData } = routine;

  const createdRoutine = await prisma.beautyRoutine.create({
    data: {
      ...routineData,
      steps: {
        create: steps.map((step) => ({
          order: step.order,
          name: step.name,
          category: step.category,
          completed: step.completed,
)),
include: {
      steps: true,
return {
    id: createdRoutine.id,
    type: createdRoutine.type,
    steps: createdRoutine.steps.map((step) => ({
      id: step.id,
      order: step.order,
      name: step.name,
      category: step.category,
      completed: step.completed,
)),
    userId: createdRoutine.userId,
    createdAt: createdRoutine.createdAt,
    updatedAt: createdRoutine.updatedAt,
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateRoutine(routine: Routine): Promise<Routine> {
  const { id, steps, ...routineData } = routine;

  // Update the routine and its steps
  const updatedRoutine = await prisma.beautyRoutine.update({
    where: { id },
    data: {
      ...routineData,
      steps: {
        deleteMany: {}, // Remove all existing steps
        create: steps.map((step) => ({
          order: step.order,
          name: step.name,
          category: step.category,
          completed: step.completed,
)),
include: {
      steps: {
        orderBy: {
          order: 'asc',
return {
    id: updatedRoutine.id,
    type: updatedRoutine.type,
    steps: updatedRoutine.steps.map((step) => ({
      id: step.id,
      order: step.order,
      name: step.name,
      category: step.category,
      completed: step.completed,
)),
    userId: updatedRoutine.userId,
    createdAt: updatedRoutine.createdAt,
    updatedAt: updatedRoutine.updatedAt,
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); deleteRoutine(id: string): Promise<void> {
  await prisma.beautyRoutine.delete({
    where: { id },
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateRoutineStep(
  routineId: string,
  stepId: string,
  data: Partial<RoutineStep>,
): Promise<RoutineStep> {
  const updatedStep = await prisma.beautyRoutineStep.update({
    where: {
      id: stepId,
      routineId,
data,
return {
    id: updatedStep.id,
    order: updatedStep.order,
    name: updatedStep.name,
    category: updatedStep.category,
    completed: updatedStep.completed,
