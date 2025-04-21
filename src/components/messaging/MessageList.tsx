import React from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Message } from '@/types/messaging';
import { twMerge } from 'tailwind-merge';
import { Conversation } from './types';
import { formatLastSeen } from './utils';

interface MessageListProps {
  /**
   * Array of messages to display
   */
  messages: Message[];

  /**
   * ID of the current user to determine message alignment
   */
  currentUserId: string;

  /**
   * Optional className for styling
   */
  className?: string;

  /**
   * Optional placeholder when the list is empty
   */
  emptyPlaceholder?: React.ReactNode;

  /**
   * Optional callback when a message is clicked
   */
  onMessageClick?: (message: Message) => void;
}

/**
 * MessageList component
 *
 * A reusable component for displaying messages in a conversation
 * with support for different alignments for sender and recipient.
 */
export function MessageList({
  messages,
  currentUserId,
  className = '',
  emptyPlaceholder,
  onMessageClick,
}: MessageListProps) {
  // Format the timestamp for messages
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d');
    }
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const grouped: { [key: string]: Message[] } = {};

    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(message);
    });

    return grouped;
  }, [messages]);

  // Get readable date header
  const getDateHeader = (dateKey: string) => {
    const date = new Date(dateKey);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateKey === format(now, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (dateKey === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  if (messages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        {emptyPlaceholder || <p className="text-muted-foreground text-sm">No messages yet</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-4 p-4 ${className}`}>
      {/* Render messages grouped by date */}
      {Object.keys(groupedMessages).map(dateKey => (
        <div key={dateKey} className="flex flex-col space-y-3">
          {/* Date header */}
          <div className="flex justify-center">
            <div className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
              {getDateHeader(dateKey)}
            </div>
          </div>

          {/* Messages for this date */}
          {groupedMessages[dateKey].map(message => {
            const isCurrentUser = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                onClick={() => onMessageClick && onMessageClick(message)}
              >
                <div
                  className={`
                    max-w-[75%] px-4 py-2 rounded-lg break-words
                    ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }
                  `}
                >
                  <div className="flex flex-col">
                    <div>{message.content}</div>
                    <div
                      className={`
                        text-xs mt-1 flex justify-end
                        ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                      `}
                    >
                      {formatMessageTime(message.timestamp)}
                      {isCurrentUser && message.read && <span className="ml-1">✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default MessageList;
