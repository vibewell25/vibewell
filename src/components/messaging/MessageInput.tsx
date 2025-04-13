import React from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onMessageChange,
  onSubmit,
  disabled = false
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          disabled={disabled}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="bg-primary text-white p-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newMessage.trim() || disabled}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput; 