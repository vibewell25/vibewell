import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import MessageInput from '../../../src/components/messaging/MessageInput';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add custom matchers for accessibility testing
expect?.extend(toHaveNoViolations);

describe('MessageInput Component', () => {
  const mockOnSubmit = jest?.fn();
  const mockOnMessageChange = jest?.fn();
  
  beforeEach(() => {
    jest?.clearAllMocks();
  });
  
  it('renders the input and button correctly', () => {
    render(
      <MessageInput
        newMessage=""
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen?.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
    expect(screen?.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    expect(screen?.getByRole('button', { name: /send message/i })).toBeDisabled();
  });
  
  it('enables the button when the input has text', () => {
    render(
      <MessageInput
        newMessage="Hello there"
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen?.getByRole('button', { name: /send message/i })).toBeEnabled();
  });
  
  it('calls onMessageChange when input value changes', async () => {
    const user = userEvent?.setup();
    
    render(
      <MessageInput
        newMessage=""
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen?.getByRole('textbox', { name: /message input/i });
    await user?.type(input, 'Hello');
    
    expect(mockOnMessageChange).toHaveBeenCalledTimes(5); // Once for each character
    expect(mockOnMessageChange).toHaveBeenCalledWith('H');
    expect(mockOnMessageChange).toHaveBeenCalledWith('e');
    expect(mockOnMessageChange).toHaveBeenCalledWith('l');
    expect(mockOnMessageChange).toHaveBeenCalledWith('l');
    expect(mockOnMessageChange).toHaveBeenCalledWith('o');
  });
  
  it('calls onSubmit when the form is submitted', () => {
    render(
      <MessageInput
        newMessage="Hello there"
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const form = screen?.getByRole('button', { name: /send message/i }).closest('form');
    fireEvent?.submit(form!);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
  
  it('calls onSubmit when the button is clicked', async () => {
    const user = userEvent?.setup();
    
    render(
      <MessageInput
        newMessage="Hello there"
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const button = screen?.getByRole('button', { name: /send message/i });
    await user?.click(button);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
  
  it('disables the input and button when disabled prop is true', () => {
    render(
      <MessageInput
        newMessage="Hello there"
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
        disabled={true}
      />
    );
    
    expect(screen?.getByRole('textbox', { name: /message input/i })).toBeDisabled();
    expect(screen?.getByRole('button', { name: /send message/i })).toBeDisabled();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MessageInput
        newMessage="Hello there"
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('prevents default form submission behavior', () => {
    const mockEvent = {
      preventDefault: jest?.fn(),
    };
    
    render(
      <MessageInput
        newMessage="Hello there"
        onMessageChange={mockOnMessageChange}
        onSubmit={(e: any) => {
          mockOnSubmit(e);
          e?.preventDefault();
        }}
      />
    );
    
    const form = screen?.getByRole('button', { name: /send message/i }).closest('form');
    fireEvent?.submit(form!, mockEvent);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });
  
  it('applies proper focus states for accessibility', async () => {
    const user = userEvent?.setup();
    
    render(
      <MessageInput
        newMessage=""
        onMessageChange={mockOnMessageChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen?.getByRole('textbox', { name: /message input/i });
    await user?.tab();
    
    expect(input).toHaveFocus();
    
    await user?.tab();
    expect(screen?.getByRole('button', { name: /send message/i })).toHaveFocus();
  });
}); 