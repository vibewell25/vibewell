import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { BusinessHubNavigation } from '@/components/business-hub-navigation';
import Link from 'next/link';
import { getBookmarks, Bookmark, getRecentlyViewed, removeBookmark, addBookmark } from '@/lib/bookmarks';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/icons';
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
[]);
  // Remove a bookmark
  const handleRemoveBookmark = (id: string, type: Bookmark['type']) => {
    removeBookmark(id, type);
    setBookmarks((prev) => prev.filter((b) => !(b.id === id && b.type === type)));
// Render icon based on resource type
  const renderTypeIcon = (type: Bookmark['type']) => {
    switch (type) {
      case 'resource':
        return <Icons.DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'tool':
        return <Icons.CalculatorIcon className="h-5 w-5 text-green-500" />;
      case 'article':
        return <Icons.NewspaperIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <Icons.DocumentTextIcon className="h-5 w-5 text-gray-500" />;
// Format date to relative time
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
catch (error) {
      return 'unknown time';
// Get all unique categories from bookmarks
  const getCategories = () => {
    const categories = new Set<string>();
    bookmarks.forEach((bookmark) => categories.add(bookmark.category));
    return Array.from(categories).sort();
// Filter bookmarks based on search query, type, and category
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      searchQuery === '' ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || bookmark.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || bookmark.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
// Group bookmarks by category for better organization
  const groupBookmarksByCategory = () => {
    const grouped: Record<string, Bookmark[]> = {};
    filteredBookmarks.forEach((bookmark) => {
      if (!grouped[bookmark.category]) {
        grouped[bookmark.category] = [];
grouped[bookmark.category].push(bookmark);
return grouped;
// Filter recently viewed based on search query
  const filteredRecentlyViewed = recentlyViewed.filter((item) => {
    return (
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
catch (error) {
      console.error('Error exporting bookmarks:', error);
// Group and sort bookmarks
  const groupedBookmarks = groupBookmarksByCategory();
  const categories = getCategories();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Business Hub</h1>
        <p className="mb-6 text-gray-600">
          Tools, resources, and education to grow your wellness business
        </p>
        {/* Main Navigation */}
        <BusinessHubNavigation />
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="p-6">
              <h2 className="mb-6 text-2xl font-bold">Your Business Hub Activity</h2>
              {/* Tabs */}
              <div className="mb-6 flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'bookmarks'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
`}
                  onClick={() => setActiveTab('bookmarks')}
                >
                  <span className="flex items-center">
                    <Icons.BookmarkIcon className="mr-2 h-5 w-5" />
                    Bookmarks
                  </span>
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'recent'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
`}
                  onClick={() => setActiveTab('recent')}
                >
                  <span className="flex items-center">
                    <Icons.ClockIcon className="mr-2 h-5 w-5" />
                    Recently Viewed
                  </span>
                </button>
              </div>
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-grow">
                    <Icons.MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search your bookmarks..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(e.target.value)
/>
                  </div>
                  {activeTab === 'bookmarks' && (
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          <option value="resource">Resources</option>
                          <option value="tool">Tools</option>
                          <option value="article">Articles</option>
                        </select>
                        <Icons.FunnelIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      </div>
                      <div className="relative">
                        <select
                          className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <Icons.TagIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      </div>
                      <Button
                        variant="outline"
                        onClick={exportBookmarks}
                        className="flex items-center"
                      >
                        <Icons.ArrowDownTrayIcon className="mr-1 h-4 w-4" />
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
                    <div className="py-12 text-center">
                      <Icons.BookmarkIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">No bookmarks yet</h3>
                      <p className="mb-6 text-gray-500">
                        Bookmarks help you save resources and tools for quick access later.
                      </p>
                      <Link
                        href="/business-hub"
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                      >
                        Explore Business Hub
                      </Link>
                    </div>
                  ) : filteredBookmarks.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icons.MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        No matching bookmarks found
                      </h3>
                      <p className="mb-6 text-gray-500">Try adjusting your search or filters.</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedType('all');
                          setSelectedCategory('all');
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
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold">
                              {category}
                              <span className="ml-2 text-sm font-normal text-gray-500">
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
                    <div className="py-12 text-center">
                      <Icons.ClockIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        No recently viewed items
                      </h3>
                      <p className="mb-6 text-gray-500">
                        As you explore resources and tools, they'll appear here for quick access.
                      </p>
                      <Link
                        href="/business-hub"
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                      >
                        Explore Business Hub
                      </Link>
                    </div>
                  ) : filteredRecentlyViewed.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icons.MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        No matching items found
                      </h3>
                      <p className="mb-6 text-gray-500">Try adjusting your search.</p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRecentlyViewed.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="flex items-start rounded-lg bg-gray-50 p-4"
                        >
                          <div className="mr-3 mt-1">{renderTypeIcon(item.type)}</div>
                          <div className="flex-grow">
                            <Link
                              href={item.url}
                              className="text-lg font-medium text-blue-600 hover:text-blue-800"
                            >
                              {item.title}
                            </Link>
                            <p className="mb-1 text-sm text-gray-600">{item.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="mr-2 rounded-full bg-gray-200 px-2 py-1 text-gray-700">
                                {item.category}
                              </span>
                              <span>
                                Viewed {formatDate(item.lastViewed)} • {item.viewCount}{' '}
                                {item.viewCount === 1 ? 'time' : 'times'}
                              </span>
                            </div>
                          </div>
                          {!bookmarks.some((b) => b.id === item.id && b.type === item.type) && (
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
                                  category: item.category,
const newBookmark = addBookmark(bookmark);
                                setBookmarks((prev) => [...prev, newBookmark]);
>
                              <Icons.BookmarkIcon className="h-5 w-5" />
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
// BookmarkItem Component for cleaner rendering
function BookmarkItem({
  bookmark,
  formatDate,
  renderTypeIcon,
  onRemove,
: {
  bookmark: Bookmark;
  formatDate: (date: string) => string;
  renderTypeIcon: (type: Bookmark['type']) => React.ReactNode;
  onRemove: (id: string, type: Bookmark['type']) => void;
) {
  return (
    <div className="flex items-start rounded-lg bg-gray-50 p-4">
      <div className="mr-3 mt-1">{renderTypeIcon(bookmark.type)}</div>
      <div className="flex-grow">
        <Link href={bookmark.url} className="text-lg font-medium text-blue-600 hover:text-blue-800">
          {bookmark.title}
        </Link>
        <p className="mb-1 text-sm text-gray-600">{bookmark.description}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="mr-2 rounded-full bg-gray-200 px-2 py-1 text-gray-700">
            {bookmark.category}
          </span>
          <span>Saved {formatDate(bookmark.timestamp)}</span>
        </div>
      </div>
      <button
        onClick={() => onRemove(bookmark.id, bookmark.type)}
        className="p-1 text-gray-400 hover:text-gray-600"
        title="Remove bookmark"
      >
        <Icons.XMarkIcon className="h-5 w-5" />
      </button>
    </div>
