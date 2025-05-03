'use client';

import { useState } from 'react';
import Image from 'next/image';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="app-container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="app-heading">Social Feed</h1>
        <button className="app-icon-button">
          <span className="text-xl">✉️</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center rounded-full bg-muted p-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
            activeTab === 'feed'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
            activeTab === 'trending'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trending
        </button>
      </div>

      {/* Stories */}
      <div className="mb-6">
        <div className="flex overflow-x-auto pb-2 scroll-smooth">
          <div className="flex gap-4">
            <StoryItem username="You" isAdd />
            {stories.map((story) => (
              <StoryItem
                key={story.username}
                username={story.username}
                imageUrl={story.imageUrl}
                isUnread={story.isUnread}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-6 flex justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

type StoryItemProps = {
  username: string;
  imageUrl?: string;
  isUnread?: boolean;
  isAdd?: boolean;
};

function StoryItem({ username, imageUrl, isUnread, isAdd }: StoryItemProps) {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div
        className={`relative h-16 w-16 overflow-hidden rounded-full ${
          isUnread ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''
        }`}
      >
        {isAdd ? (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl text-primary-600">
            +
          </div>
        ) : (
          <div className="bg-muted h-full w-full">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={username}
                fill
                className="object-cover"
              />
            )}
          </div>
        )}
      </div>
      <span className="text-xs">{username}</span>
    </div>
  );
}

type Post = {
  id: number;
  username: string;
  userImage?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  timestamp: string;
};

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="app-card">
      {/* Post header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
            {post.userImage && (
              <Image
                src={post.userImage}
                alt={post.username}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{post.username}</p>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
        <button className="text-muted-foreground">•••</button>
      </div>

      {/* Post content */}
      <div className="mb-4">
        <p className="mb-3 text-foreground">{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-muted">
            <div className="aspect-w-16 aspect-h-9 relative h-48 w-full">
              <Image
                src={post.images[0] || '/images/avatar-placeholder.jpg'}
                alt="Post"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between text-muted-foreground">
        <button
          className={`flex items-center space-x-1 ${
            liked ? 'text-accent' : ''
          }`}
          onClick={() => setLiked(!liked)}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex items-center space-x-1">
          <span>💬</span>
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center space-x-1">
          <span>🔄</span>
        </button>
        <button className="flex items-center space-x-1">
          <span>📤</span>
        </button>
      </div>
    </div>
  );
}

// Sample data
const stories = [
  { username: 'emma_w', imageUrl: '/images/avatar-placeholder.jpg', isUnread: true },
  { username: 'jason23', imageUrl: '/images/avatar-placeholder.jpg', isUnread: true },
  { username: 'sarah_j', imageUrl: '/images/avatar-placeholder.jpg', isUnread: false },
  { username: 'mike_t', imageUrl: '/images/avatar-placeholder.jpg', isUnread: false },
  { username: 'lisa99', imageUrl: '/images/avatar-placeholder.jpg', isUnread: true },
];

const posts: Post[] = [
  {
    id: 1,
    username: 'emma_wellness',
    userImage: '/images/avatar-placeholder.jpg',
    content: 'Just tried the new aromatherapy session at VibeWell Spa. Absolutely rejuvenating experience! 💆‍♀️✨ #SelfCare #Wellness',
    images: ['/images/avatar-placeholder.jpg'],
    likes: 42,
    comments: 8,
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    username: 'wellness_coach',
    userImage: '/images/avatar-placeholder.jpg',
    content: 'Morning meditation tip: Take 5 minutes each morning to center yourself before checking your phone. Your mental health will thank you! 🧘‍♂️ #MorningRoutine #Mindfulness',
    likes: 78,
    comments: 12,
    timestamp: '5 hours ago',
  },
  {
    id: 3,
    username: 'beauty_expert',
    userImage: '/images/avatar-placeholder.jpg',
    content: 'New natural skincare routine dropping soon! Can\'t wait to share these amazing products with you all. 💚 #NaturalBeauty #SkincareTips',
    images: ['/images/avatar-placeholder.jpg'],
    likes: 104,
    comments: 23,
    timestamp: '1 day ago',
  },
]; 