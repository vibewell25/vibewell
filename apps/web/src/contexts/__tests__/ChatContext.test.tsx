/* eslint-disable */import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ChatProvider, useChat } from '../ChatContext';
import { analytics } from '@/lib/analytics';

// Mock the analytics service
jest.mock('@/lib/analytics', () => ({
  analytics: {
    trackMessage: jest.fn(),
    trackError: jest.fn(),
  },
}));

// Mock component to test the context
const TestComponent = () => {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  
  return (
    <div>
      <div data-testid="messages">
        {messages.map((msg, i) => (
          <div key={i} data-testid={`message-${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <button onClick={() => sendMessage('test message')}>Send Message</button>
      <button onClick={clearChat}>Clear Chat</button>
    </div>

};

describe('ChatContext', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  }));

  it('provides initial state', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>

    expect(screen.getByTestId('messages')).toHaveTextContent('Hi! How can I help you today?');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no error');
  }));

  it('sends message and updates state', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reply: 'test reply' }),
      })

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>

    const sendButton = screen.getByText('Send Message');
    
    await act(async () => {
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-user')).toHaveTextContent('test message');
      expect(screen.getByTestId('message-assistant')).toHaveTextContent('test reply');
    }));

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>

    const sendButton = screen.getByText('Send Message');
    
    await act(async () => {
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('no error');
      expect(analytics.trackError).toHaveBeenCalled();
    }));

  it('clears chat history', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>

    const clearButton = screen.getByText('Clear Chat');
    const messages = screen.getByTestId('messages');

    // Add a message
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    // Clear chat
    fireEvent.click(clearButton);

    // Should only show initial message
    expect(messages.children.length).toBe(1);
    expect(messages).toHaveTextContent('Hi! How can I help you today?');
  });

  it('tracks loading state', async () => {
    let resolvePromise: (value: any) => void;
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      })

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>

    const sendButton = screen.getByText('Send Message');
    
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ reply: 'test reply' }),
      }));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    }));

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useChat must be used within a ChatProvider');
    
    consoleError.mockRestore();
  })); 