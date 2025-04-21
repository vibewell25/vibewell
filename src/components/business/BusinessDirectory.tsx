import { Icons } from '@/components/icons';
import React, { useState } from 'react';
import { Business } from '@/types/business';
interface BusinessDirectoryProps {
  businesses: Business[];
  onBusinessSelect: (business: Business) => void;
}
export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({
  businesses,
  onBusinessSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
  const categories = ['all', 'spa', 'salon', 'wellness', 'fitness'];
  const filteredBusinesses = businesses
    .filter(business => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return a.name.localeCompare(b.name);
    });

  // Add keyboard navigation for business cards
  const handleBusinessKeyDown = (e: React.KeyboardEvent, business: Business) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBusinessSelect(business);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Icons.MagnifyingGlassIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search businesses"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by category"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'rating' | 'name')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Sort businesses"
          >
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label="Business listings"
      >
        {filteredBusinesses.map(business => (
          <div
            key={business.id}
            onClick={() => onBusinessSelect(business)}
            onKeyDown={e => handleBusinessKeyDown(e, business)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
            tabIndex={0}
            role="listitem"
            aria-label={`${business.name}, ${business.category}, rating ${business.rating.toFixed(1)}`}
          >
            <div className="relative h-48">
              <img
                src={business.imageUrl}
                alt={`${business.name} business`}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full flex items-center"
                aria-hidden="true"
              >
                <Icons.StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{business.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{business.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{business.location}</span>
                <span className="mx-2" aria-hidden="true">
                  •
                </span>
                <span>{business.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12" role="alert">
          <p className="text-gray-500">No businesses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
