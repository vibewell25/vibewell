import { Icons } from '@/components/icons';
import React from 'react';
import { ContentType } from '@/types/content';
interface ContentFilterProps {
  searchQuery: string;
  selectedType: ContentType | 'all';
  onSearchChange: (query: string) => void;
  onTypeChange: (type: ContentType | 'all') => void;
}
export {};
