export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
}

export interface MessagingProps {
  conversations: Conversation[];
  currentUserId: string;
  onSendMessage: (conversationId: string, content: string) => void;
  onConversationSelect?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  className?: string;
  height?: string;
  defaultSelectedConversation?: string;
  loading?: boolean;
} 