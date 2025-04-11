'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Messaging, type Conversation as UIConversation } from '@/components/messaging';
import { toast, Toaster } from 'react-hot-toast';
import type { Conversation } from '@/lib/api/messages';
import Link from 'next/link';
import { 
  AdjustmentsHorizontalIcon,
  PlusIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { GoalCreationModal } from '@/components/wellness/GoalCreationModal';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Goal } from '@/types/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
      
      // Reset any errors
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    // Check if we have initiate parameters to start a new conversation
    const initiateUserId = searchParams?.get('initiate');
    const initiateUserName = searchParams?.get('name');
    
    if (initiateUserId && initiateUserName && user && !isLoading) {
      // Check if we already have a conversation with this user
      const existingConversation = conversations.find(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== user.id);
        return otherParticipant?.id === initiateUserId;
      });
      
      if (existingConversation) {
        // If we already have a conversation, select it
        setSelectedConversation(existingConversation.id);
      } else {
        // Create a new conversation by sending the first message
        handleSendInitialMessage(initiateUserId, initiateUserName);
      }
    } 
    // If no initiate params or after handling them, default to first conversation if none selected
    else if (conversations.length > 0 && !selectedConversation && !isLoading) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation, searchParams, user, isLoading]);

  // Send a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || loading || !user) return;
    
    try {
      // Get the current conversation
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;
      
      // Get the recipient
      const recipient = conversation.participants.find(p => p.id !== user.id);
      if (!recipient) return;
      
      // Add optimistic update
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      // Update UI optimistically
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === selectedConversation) {
            return {
              ...conv,
              messages: [...conv.messages, optimisticMsg]
            };
          }
          return conv;
        })
      );
      
      // Clear input
      setNewMessage('');
      
      // Send to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: recipient.id,
          recipientName: recipient.name,
          content: newMessage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Refresh conversations to get the latest state
      fetchConversations();
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  // Handler for initiating a new conversation
  const handleSendInitialMessage = async (recipientId: string, recipientName: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId,
          recipientName,
          content: `Hello ${recipientName}, I'd like to connect with you!`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }
      
      const data = await response.json();
      
      // Refresh conversations and select the new one
      await fetchConversations();
      setSelectedConversation(data.conversation.id);
      
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Failed to start conversation');
    }
  };

  // Mark conversation as read
  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    try {
      // Mark as read through API
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark conversation as read');
      }
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg => ({ ...msg, read: true })),
              unreadCount: 0
            };
          }
          return conv;
        })
      );
      
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // Remove from state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // Select another conversation if available
      if (conversationId === selectedConversation) {
        const nextConversation = conversations.find(c => c.id !== conversationId);
        setSelectedConversation(nextConversation?.id || null);
      }
      
      toast.success('Conversation deleted');
      
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Failed to delete conversation');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12 flex justify-center items-center h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container-app py-12 flex flex-col justify-center items-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Sign in to access messages</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to view and send messages.</p>
          <a href="/auth/signin" className="btn-primary">Sign In</a>
        </div>
      </Layout>
    );
  }

  // Convert the API conversation type to the UI component type
  const uiConversations: UIConversation[] = conversations.map(conv => ({
    ...conv,
    participants: conv.participants.map(p => ({
      ...p,
      avatar: p.avatar || undefined, // Convert null to undefined for UI component
    })),
  }));

  return (
    <Layout>
      <div className="container-app py-12">
        <Toaster position="top-right" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Connect with other wellness enthusiasts
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              className="ml-2 underline" 
              onClick={fetchConversations}
            >
              Try again
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <p>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] bg-muted/20 rounded-lg">
            <h2 className="text-xl font-bold mb-2">No conversations yet</h2>
            <p className="text-muted-foreground mb-6">
              Start connecting with other users to begin messaging
            </p>
            <a href="/community" className="btn-primary">
              Explore Community
            </a>
          </div>
        ) : (
          <Messaging
            conversations={uiConversations}
            currentUserId={user.id}
            onSendMessage={(conversationId, content) => {
              // Set the selected conversation and message content
              setSelectedConversation(conversationId);
              setNewMessage(content);
              // Then send the message
              handleSendMessage();
            }}
            onConversationSelect={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            defaultSelectedConversation={selectedConversation || undefined}
          />
        )}
      </div>
    </Layout>
  );
} 