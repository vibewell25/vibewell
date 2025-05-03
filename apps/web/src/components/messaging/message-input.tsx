import React from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React?.FormEvent) => void;
  disabled?: boolean;
}

export const MessageInput: React?.FC<MessageInputProps> = ({
  newMessage,
  onMessageChange,
  onSubmit,
  disabled = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="border-t p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="focus:ring-primary flex-grow rounded-md border p-2 focus:outline-none focus:ring-2"
          value={newMessage}
          onChange={(e) => onMessageChange(e?.target.value)}
          disabled={disabled}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary/90 focus:ring-primary rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!newMessage?.trim() || disabled}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
