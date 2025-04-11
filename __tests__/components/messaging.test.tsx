import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Messaging } from '@/components/messaging';

describe('Messaging Component', () => {
  const mockConversations = [
    {
      id: 'conv1',
      participants: [
        {
          id: 'user1',
          name: 'Emma Thompson',
          avatar: '/avatar1.png',
          lastSeen: '2023-07-15T14:30:00.000Z',
        },
        {
          id: 'current-user',
          name: 'Current User',
          avatar: '/avatar-current.png',
        }
      ],
      messages: [
        {
          id: 'msg1',
          senderId: 'user1',
          content: 'Hi there! I saw your post about meditation.',
          timestamp: '2023-07-14T09:30:00.000Z',
          read: true,
        },
        {
          id: 'msg2',
          senderId: 'current-user',
          content: 'That would be amazing! I\'m just getting started.',
          timestamp: '2023-07-14T09:45:00.000Z',
          read: true,
        },
      ],
      unreadCount: 0,
    },
    {
      id: 'conv2',
      participants: [
        {
          id: 'user2',
          name: 'David Chen',
          avatar: '/avatar2.png',
          lastSeen: '2023-07-15T10:15:00.000Z',
        },
        {
          id: 'current-user',
          name: 'Current User',
          avatar: '/avatar-current.png',
        }
      ],
      messages: [
        {
          id: 'msg4',
          senderId: 'user2',
          content: 'Hey! Are you joining the yoga challenge?',
          timestamp: '2023-07-15T08:30:00.000Z',
          read: false,
        },
      ],
      unreadCount: 1,
    }
  ];

  const mockHandlers = {
    onSendMessage: jest.fn(),
    onConversationSelect: jest.fn(),
    onDeleteConversation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the messaging component with conversations', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
      />
    );

    // Check if conversation list is displayed
    expect(screen.getByText('Emma Thompson')).toBeInTheDocument();
    expect(screen.getByText('David Chen')).toBeInTheDocument();
    
    // Check if messages from the first conversation are displayed (as it should be selected by default)
    expect(screen.getByText('Hi there! I saw your post about meditation.')).toBeInTheDocument();
    expect(screen.getByText('That would be amazing! I\'m just getting started.')).toBeInTheDocument();
  });

  it('allows selecting a conversation', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
        onConversationSelect={mockHandlers.onConversationSelect}
      />
    );

    // Click on the second conversation
    fireEvent.click(screen.getByText('David Chen'));

    // Check if the conversation select handler was called with the correct ID
    expect(mockHandlers.onConversationSelect).toHaveBeenCalledWith('conv2');
  });

  it('allows sending a message', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
      />
    );

    // Type a message
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello, this is a test message!' } });

    // Send the message
    const sendButton = screen.getByRole('button', { name: /paper-airplane/i });
    fireEvent.click(sendButton);

    // Check if the send message handler was called with the correct parameters
    expect(mockHandlers.onSendMessage).toHaveBeenCalledWith('conv1', 'Hello, this is a test message!');
  });

  it('displays delete confirmation when delete button is clicked', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
        onDeleteConversation={mockHandlers.onDeleteConversation}
      />
    );

    // Find and click the delete button in the first conversation
    const deleteButtons = screen.getAllByLabelText('Delete conversation');
    fireEvent.click(deleteButtons[0]);

    // Check if confirmation dialog is shown
    expect(screen.getByText('Delete this conversation?')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));

    // Check if the delete handler was called with the correct ID
    expect(mockHandlers.onDeleteConversation).toHaveBeenCalledWith('conv1');
  });

  it('cancels deletion when cancel button is clicked', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
        onDeleteConversation={mockHandlers.onDeleteConversation}
      />
    );

    // Find and click the delete button in the first conversation
    const deleteButtons = screen.getAllByLabelText('Delete conversation');
    fireEvent.click(deleteButtons[0]);

    // Check if confirmation dialog is shown
    expect(screen.getByText('Delete this conversation?')).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));

    // Check that the delete handler was not called
    expect(mockHandlers.onDeleteConversation).not.toHaveBeenCalled();
  });

  it('shows the loading state when loading prop is true', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
        loading={true}
      />
    );

    // Check if loading message is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays search functionality for conversations', () => {
    render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={mockHandlers.onSendMessage}
      />
    );

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search conversations');
    
    // Search for 'Emma'
    fireEvent.change(searchInput, { target: { value: 'Emma' } });
    
    // Emma should be visible, but David should not
    expect(screen.getByText('Emma Thompson')).toBeInTheDocument();
    expect(screen.queryByText('David Chen')).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Both should be visible again
    expect(screen.getByText('Emma Thompson')).toBeInTheDocument();
    expect(screen.getByText('David Chen')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Messaging
        conversations={mockConversations}
        currentUserId="current-user"
        onSendMessage={jest.fn()}
      />
    );
    
    expect(container).toBeTruthy();
  });
}); 