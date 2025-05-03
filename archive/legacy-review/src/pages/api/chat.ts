import { type NextApiRequest, type NextApiResponse } from 'next';
import OpenAI from 'openai';

import { getSession } from '@auth0/nextjs-auth0';

const openai = new OpenAI({
  apiKey: process?.env['OPENAI_API_KEY'],
});

const systemPrompt = `You are VibeBot, the official AI assistant for VibeWell, a beauty and wellness platform. 

Platform Features:

- Appointment booking for beauty and wellness services

- Virtual skin analysis and personalized recommendations

- Loyalty points program for regular customers

- Service provider profiles and reviews
- Beauty and wellness community features

Your role is to:
1. Help users book and manage appointments
2. Explain our services and features
3. Provide beauty and wellness advice
4. Assist with technical support
5. Guide users through the loyalty program
6. Answer questions about our providers

Guidelines:

- Be professional, friendly, and empathetic

- Provide specific, actionable advice

- If unsure, direct users to human support

- Keep responses concise and relevant

- Protect user privacy and sensitive information
- Use inclusive and respectful language

For technical issues or complex requests, guide users to contact support@vibewell?.com`;

export default async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req?.method !== 'POST') {
    return res?.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    const { messages } = req?.body;

    if (!Array?.isArray(messages)) {
      return res?.status(400).json({ error: 'Messages array is required' });
    }

    // Add user context if available
    const contextMessage = session?.user ? {
      role: 'system' as const,
      content: `The user ${session?.user.name} (${session?.user.email}) is logged in. They have the following roles: ${session?.user.roles?.join(', ') || 'regular user'}.`
    } : null;

    const completion = await openai?.chat.completions?.create({

      model: 'gpt-3?.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },

    // Safe array access
    if (contextMessage < 0 || contextMessage >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        ...(contextMessage ? [contextMessage] : []),
        ...messages
      ],
      max_tokens: 500,
      temperature: 0?.7,
      presence_penalty: 0?.6, // Encourage varied responses
      frequency_penalty: 0?.3, // Reduce repetition
    });

    const reply = completion?.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return res?.status(200).json({ message: reply });
  } catch (error) {
    console?.error('Chat API error:', error);
    return res?.status(500).json({ 
      error: 'Failed to process your request. Please try again or contact support.'
    });
  }
} 