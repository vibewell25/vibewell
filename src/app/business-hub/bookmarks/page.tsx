'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import Link from 'next/link';
import { getBookmarks, Bookmark, getRecentlyViewed, RecentView, removeBookmark, addBookmark } from '@/lib/bookmarks';
import { 
  BookmarkIcon,
  ClockIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalculatorIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentView[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'recent'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load bookmarks and recently viewed items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedBookmarks = getBookmarks();
      setBookmarks(loadedBookmarks);
      
      const loadedRecentlyViewed = getRecentlyViewed(10);
      setRecentlyViewed(loadedRecentlyViewed);
    }
  }, []);
  
  // Remove a bookmark
  const handleRemoveBookmark = (id: string, type: Bookmark['type']) => {
    removeBookmark(id, type);
    setBookmarks(prev => prev.filter(b => !(b.id === id && b.type === type)));
  };
  
  // Render icon based on resource type
  const renderTypeIcon = (type: Bookmark['type']) => {
    switch (type) {
      case 'resource':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'tool':
        return <CalculatorIcon className="h-5 w-5 text-green-500" />;
      case 'article':
        return <NewspaperIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format date to relative time
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'unknown time';
    }
  };

  // Get all unique categories from bookmarks
  const getCategories = () => {
    const categories = new Set<string>();
    bookmarks.forEach(bookmark => categories.add(bookmark.category));
    return Array.from(categories).sort();
  };

  // Filter bookmarks based on search query, type, and category
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchQuery === '' || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = selectedType === 'all' || bookmark.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || bookmark.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Group bookmarks by category for better organization
  const groupBookmarksByCategory = () => {
    const grouped: Record<string, Bookmark[]> = {};
    
    filteredBookmarks.forEach(bookmark => {
      if (!grouped[bookmark.category]) {
        grouped[bookmark.category] = [];
      }
      grouped[bookmark.category].push(bookmark);
    });
    
    return grouped;
  };

  // Filter recently viewed based on search query
  const filteredRecentlyViewed = recentlyViewed.filter(item => {
    return searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Export bookmarks as JSON
  const exportBookmarks = () => {
    try {
      const dataStr = JSON.stringify(bookmarks, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `vibewell_bookmarks_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
    }
  };

  // Group and sort bookmarks
  const groupedBookmarks = groupBookmarksByCategory();
  const categories = getCategories();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Business Hub</h1>
        <p className="text-gray-600 mb-6">Tools, resources, and education to grow your wellness business</p>
        
        {/* Main Navigation */}
        <BusinessHubNavigation />
        
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Your Business Hub Activity</h2>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'bookmarks' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('bookmarks')}
                >
                  <span className="flex items-center">
                    <BookmarkIcon className="h-5 w-5 mr-2" />
                    Bookmarks
                  </span>
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'recent' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('recent')}
                >
                  <span className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Recently Viewed
                  </span>
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Search your bookmarks..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {activeTab === 'bookmarks' && (
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          className="appearance-none bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          <option value="resource">Resources</option>
                          <option value="tool">Tools</option>
                          <option value="article">Articles</option>
                        </select>
                        <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      
                      <div className="relative">
                        <select
                          className="appearance-none bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        <TagIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>

                      <Button variant="outline" onClick={exportBookmarks} className="flex items-center">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bookmarks Content */}
              {activeTab === 'bookmarks' && (
                <div>
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                      <BookmarkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                      <p className="text-gray-500 mb-6">
                        Bookmarks help you save resources and tools for quick access later.
                      </p>
                      <Link 
                        href="/business-hub"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Explore Business Hub
                      </Link>
                    </div>
                  ) : filteredBookmarks.length === 0 ? (
                    <div className="text-center py-12">
                      <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No matching bookmarks found</h3>
                      <p className="text-gray-500 mb-6">
                        Try adjusting your search or filters.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedType('all');
                          setSelectedCategory('all');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {/* Organize by Category When Category Filter is "All" */}
                      {selectedCategory === 'all' ? (
                        Object.entries(groupedBookmarks).map(([category, categoryBookmarks]) => (
                          <div key={category} className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
                              {category}
                              <span className="ml-2 text-sm text-gray-500 font-normal">
                                ({categoryBookmarks.length})
                              </span>
                            </h3>
                            <div className="space-y-4">
                              {categoryBookmarks.map((bookmark) => (
                                <BookmarkItem 
                                  key={`${bookmark.type}-${bookmark.id}`}
                                  bookmark={bookmark}
                                  formatDate={formatDate}
                                  renderTypeIcon={renderTypeIcon}
                                  onRemove={handleRemoveBookmark}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-4">
                          {filteredBookmarks.map((bookmark) => (
                            <BookmarkItem 
                              key={`${bookmark.type}-${bookmark.id}`}
                              bookmark={bookmark}
                              formatDate={formatDate}
                              renderTypeIcon={renderTypeIcon}
                              onRemove={handleRemoveBookmark}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Recently Viewed Content */}
              {activeTab === 'recent' && (
                <div>
                  {recentlyViewed.length === 0 ? (
                    <div className="text-center py-12">
                      <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No recently viewed items</h3>
                      <p className="text-gray-500 mb-6">
                        As you explore resources and tools, they'll appear here for quick access.
                      </p>
                      <Link 
                        href="/business-hub"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Explore Business Hub
                      </Link>
                    </div>
                  ) : filteredRecentlyViewed.length === 0 ? (
                    <div className="text-center py-12">
                      <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No matching items found</h3>
                      <p className="text-gray-500 mb-6">
                        Try adjusting your search.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRecentlyViewed.map((item) => (
                        <div 
                          key={`${item.type}-${item.id}`}
                          className="bg-gray-50 rounded-lg p-4 flex items-start"
                        >
                          <div className="mr-3 mt-1">
                            {renderTypeIcon(item.type)}
                          </div>
                          <div className="flex-grow">
                            <Link 
                              href={item.url}
                              className="text-lg font-medium text-blue-600 hover:text-blue-800"
                            >
                              {item.title}
                            </Link>
                            <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2">
                                {item.category}
                              </span>
                              <span>Viewed {formatDate(item.lastViewed)} • {item.viewCount} {item.viewCount === 1 ? 'time' : 'times'}</span>
                            </div>
                          </div>
                          {!bookmarks.some(b => b.id === item.id && b.type === item.type) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-yellow-500"
                              title="Add to bookmarks"
                              onClick={() => {
                                const bookmark = {
                                  id: item.id,
                                  type: item.type,
                                  title: item.title,
                                  description: item.description,
                                  url: item.url,
                                  category: item.category
                                };
                                const newBookmark = addBookmark(bookmark);
                                setBookmarks(prev => [...prev, newBookmark]);
                              }}
                            >
                              <BookmarkIcon className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// BookmarkItem Component for cleaner rendering
function BookmarkItem({ 
  bookmark, 
  formatDate, 
  renderTypeIcon, 
  onRemove 
}: { 
  bookmark: Bookmark; 
  formatDate: (date: string) => string;
  renderTypeIcon: (type: Bookmark['type']) => React.ReactNode;
  onRemove: (id: string, type: Bookmark['type']) => void;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex items-start">
      <div className="mr-3 mt-1">
        {renderTypeIcon(bookmark.type)}
      </div>
      <div className="flex-grow">
        <Link 
          href={bookmark.url}
          className="text-lg font-medium text-blue-600 hover:text-blue-800"
        >
          {bookmark.title}
        </Link>
        <p className="text-sm text-gray-600 mb-1">{bookmark.description}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full mr-2">
            {bookmark.category}
          </span>
          <span>Saved {formatDate(bookmark.timestamp)}</span>
        </div>
      </div>
      <button
        onClick={() => onRemove(bookmark.id, bookmark.type)}
        className="text-gray-400 hover:text-gray-600 p-1"
        title="Remove bookmark"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
} 