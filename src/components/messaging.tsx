import { useState, useEffect } from 'react';
import { PaperAirplaneIcon, MagnifyingGlassIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
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

interface MessagingProps {
  conversations: Conversation[];
  currentUserId: string;
  onSendMessage: (conversationId: string, content: string) => void;
  onConversationSelect?: (conversationId: string) => void;
  className?: string;
  height?: string;
  defaultSelectedConversation?: string;
  loading?: boolean;
}

export function Messaging({
  conversations,
  currentUserId,
  onSendMessage,
  onConversationSelect,
  className = '',
  height = 'h-[70vh]',
  defaultSelectedConversation,
  loading = false
}: MessagingProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(defaultSelectedConversation || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Default to first conversation if none selected and we have conversations
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get the currently selected conversation
  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  // Get the other participant in the conversation
  const otherParticipant = currentConversation?.participants.find(p => p.id !== currentUserId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || loading) return;
    
    onSendMessage(selectedConversation, newMessage);
    setNewMessage('');
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
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
      <div className={twMerge("flex justify-center items-center", height, className)}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={twMerge("grid grid-cols-1 md:grid-cols-3 gap-6", height, className)}>
      {/* Conversations List */}
      <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations"
              className="form-input pl-10 w-full"
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
                const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                
                return (
                  <div 
                    key={conversation.id}
                    className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-muted transition-colors ${selectedConversation === conversation.id ? 'bg-muted' : ''}`}
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        {otherParticipant?.avatar ? (
                          <img 
                            src={otherParticipant.avatar} 
                            alt={otherParticipant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground">Avatar</p>
                        )}
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
                          {lastMessage?.content || 'No messages yet'}
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
                <div className="w-10 h-10 bg-muted rounded-full mr-3 flex items-center justify-center overflow-hidden">
                  {otherParticipant?.avatar ? (
                    <img 
                      src={otherParticipant.avatar} 
                      alt={otherParticipant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">Avatar</p>
                  )}
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
              {currentConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start the conversation by typing a message below</p>
                </div>
              ) : (
                currentConversation.messages.map((message) => {
                  const isCurrentUser = message.senderId === currentUserId;
                  const sender = currentConversation.participants.find(p => p.id === message.senderId);
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      {!isCurrentUser && (
                        <div className="w-8 h-8 bg-muted rounded-full mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {sender?.avatar ? (
                            <img 
                              src={sender.avatar} 
                              alt={sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground">Avatar</p>
                          )}
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
                })
              )}
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
                  disabled={!newMessage.trim() || loading}
                  className="btn-primary !p-2 disabled:opacity-50"
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
          </div>
        )}
      </div>
    </div>
  );
} 