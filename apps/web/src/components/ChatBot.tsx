"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Icons } from '@/components/icons';
import Card from '@/components/ui/Card';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm VibeBot, your personal wellness assistant. How can I help you today?"
};

const SUGGESTIONS = [
  'How do I book an appointment?',
  'Tell me about the loyalty program',
  'What services do you offer?',
  'How does virtual skin analysis work?'
];

export default function ChatBot() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.concat(userMessage) }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage = { role: 'assistant' as const, content: data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again or contact support@vibewell.com for assistance.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 rounded-full p-4 shadow-lg bg-pink-500 hover:bg-pink-600 text-white"
      >
        <Icons.message className="h-6 w-6" />
        <span className="sr-only">Open Chat Assistant</span>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-96 max-w-[calc(100vw-2rem)] shadow-lg border-pink-100">
      <div className="flex items-center justify-between border-b p-4 bg-pink-50">
        <div className="flex items-center gap-2">
          <Icons.chat className="h-6 w-6 text-pink-500" />
          <div>
            <h3 className="font-semibold text-pink-700">VibeBot</h3>
            <p className="text-xs text-pink-600">AI Wellness Assistant</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-pink-100 rounded-full"
        >
          <Icons.close className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex animate-pulse space-x-1 rounded-lg bg-gray-100 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-pink-500"></div>
              <div className="h-2 w-2 rounded-full bg-pink-500"></div>
              <div className="h-2 w-2 rounded-full bg-pink-500"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="p-4 border-t border-pink-100 bg-pink-50">
          <p className="text-sm text-pink-700 mb-2">Common questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-white text-pink-600 px-3 py-1 rounded-full border border-pink-200 hover:bg-pink-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            {isLoading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.message className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
