import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useChat } from '@/contexts/ChatContext';

export const SupportChat: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setInput('');
    await sendMessage(trimmedInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg w-80 z-50">
      <div className="p-3 border-b bg-pink-50 rounded-t-lg">
        <h3 className="font-semibold text-pink-600">VibeWell AI Support</h3>
      </div>
      
      <div className="p-3 h-64 overflow-y-auto text-sm space-y-2">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl ${
                msg.role === 'user' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-center">
            <CircularProgress size={20} className="text-pink-500" />
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-center text-xs">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center border-t p-2 bg-white rounded-b-lg">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className="flex-1 p-2 border rounded text-sm focus:outline-none focus:border-pink-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className={`ml-2 px-3 py-1 text-white text-sm rounded transition-colors ${
            isLoading || !input.trim() 
              ? 'bg-pink-300 cursor-not-allowed' 
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}; 