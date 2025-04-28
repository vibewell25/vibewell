import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { messagesStore } from '@/lib/api/messages';

if (process.env.NODE_ENV === 'development' && messagesStore.conversations.length === 0) {
  // Sample user IDs
  const currentUserId = 'current-user';
  const user1Id = 'user1';
  const user2Id = 'user2';
  const user3Id = 'user3';

  // Create conversations with sample data
  const conversation1 = messagesStore.getOrCreateConversation(
    currentUserId,
    'Current User',
    '/avatar-current.png',
    user1Id,
    'Emma Thompson',
    '/avatar1.png',
  );

  // Add messages to conversation 1
  messagesStore.addMessage(
    conversation1.id,
    user1Id,
    "Hi there! I saw your post about meditation. I've been practicing for years and would love to share some tips!",
  );
  messagesStore.addMessage(
    conversation1.id,
    currentUserId,
    "That would be amazing! I'm just getting started and could use some guidance.",
  );
  messagesStore.addMessage(
    conversation1.id,
    user1Id,
    'Great! I recommend starting with just 5 minutes a day and gradually increasing. Consistency is more important than duration.',
  );

  // Create conversation 2
  const conversation2 = messagesStore.getOrCreateConversation(
    currentUserId,
    'Current User',
    '/avatar-current.png',
    user2Id,
    'David Chen',
    '/avatar2.png',
  );

  // Add messages to conversation 2
  messagesStore.addMessage(
    conversation2.id,
    user2Id,
    'Hey! Are you joining the yoga challenge next week?',
  );

  // Create conversation 3
  const conversation3 = messagesStore.getOrCreateConversation(
    currentUserId,
    'Current User',
    '/avatar-current.png',
    user3Id,
    'Sarah Williams',
    '/avatar3.png',
  );

  // Add messages to conversation 3
  messagesStore.addMessage(
    conversation3.id,
    user3Id,
    'Thanks for the nutrition advice! I tried that recipe and it was delicious.',
  );
  messagesStore.addMessage(
    conversation3.id,
    user3Id,
    'Do you have any other healthy meal prep suggestions?',
  );
}

// Schema for sending a message
const SendMessageSchema = z.object({
  recipientId: z.string(),
  recipientName: z.string().optional(),
  content: z.string().min(1).max(2000),
});

// GET /api/messages - Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // For development, use 'current-user' if testing locally
    const effectiveUserId = process.env.NODE_ENV === 'development' ? 'current-user' : userId;

    // Get user's conversations
    const userConversations = messagesStore.getUserConversations(effectiveUserId);

    return NextResponse.json({ conversations: userConversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // For development, use 'current-user' if testing locally
    const effectiveUserId = process.env.NODE_ENV === 'development' ? 'current-user' : userId;

    // Validate request data
    const validationResult = SendMessageSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const { recipientId, recipientName, content } = validationResult.data;

    // Get or create conversation
    const conversation = messagesStore.getOrCreateConversation(
      effectiveUserId,
      session.user.name || 'Unknown User',
      session.user.image || null,
      recipientId,
      recipientName || 'User',
      null,
    );

    // Add message to conversation
    const newMessage = messagesStore.addMessage(conversation.id, effectiveUserId, content);

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversation,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
