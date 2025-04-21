'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-unified-auth';
import type { Conversation } from '@/lib/api/messages';

interface MessageContextType {
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startNewConversation: (
    recipientId: string,
    recipientName: string,
    content: string
  ) => Promise<string | null>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const calculateUnreadCount = (conversations: Conversation[]) => {
    return conversations.reduce((total, conversation) => {
      return total + (conversation.unreadCount || 0);
    }, 0);
  };

  const fetchConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
      setUnreadCount(calculateUnreadCount(data.conversations || []));
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      // Update optimistically
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId) {
            const updatedConv = {
              ...conv,
              messages: conv.messages.map(msg => ({ ...msg, read: true })),
              unreadCount: 0,
            };
            return updatedConv;
          }
          return conv;
        })
      );

      // Update unread count
      setUnreadCount(
        prev => prev - (conversations.find(c => c.id === conversationId)?.unreadCount || 0)
      );

      // Call API to update
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark conversation as read');
      }
    } catch (err) {
      console.error('Error marking conversation as read:', err);
      // Revert optimistic update on error by refetching
      fetchConversations();
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      // Get the unread count to update total
      const conversationUnreadCount =
        conversations.find(c => c.id === conversationId)?.unreadCount || 0;

      // Update optimistically
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setUnreadCount(prev => prev - conversationUnreadCount);

      // Call API to delete
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      // Revert optimistic update on error
      fetchConversations();
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      // Get the conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      // Get the recipient
      const recipient = conversation.participants.find(p => p.id !== user.id);
      if (!recipient) return;

      // Add optimistic update
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, optimisticMsg],
            };
          }
          return conv;
        })
      );

      // Send to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: recipient.id,
          recipientName: recipient.name,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Refresh conversations to get the latest state
      await fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      // Revert optimistic update on error
      fetchConversations();
    }
  };

  const startNewConversation = async (
    recipientId: string,
    recipientName: string,
    content: string
  ) => {
    if (!user || !content.trim()) return null;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          recipientName,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();

      // Refresh conversations
      await fetchConversations();

      // Return the new conversation ID
      return data.conversation?.id || null;
    } catch (err) {
      console.error('Error starting conversation:', err);
      return null;
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    if (user) {
      fetchConversations();

      // Poll for new messages every 30 seconds
      const intervalId = setInterval(fetchConversations, 30000);

      return () => clearInterval(intervalId);
    } else {
      setConversations([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const value = {
    conversations,
    unreadCount,
    loading,
    error,
    fetchConversations,
    markConversationAsRead,
    deleteConversation,
    sendMessage,
    startNewConversation,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
