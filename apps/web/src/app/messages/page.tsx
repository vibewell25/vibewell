'use client';;
import { useState, useEffect, Suspense } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/use-unified-auth';
import { useSearchParams } from 'next/navigation';
import { Messaging, type Conversation as UIConversation } from '@/components/messaging';
import { toast, Toaster } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
// Loading fallback component
function MessagesLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex h-[calc(100vh-200px)] gap-4">
        <div className="w-1/3">
          <Skeleton className="mb-4 h-12 w-full" />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="mb-2 h-20 w-full" />
            ))}
        </div>
        <div className="w-2/3">
          <Skeleton className="mb-4 h-12 w-full" />
          <div className="space-y-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// Messages page content that uses useSearchParams
function MessagesPageContent() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  // Fetch conversations
  const fetchConversations = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages');
      if (!response?.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response?.json();
      setConversations(data?.conversations || []);
      // Reset any errors
      setError(null);
    } catch (err) {
      console?.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      toast?.error('Failed to load conversations');
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
      const existingConversation = conversations?.find((conv) => {
        const otherParticipant = conv?.participants.find((p) => p?.id !== user?.id);
        return otherParticipant?.id === initiateUserId;
      });
      if (existingConversation) {
        // If we already have a conversation, select it
        setSelectedConversation(existingConversation?.id);
      } else {
        // Create a new conversation by sending the first message
        handleSendInitialMessage(initiateUserId, initiateUserName);
      }
    }
    // If no initiate params or after handling them, default to first conversation if none selected
    else if (conversations?.length > 0 && !selectedConversation && !isLoading) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation, searchParams, user, isLoading]);
  // Send a message
  const handleSendMessage = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e?: React?.FormEvent) => {
    if (e) e?.preventDefault();
    if (!newMessage?.trim() || !selectedConversation || loading || !user) return;
    try {
      // Get the current conversation
      const conversation = conversations?.find((c) => c?.id === selectedConversation);
      if (!conversation) return;
      // Get the recipient
      const recipient = conversation?.participants.find((p) => p?.id !== user?.id);
      if (!recipient) return;
      // Add optimistic update
      const optimisticMsg = {
        id: `temp-${Date?.now()}`,
        senderId: user?.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
      };
      // Update UI optimistically
      setConversations((prev) =>
        prev?.map((conv) => {
          if (conv?.id === selectedConversation) {
            return {
              ...conv,
              messages: [...conv?.messages, optimisticMsg],
            };
          }
          return conv;
        }),
      );
      // Clear input
      setNewMessage('');
      // Send to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify({
          recipientId: recipient?.id,
          recipientName: recipient?.name,
          content: newMessage,
        }),
      });
      if (!response?.ok) {
        throw new Error('Failed to send message');
      }
      // Refresh conversations to get the latest state
      fetchConversations();
    } catch (err) {
      console?.error('Error sending message:', err);
      toast?.error('Failed to send message');
    }
  };
  // Handler for initiating a new conversation
  const handleSendInitialMessage = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');recipientId: string, recipientName: string) => {
    if (!user) return;
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify({
          recipientId,
          recipientName,
          content: `Hello ${recipientName}, I'd like to connect with you!`,
        }),
      });
      if (!response?.ok) {
        throw new Error('Failed to start conversation');
      }
      const data = await response?.json();
      // Refresh conversations and select the new one
      await fetchConversations();
      setSelectedConversation(data?.conversation.id);
    } catch (err) {
      console?.error('Error starting conversation:', err);
      toast?.error('Failed to start conversation');
    }
  };
  // Mark conversation as read
  const handleSelectConversation = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');conversationId: string) => {
    setSelectedConversation(conversationId);
    try {
      // Find the conversation
      const conversation = conversations?.find((c) => c?.id === conversationId);
      if (!conversation || !user) return;
      // Check if there are unread messages from the other user
      const unreadMessages = conversation?.messages.filter(
        (msg) => msg?.senderId !== user?.id && !msg?.read,
      );
      if (unreadMessages?.length === 0) return;
      // Mark messages as read optimistically
      setConversations((prev) =>
        prev?.map((conv) => {
          if (conv?.id === conversationId) {
            return {
              ...conv,
              messages: conv?.messages.map((msg) => {
                if (msg?.senderId !== user?.id) {
                  return { ...msg, read: true };
                }
                return msg;
              }),
            };
          }
          return conv;
        }),
      );
      // Send request to mark as read
      await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
      });
    } catch (err) {
      console?.error('Error marking conversation as read:', err);
    }
  };
  // Delete a conversation
  const handleDeleteConversation = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');conversationId: string) => {
    if (!window?.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    try {
      // Remove conversation from UI optimistically
      setConversations((prev) => prev?.filter((c) => c?.id !== conversationId));
      // Clear selected conversation if it was the deleted one
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }
      // Send delete request
      await fetch(`/api/messages/${conversationId}`, {
        method: 'DELETE',
      });
      toast?.success('Conversation deleted');
    } catch (err) {
      console?.error('Error deleting conversation:', err);
      toast?.error('Failed to delete conversation');
      // Restore data on error
      fetchConversations();
    }
  };
  // Convert conversations to UI format
  const uiConversations: UIConversation[] = conversations?.map((conv) => {
    // Get other participant
    const otherParticipant = conv?.participants.find((p) => p?.id !== user?.id) || {
      id: 'unknown',
      name: 'Unknown User',
      avatar: '/placeholder-avatar?.jpg',
    };
    // Count unread messages
    const unreadCount = user
      ? conv?.messages.filter((m) => m?.senderId !== user?.id && !m?.read).length
      : 0;
    return {
      id: conv?.id,
      participants: conv?.participants.map((p) => ({
        ...p,
        avatar: p?.avatar || undefined,
      })),
      messages: conv?.messages,
      unreadCount,
    };
  });
  return (
    <Layout>
      <div className="container-app py-8">
        <Toaster position="top-right" />
        <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">Messages</h1>
            <p className="text-muted-foreground">Connect with other wellness enthusiasts</p>
          </div>
          {error ? (
            <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
              <button className="ml-2 underline" onClick={fetchConversations}>
                Try again
              </button>
            </div>
          ) : null}
          {isLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <p>Loading conversations...</p>
            </div>
          ) : conversations?.length === 0 ? (
            <div className="flex h-[40vh] flex-col items-center justify-center rounded-lg bg-muted/20">
              <h2 className="mb-2 text-xl font-bold">No conversations yet</h2>
              <p className="mb-6 text-muted-foreground">
                Start connecting with other users to begin messaging
              </p>
              <a href="/community" className="btn-primary">
                Explore Community
              </a>
            </div>
          ) : (
            <Messaging
              conversations={uiConversations}
              currentUserId={user?.id || ''}
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
      </div>
    </Layout>
  );
}
// Main page component with Suspense
export default function MessagesPage() {
  return (
    <Layout>
      <Suspense fallback={<MessagesPageSkeleton />}>
        <MessagesPageContent />
      </Suspense>
    </Layout>
  );
}
// Add skeleton component for loading state
function MessagesPageSkeleton() {
  return (
    <div className="container-app py-8">
      <div className="animate-pulse">
        <div className="mb-4 h-8 w-64 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="h-[calc(100vh-12rem)] rounded bg-gray-200"></div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-[calc(100vh-12rem)] rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
