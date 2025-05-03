import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { OpenAI } from 'openai';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'This is the AI assistant response.',
                role: 'assistant'
              },
              finish_reason: 'stop'
            }]
          })
        }
      }
    }))
  };
});

// Mock Redis for rate limiting
jest.mock('@/lib/redis', () => ({
  getRedisInstance: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1)
  })
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'conversation-123',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      update: jest.fn()
    },
    message: {
      create: jest.fn().mockResolvedValue({
        id: 'message-123',
        conversationId: 'conversation-123',
        content: 'Hello AI assistant',
        role: 'user',
        createdAt: new Date()
      })
    }
  }
}));

describe('AI Assistant API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user by default
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' }
    });
  });

  it('should respond to user message', async () => {
    // Arrange
    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello AI assistant',
        conversationId: null // New conversation
      })
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.reply).toBe('This is the AI assistant response.');
    expect(data.conversationId).toBeDefined();
  });

  it('should require authentication', async () => {
    // Arrange - Mock user as not authenticated
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello AI assistant',
        conversationId: null
      })
    });

    // Act
    const response = await POST(req);
    
    // Assert
    expect(response.status).toBe(401);
  });

  it('should validate input data', async () => {
    // Arrange - Empty message
    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '', // Empty message
        conversationId: null
      })
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should handle rate limiting', async () => {
    // Arrange - Mock Redis to indicate rate limit exceeded
    const { getRedisInstance } = require('@/lib/redis');
    getRedisInstance.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      incr: jest.fn().mockResolvedValue(11), // Over the limit
      expire: jest.fn().mockResolvedValue(1)
    });

    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello AI assistant',
        conversationId: null
      })
    });

    // Act
    const response = await POST(req);
    
    // Assert
    expect(response.status).toBe(429);
  });

  it('should continue existing conversation', async () => {
    // Arrange - Mock existing conversation
    const { prisma } = require('@/lib/prisma');
    prisma.conversation.findUnique.mockResolvedValueOnce({
      id: 'existing-conversation',
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Follow-up question',
        conversationId: 'existing-conversation'
      })
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.reply).toBe('This is the AI assistant response.');
    expect(data.conversationId).toBe('existing-conversation');
    
    // Should update existing conversation
    expect(prisma.conversation.update).toHaveBeenCalled();
  });

  it('should handle OpenAI API errors gracefully', async () => {
    // Arrange - Mock OpenAI error
    const OpenAIMock = require('openai').OpenAI;
    OpenAIMock.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('OpenAI API error'))
        }
      }
    }));

    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello AI assistant',
        conversationId: null
      })
    });

    // Act
    const response = await POST(req);
    
    // Assert
    expect(response.status).toBe(500);
  });

  it('should sanitize user input', async () => {
    // Arrange - Message with potential XSS
    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '<script>alert("XSS")</script>Hello AI assistant',
        conversationId: null
      })
    });

    // Get the mocked OpenAI instance
    const openaiInstance = new OpenAI().chat.completions;

    // Act
    await POST(req);
    
    // Assert - Check that sanitized input was sent to OpenAI
    expect(openaiInstance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.not.stringContaining('<script>')
          })
        ])
      })
    );
  });

  it('should apply content moderation', async () => {
    // Arrange - OpenAI with content moderation
    OpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'I cannot provide information about harmful topics.',
                role: 'assistant'
              },
              finish_reason: 'content_filter'
            }]
          })
        }
      },
      moderations: {
        create: jest.fn().mockResolvedValue({
          results: [{
            flagged: true,
            categories: { hate: true }
          }]
        })
      }
    }));

    const req = new NextRequest('https://vibewell.com/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Inappropriate content that would be flagged',
        conversationId: null
      })
    });

    // Act
    const response = await POST(req);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data.flagged).toBe(true);
    expect(data.reply).toBe('I cannot provide information about harmful topics.');
  });
}); 