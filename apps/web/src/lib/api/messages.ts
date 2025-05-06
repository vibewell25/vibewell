import { randomUUID } from 'crypto';

export interface Participant {
  id: string;
  name: string;
  avatar?: string | null;
  lastSeen?: string;
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
export interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
// In-memory store for messages (in a real app, this would be a database)
export {};
