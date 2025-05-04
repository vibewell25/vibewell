import OpenAI from 'openai';
import { env } from '@/config/env';
import { z } from 'zod';
import { RateLimiter } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

if (!env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Initialize OpenAI with proper configuration
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000, // 30 second timeout
});

// Use configurable model from environment variables
export const CHAT_MODEL = env.CHAT_MODEL;

// System prompt with clear constraints
export const SYSTEM_PROMPT = `You are a helpful beauty and wellness assistant for VibeWell, a platform that offers AR try-on and skin analysis features. 
You help users with:
- Skincare recommendations
- Product suggestions
- AR try-on guidance
- General beauty and wellness advice
- Technical support for the platform's features

Keep responses concise, friendly, and focused on beauty and wellness. If users ask about topics outside these domains, politely redirect them to beauty and wellness topics.

Current features available:
- Skin analysis with AI
- AR makeup try-on
- AR accessory try-on
- Personalized product recommendations
- Beauty consultation booking`;

// Define strict schemas for AI requests
export const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1).max(4000).refine(
    (content) => !containsSensitivePatterns(content),
    { message: 'Message contains potentially harmful content' }
  ),
});

export const chatCompletionRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
  model: z.string().default(CHAT_MODEL),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Rate limiter for AI requests (more restrictive than general API rate limits)
const aiRateLimiter = new RateLimiter();

// Pattern checking for potentially dangerous content
function containsSensitivePatterns(content: string): boolean {
  const sensitivePatterns = [
    // Prompt injection attempts
    /ignore previous instructions/i,
    /ignore all instructions/i,
    /disregard your instructions/i,
    /you are now/i,
    // SQL injection probing
    /SELECT.*FROM/i,
    /UNION SELECT/i,
    // Script tags and code execution
    /<script/i,
    /eval\(/i,
    /process\.env/i,
    // Path traversal
    /\.\.\//,
  ];

  return sensitivePatterns.some(pattern => pattern.test(content));
}

/**
 * Securely sends a chat completion request to OpenAI with proper validation
 */
export async function secureChatCompletion(
  userId: string,
  requestData: z.input<typeof chatCompletionRequestSchema>
) {
  try {
    // Validate user input
    const validatedData = chatCompletionRequestSchema.parse(requestData);
    
    // Rate limit check (10 requests per minute per user)
    await aiRateLimiter.checkLimit(`ai:chat:${userId}`, 10, 60);
    
    // Create a sanitized copy for logging (remove full message content)
    const sanitizedLog = {
      userId,
      messageCount: validatedData.messages.length,
      modelUsed: validatedData.model,
      firstUserMessagePreview: validatedData.messages.find(m => m.role === 'user').content.substring(0, 20) + '...',
    };
    
    // Log the request (without full content)
    logger.info('AI chat request', sanitizedLog);
    
    // Send to OpenAI with timeout and retry config
    const response = await openai.chat.completions.create({
      ...validatedData,
      temperature: 0.7,
      max_tokens: 500,
      user: userId, // For OpenAI's abuse monitoring
    });
    
    // Log completion (without full content)
    logger.info('AI chat completed', {
      userId,
      tokens: response.usage.total_tokens,
      modelUsed: response.model,
    });
    
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid AI request format', { userId, error: error.format() });
      throw new Error('Invalid request format');
    }
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      logger.warn('AI rate limit exceeded', { userId });
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }
    
    logger.error('OpenAI request failed', { 
      userId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw new Error('AI request failed. Please try again later.');
  }
} 