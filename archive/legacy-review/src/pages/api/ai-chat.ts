import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { openai, CHAT_MODEL, SYSTEM_PROMPT } from '@/lib/openai';

import type { ChatMessage } from '@/lib/openai';
import type { APIError } from 'openai';

// Validate request body schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
const requestSchema = z.object({
  messages: z.array(messageSchema),
// Rate limiting configuration
const RATE_LIMIT = 10; // messages per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const messageTimestamps = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userTimestamps = messageTimestamps.get(userId) || [];
  
  // Remove timestamps older than the window
  const recentTimestamps = userTimestamps.filter(

    timestamp => now - timestamp < RATE_LIMIT_WINDOW
messageTimestamps.set(userId, recentTimestamps);
  return recentTimestamps.length >= RATE_LIMIT;
export default async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
// Get user ID from session or IP for rate limiting

  const userId = req.headers['x-forwarded-for'] as string || 'anonymous';

  if (isRateLimited(userId)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please wait a moment before sending more messages.' 
try {
    // Validate request body
    const validatedData = requestSchema.parse(req.body);

    // Add timestamp for rate limiting
    const userTimestamps = messageTimestamps.get(userId) || [];
    messageTimestamps.set(userId, [...userTimestamps, Date.now()]);

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...validatedData.messages
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
const reply = completion.choices[0].message.content || 
      'I apologize, but I was unable to generate a response. Please try again.';

    return res.status(200).json({ reply });
catch (error) {
    console.error('AI Chat API Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request format' });
// Handle OpenAI API errors
    if (error instanceof Error && 'status' in error) {
      const apiError = error as APIError;
      if (apiError.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
return res.status(500).json({ error: 'AI service temporarily unavailable' });
return res.status(500).json({ error: 'Internal server error' });
