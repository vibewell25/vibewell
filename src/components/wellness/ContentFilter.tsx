import { Icons } from '@/components/icons';
import React from 'react';
import { ContentType } from '@/types/content';
interface ContentFilterProps {
  searchQuery: string;
  selectedType: ContentType | 'all';
  onSearchChange: (query: string) => void;
  onTypeChange: (type: ContentType | 'all') => void;
}
export const ContentFilter: React.FC<ContentFilterProps> = ({
  searchQuery,
  selectedType,
  onSearchChange,
  onTypeChange,
}) => {
  const types: (ContentType | 'all')[] = ['all', 'article', 'video', 'audio', 'image'];
  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Icons.MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedType === type
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
