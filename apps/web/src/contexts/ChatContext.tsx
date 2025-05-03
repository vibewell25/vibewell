import React, { createContext, useContext, useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContextValue {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React?.FC<{ children: React?.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! How can I help you today?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON?.stringify({ messages: updatedMessages }),
      });

      if (!res?.ok) {
        throw new Error(`HTTP error! status: ${res?.status}`);
      }

      const { reply } = await res?.json();
      const assistantMessage: Message = { role: 'assistant', content: reply };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console?.error('Chat error:', error);
      setError('Sorry, something went wrong. Please try again.');
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' },
    ]);
    setError(null);
  }, []);

  return (
    <ChatContext?.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext?.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 