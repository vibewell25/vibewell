import { randomUUID } from 'crypto';

export interface Participant {
  id: string;
  name: string;
  avatar?: string | null;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
}

// In-memory store for messages (in a real app, this would be a database)
export const messagesStore = {
  conversations: [] as Conversation[],

  // Get all conversations for a user
  getUserConversations(userId: string): Conversation[] {
    return this.conversations.filter(conv => 
      conv.participants.some(p => p.id === userId)
    );
  },

  // Get a specific conversation
  getConversation(conversationId: string, userId: string): Conversation | null {
    return this.conversations.find(conv => 
      conv.id === conversationId && 
      conv.participants.some(p => p.id === userId)
    ) || null;
  },

  // Create a new conversation or get existing one
  getOrCreateConversation(senderId: string, senderName: string, senderAvatar: string | null, recipientId: string, recipientName: string, recipientAvatar: string | null = null): Conversation {
    let conversation = this.conversations.find(conv => 
      conv.participants.some(p => p.id === senderId) && 
      conv.participants.some(p => p.id === recipientId)
    );
    
    if (!conversation) {
      conversation = {
        id: randomUUID(),
        participants: [
          {
            id: senderId,
            name: senderName,
            avatar: senderAvatar,
          },
          {
            id: recipientId,
            name: recipientName,
            avatar: recipientAvatar,
            lastSeen: new Date().toISOString(),
          }
        ],
        messages: [],
        unreadCount: 0,
      };
      
      this.conversations.push(conversation);
    }
    
    return conversation;
  },

  // Add a message to a conversation
  addMessage(conversationId: string, senderId: string, content: string): Message {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const newMessage: Message = {
      id: randomUUID(),
      senderId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    conversation.messages.push(newMessage);
    
    // Update unread count for other participants
    const recipientIds = conversation.participants
      .filter(p => p.id !== senderId)
      .map(p => p.id);
    
    if (recipientIds.length > 0) {
      conversation.unreadCount += 1;
    }
    
    return newMessage;
  },

  // Mark all messages in a conversation as read for a user
  markConversationAsRead(conversationId: string, userId: string): boolean {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      return false;
    }
    
    let updated = false;
    
    conversation.messages = conversation.messages.map(msg => {
      if (msg.senderId !== userId && !msg.read) {
        updated = true;
        return { ...msg, read: true };
      }
      return msg;
    });
    
    if (updated) {
      conversation.unreadCount = 0;
    }
    
    return updated;
  },

  // Delete a conversation
  deleteConversation(conversationId: string, userId: string): boolean {
    const initialLength = this.conversations.length;
    this.conversations = this.conversations.filter(conv => 
      !(conv.id === conversationId && conv.participants.some(p => p.id === userId))
    );
    
    return this.conversations.length < initialLength;
  }
}; 