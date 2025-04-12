export type ContentType = 'article' | 'video' | 'audio' | 'image';

export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  progress?: number;
}

export interface ContentProgress {
  contentId: string;
  userId: string;
  progress: number;
  lastAccessed: string;
} 