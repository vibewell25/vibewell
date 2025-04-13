/**
 * Messaging Types
 * 
 * This file contains type definitions for the messaging system.
 */

/**
 * Represents a participant in a conversation
 */
export interface Participant {
  /**
   * Unique ID of the participant
   */
  id: string;
  
  /**
   * Display name of the participant
   */
  name: string;
  
  /**
   * Optional URL to the participant's avatar image
   */
  avatar?: string;
  
  /**
   * Optional timestamp of when the participant was last active
   */
  lastSeen?: string;
  
  /**
   * Optional status of the participant (online, offline, away, etc.)
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
}

/**
 * Represents a single message in a conversation
 */
export interface Message {
  /**
   * Unique ID of the message
   */
  id: string;
  
  /**
   * ID of the participant who sent the message
   */
  senderId: string;
  
  /**
   * Content of the message
   */
  content: string;
  
  /**
   * Timestamp when the message was sent
   */
  timestamp: string;
  
  /**
   * Whether the message has been read by the recipient
   */
  read: boolean;
  
  /**
   * Optional attachments for the message
   */
  attachments?: MessageAttachment[];
  
  /**
   * Optional type of the message
   */
  type?: 'text' | 'image' | 'file' | 'system' | 'audio';
}

/**
 * Represents an attachment in a message
 */
export interface MessageAttachment {
  /**
   * Unique ID of the attachment
   */
  id: string;
  
  /**
   * Type of the attachment
   */
  type: 'image' | 'file' | 'audio' | 'video';
  
  /**
   * URL to the attachment
   */
  url: string;
  
  /**
   * Display name of the attachment
   */
  name: string;
  
  /**
   * Size of the attachment in bytes
   */
  size?: number;
  
  /**
   * MIME type of the attachment
   */
  mimeType?: string;
  
  /**
   * Preview URL for the attachment (e.g., thumbnail)
   */
  previewUrl?: string;
}

/**
 * Represents a conversation between participants
 */
export interface Conversation {
  /**
   * Unique ID of the conversation
   */
  id: string;
  
  /**
   * Participants in the conversation
   */
  participants: Participant[];
  
  /**
   * Messages in the conversation
   */
  messages: Message[];
  
  /**
   * Number of unread messages in the conversation
   */
  unreadCount: number;
  
  /**
   * Optional title for group conversations
   */
  title?: string;
  
  /**
   * Optional last message timestamp for sorting
   */
  lastMessageAt?: string;
  
  /**
   * Whether the conversation is a group conversation
   */
  isGroup?: boolean;
} 