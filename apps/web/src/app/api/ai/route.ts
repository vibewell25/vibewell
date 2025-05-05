import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getSession } from '@auth0/nextjs-auth0';
import { rateLimit } from '@/lib/rate-limiter';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
// Rate limiting configuration for AI API (10 requests per minute)
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  tokensPerInterval: 10, // 10 requests per user per interval
/**
 * POST handler for AI API requests
 * This endpoint serves as a proxy to OpenAI API with authentication and rate limiting
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
const userId = session.user.sub || session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
// Apply rate limiting
    try {
      await limiter.check(userId, 1);
catch (error) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
// Parse request body
    const body = await req.json();
    const { messages, model = 'gpt-4', temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. Must provide messages array.' },
        { status: 400 }
// Add system message if not provided
    if (!messages.some(m => m.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: 'You are a helpful assistant for Vibewell, a beauty and wellness platform.'
// Send request to OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 2000,
      user: userId // For OpenAI to identify user for their monitoring
// Return the AI response
    return NextResponse.json({
      choices: completion.choices,
      usage: completion.usage,
      model: completion.model,
      id: completion.id
catch (error: any) {
    console.error('Error in AI API:', error);

    // Handle specific OpenAI API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again later.' },
        { status: 429 }
return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
/**
 * GET handler to check AI service status
 */
export async function GET() {
  try {
    // Check if OpenAI API key is configured
    if (!process.env['OPENAI_API_KEY']) {
      return NextResponse.json(
        { status: 'unavailable', message: 'OpenAI API key not configured' },
        { status: 503 }
return NextResponse.json({
      status: 'available',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
catch (error: any) {
    console.error('Error checking AI service status:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
