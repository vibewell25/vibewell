'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

// Dummy data for conversations
const DUMMY_CONVERSATIONS = [
  {
    id: 'conv1',
    participants: [
      {
        id: 'user1',
        name: 'Emma Thompson',
        avatar: '/avatar1.png',
        lastSeen: '2023-07-15T14:30:00.000Z',
      },
      {
        id: 'current-user',
        name: 'Current User',
        avatar: '/avatar-current.png',
      }
    ],
    messages: [
      {
        id: 'msg1',
        senderId: 'user1',
        content: 'Hi there! I saw your post about meditation. I\'ve been practicing for years and would love to share some tips!',
        timestamp: '2023-07-14T09:30:00.000Z',
        read: true,
      },
      {
        id: 'msg2',
        senderId: 'current-user',
        content: 'That would be amazing! I\'m just getting started and could use some guidance.',
        timestamp: '2023-07-14T09:45:00.000Z',
        read: true,
      },
      {
        id: 'msg3',
        senderId: 'user1',
        content: 'Great! I recommend starting with just 5 minutes a day and gradually increasing. Consistency is more important than duration.',
        timestamp: '2023-07-14T10:00:00.000Z',
        read: true,
      },
    ],
    unreadCount: 0,
  },
  {
    id: 'conv2',
    participants: [
      {
        id: 'user2',
        name: 'David Chen',
        avatar: '/avatar2.png',
        lastSeen: '2023-07-15T10:15:00.000Z',
      },
      {
        id: 'current-user',
        name: 'Current User',
        avatar: '/avatar-current.png',
      }
    ],
    messages: [
      {
        id: 'msg4',
        senderId: 'user2',
        content: 'Hey! Are you joining the yoga challenge next week?',
        timestamp: '2023-07-15T08:30:00.000Z',
        read: false,
      },
    ],
    unreadCount: 1,
  },
  {
    id: 'conv3',
    participants: [
      {
        id: 'user3',
        name: 'Sarah Williams',
        avatar: '/avatar3.png',
        lastSeen: '2023-07-14T22:45:00.000Z',
      },
      {
        id: 'current-user',
        name: 'Current User',
        avatar: '/avatar-current.png',
      }
    ],
    messages: [
      {
        id: 'msg5',
        senderId: 'user3',
        content: 'Thanks for the nutrition advice! I tried that recipe and it was delicious.',
        timestamp: '2023-07-14T18:22:00.000Z',
        read: false,
      },
      {
        id: 'msg6',
        senderId: 'user3',
        content: 'Do you have any other healthy meal prep suggestions?',
        timestamp: '2023-07-14T18:25:00.000Z',
        read: false,
      },
    ],
    unreadCount: 2,
  },
];

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState(DUMMY_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have initiate parameters to start a new conversation
    const initiateUserId = searchParams.get('initiate');
    const initiateUserName = searchParams.get('name');
    
    if (initiateUserId && initiateUserName && user) {
      // Check if we already have a conversation with this user
      const existingConversation = conversations.find(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== 'current-user');
        return otherParticipant?.id === initiateUserId;
      });
      
      if (existingConversation) {
        // If we already have a conversation, select it
        setSelectedConversation(existingConversation.id);
      } else {
        // Create a new conversation
        const newConv = {
          id: `conv-${Date.now()}`,
          participants: [
            {
              id: initiateUserId,
              name: initiateUserName,
              avatar: '/avatar-placeholder.png', // Default avatar
              lastSeen: new Date().toISOString(),
            },
            {
              id: 'current-user',
              name: 'Current User',
              avatar: '/avatar-current.png',
            }
          ],
          messages: [],
          unreadCount: 0,
        };
        
        setConversations([newConv, ...conversations]);
        setSelectedConversation(newConv.id);
      }
    } 
    // If no initiate params or after handling them, default to first conversation if none selected
    else if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation, searchParams, user]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== 'current-user');
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get the currently selected conversation
  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  // Get the other participant in the conversation
  const otherParticipant = currentConversation?.participants.find(p => p.id !== 'current-user');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || loading || !user) return;
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation) {
        const newMsg = {
          id: `msg${Date.now()}`,
          senderId: 'current-user',
          content: newMessage,
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setNewMessage('');
  };

  const selectConversation = (conversationId: string) => {
    // Mark messages as read when selecting a conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = conv.messages.map(msg => ({
          ...msg,
          read: true,
        }));
        
        return {
          ...conv,
          messages: updatedMessages,
          unreadCount: 0,
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setSelectedConversation(conversationId);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
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

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Connect with other wellness enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          {/* Conversations List */}
          <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations"
                  className="form-input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">No conversations found</p>
                  {searchQuery && (
                    <button 
                      className="text-primary text-sm hover:underline"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(p => p.id !== 'current-user');
                    const lastMessage = conversation.messages[conversation.messages.length - 1];
                    
                    return (
                      <div 
                        key={conversation.id}
                        className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-muted transition-colors ${selectedConversation === conversation.id ? 'bg-muted' : ''}`}
                        onClick={() => selectConversation(conversation.id)}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">Avatar</p>
                          </div>
                          {otherParticipant?.lastSeen && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                          )}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{otherParticipant?.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {lastMessage && formatMessageTime(lastMessage.timestamp)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                              {lastMessage?.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col h-full">
            {selectedConversation && currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-full mr-3 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Avatar</p>
                    </div>
                    <div>
                      <h3 className="font-medium">{otherParticipant?.name}</h3>
                      {otherParticipant?.lastSeen && (
                        <p className="text-xs text-muted-foreground">
                          Last seen {formatLastSeen(otherParticipant.lastSeen)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-primary">
                    <EllipsisHorizontalIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {currentConversation.messages.map((message) => {
                    const isCurrentUser = message.senderId === 'current-user';
                    const sender = currentConversation.participants.find(p => p.id === message.senderId);
                    
                    return (
                      <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser && (
                          <div className="w-8 h-8 bg-muted rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">Avatar</p>
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-4 py-2`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-right mt-1 opacity-70">
                            {formatMessageTime(message.timestamp)}
                            {isCurrentUser && message.read && (
                              <span className="ml-1">✓</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="form-input flex-grow"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="btn-primary !p-2"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <h2 className="text-xl font-bold mb-2">No conversation selected</h2>
                <p className="text-muted-foreground mb-4">
                  Choose a conversation from the list or start a new one
                </p>
                <button className="btn-primary">Start New Conversation</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 