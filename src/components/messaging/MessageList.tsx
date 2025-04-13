import React from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Conversation } from './types';
import { formatLastSeen, formatMessageTime } from './utils';

interface MessageListProps {
  conversation: Conversation | undefined;
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversation,
  currentUserId,
}) => {
  if (!conversation) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <p className="text-muted-foreground">Select a conversation to start messaging</p>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);

  return (
    <div className="h-full flex flex-col">
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
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
              <span className="text-md font-semibold">{otherParticipant?.name.charAt(0) || '?'}</span>
            )}
          </div>
          <div>
            <h3 className="font-medium">{otherParticipant?.name}</h3>
            {otherParticipant?.lastSeen && (
              <p className="text-xs text-muted-foreground">
                Last seen: {formatLastSeen(otherParticipant.lastSeen)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={twMerge(
                "flex",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={twMerge(
                  "max-w-[70%] rounded-lg px-4 py-2 shadow-sm",
                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <div className="text-sm">{message.content}</div>
                <div className={twMerge(
                  "text-xs mt-1",
                  isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {formatMessageTime(message.timestamp)}
                  {isCurrentUser && (
                    <span className="ml-2">
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageList; 