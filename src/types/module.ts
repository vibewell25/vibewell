export interface ModuleContent {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'ASSIGNMENT';
  content: string;
  sequence: number;
  duration?: number; // in minutes
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateModuleContentInput {
  title: string;
  description?: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'ASSIGNMENT';
  content: string;
  sequence: number;
  duration?: number;
  isRequired: boolean;
}

export interface UpdateModuleContentInput {
  id: string;
  title?: string;
  description?: string;
  type?: 'TEXT' | 'VIDEO' | 'QUIZ' | 'ASSIGNMENT';
  content?: string;
  sequence?: number;
  duration?: number;
  isRequired?: boolean;
} 