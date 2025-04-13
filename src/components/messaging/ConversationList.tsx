import React from 'react';
import Image from 'next/image';
import { Search, Trash } from 'lucide-react';
import { Conversation } from './types';
import { formatMessageTime } from './utils';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversation: string | null;
  searchQuery: string;
  showDeleteConfirm: string | null;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onDeleteClick: (e: React.MouseEvent, conversationId: string) => void;
  onConfirmDelete: (conversationId: string) => void;
  onCancelDelete: (e: React.MouseEvent) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedConversation,
  searchQuery,
  showDeleteConfirm,
  onSearchChange,
  onSelectConversation,
  onDeleteClick,
  onConfirmDelete,
  onCancelDelete
}) => {
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 rounded-md"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                onClick={() => onSearchChange('')}
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
                  className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-muted transition-colors relative ${selectedConversation === conversation.id ? 'bg-muted' : ''}`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                      {otherParticipant?.avatar ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={otherParticipant.avatar} 
                            alt={otherParticipant?.name || 'User'} 
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xl font-semibold">{otherParticipant?.name.charAt(0) || '?'}</span>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{otherParticipant?.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {lastMessage && formatMessageTime(lastMessage.timestamp)}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate max-w-full">
                        {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {showDeleteConfirm === conversation.id ? (
                    <div className="absolute right-3 bg-background border rounded shadow-md px-3 py-2 z-10 flex items-center space-x-2">
                      <span className="text-sm">Delete this conversation?</span>
                      <button 
                        className="text-destructive text-sm font-medium"
                        onClick={() => onConfirmDelete(conversation.id)}
                      >
                        Delete
                      </button>
                      <button 
                        className="text-muted-foreground text-sm"
                        onClick={onCancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="p-1 rounded-full hover:bg-muted-foreground/10"
                      onClick={(e) => onDeleteClick(e, conversation.id)}
                      aria-label="Delete conversation"
                    >
                      <Trash className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 