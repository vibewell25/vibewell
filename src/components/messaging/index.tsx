import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessagingProps } from './types';

/**
 * Messaging component that handles conversations and messages between users
 *
 * @component
 * @example
 * ```tsx
 * <Messaging
 *   conversations={conversations}
 *   currentUserId="user123"
 *   onSendMessage={(conversationId, content) => handleSendMessage(conversationId, content)}
 * />
 * ```
 */
export function Messaging({
  conversations,
  currentUserId,
  onSendMessage,
  onConversationSelect,
  onDeleteConversation,
  className = '',
  height = 'h-[70vh]',
  defaultSelectedConversation,
  loading = false
}: MessagingProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(defaultSelectedConversation || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    // Default to first conversation if none selected and we have conversations
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
    // Update selected conversation if defaultSelectedConversation changes
    if (defaultSelectedConversation && defaultSelectedConversation !== selectedConversation) {
      setSelectedConversation(defaultSelectedConversation);
    }
  }, [conversations, selectedConversation, defaultSelectedConversation]);

  // Get the currently selected conversation
  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

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

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Prevent triggering conversation selection
    setShowDeleteConfirm(conversationId);
  };

  const confirmDelete = (conversationId: string) => {
    if (onDeleteConversation) {
      onDeleteConversation(conversationId);
    }
    setShowDeleteConfirm(null);
    // If deleted conversation was selected, clear selection
    if (conversationId === selectedConversation) {
      setSelectedConversation(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(null);
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
      {/* Conversation List */}
      <ConversationList
        conversations={conversations}
        currentUserId={currentUserId}
        selectedConversation={selectedConversation}
        searchQuery={searchQuery}
        showDeleteConfirm={showDeleteConfirm}
        onSearchChange={setSearchQuery}
        onSelectConversation={selectConversation}
        onDeleteClick={handleDeleteClick}
        onConfirmDelete={confirmDelete}
        onCancelDelete={cancelDelete}
      />
      
      {/* Message View */}
      <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col h-full">
        <MessageList
          conversation={currentConversation}
          currentUserId={currentUserId}
        />
        
        {currentConversation && (
          <MessageInput
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSubmit={handleSendMessage}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
}

export * from './types';
export { default as ConversationList } from './ConversationList';
export { default as MessageList } from './MessageList';
export { default as MessageInput } from './MessageInput';

export default Messaging; 