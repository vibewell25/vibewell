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
  onCancelDelete,
}) => {
  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.id !== currentUserId);
    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border md:col-span-1">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full rounded-md bg-muted/50 py-2 pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <p className="mb-2 text-muted-foreground">No conversations found</p>
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
              const otherParticipant = conversation.participants.find(
                (p) => p.id !== currentUserId,
              );
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              return (
                <div
                  key={conversation.id}
                  className={`relative flex cursor-pointer items-center space-x-3 p-4 transition-colors hover:bg-muted ${selectedConversation === conversation.id ? 'bg-muted' : ''}`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {otherParticipant.avatar ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={otherParticipant.avatar}
                            alt={otherParticipant.name || 'User'}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xl font-semibold">
                          {otherParticipant.name.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-primary absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-start justify-between">
                      <h3 className="truncate font-medium">{otherParticipant.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {lastMessage && formatMessageTime(lastMessage.timestamp)}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="max-w-full truncate text-sm text-muted-foreground">
                        {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {showDeleteConfirm === conversation.id ? (
                    <div className="absolute right-3 z-10 flex items-center space-x-2 rounded border bg-background px-3 py-2 shadow-md">
                      <span className="text-sm">Delete this conversation?</span>
                      <button
                        className="text-sm font-medium text-destructive"
                        onClick={() => onConfirmDelete(conversation.id)}
                      >
                        Delete
                      </button>
                      <button className="text-sm text-muted-foreground" onClick={onCancelDelete}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="rounded-full p-1 hover:bg-muted-foreground/10"
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
