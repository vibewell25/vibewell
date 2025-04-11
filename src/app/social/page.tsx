'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { 
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { ReactionType } from '@/components/post-reaction';
import { Post, PostComment } from '@/components/post';
import { UserAvatar } from '@/components/user-avatar';
import { RecommendedConnections } from '@/components/recommended-connections';
import { useRouter } from 'next/navigation';
import { 
  getPosts, 
  createPost as apiCreatePost, 
  addComment as apiAddComment,
  addReaction as apiAddReaction,
  removeReaction as apiRemoveReaction,
  savePost as apiSavePost,
  unsavePost as apiUnsavePost,
  getSavedPosts,
  getUserReactions,
  Post as PostType
} from '@/lib/api/social';
import { getUpcomingEvents, registerForEvent, cancelEventRegistration } from '@/lib/api/events';
import { Event } from '@/types/events';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { UserButton } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostReaction } from '@/components/post-reaction';
import { MessageSquare } from 'lucide-react';
import { EventShareCard } from '@/components/event-share-card';
import { CommunityEventsSection } from '@/components/community-events-section';

// Fallback dummy data in case API fails
const initialPosts: PostType[] = [
  {
    id: 1,
    user: {
      id: 'user1',
      name: 'Emma Thompson',
      avatar: '/avatar1.png',
    },
    content: 'Just finished a 30-day meditation challenge! Feeling more centered and focused than ever. Anyone else tried this?',
    image: null,
    createdAt: '2023-07-15T14:30:00.000Z',
    reactions: {
      '❤️': 12,
      '👍': 8,
      '😂': 0,
      '😮': 4,
      '😢': 0,
      '😡': 0
    },
    comments: [
      {
        id: 'comment1',
        user: {
          id: 'user2',
          name: 'David Chen',
          avatar: '/avatar2.png',
        },
        content: 'That\'s amazing! I\'ve been meditating for about 2 weeks now. Any tips for beginners?',
        createdAt: '2023-07-15T15:45:00.000Z',
      },
      {
        id: 'comment2',
        user: {
          id: 'user3',
          name: 'Sarah Williams',
          avatar: '/avatar3.png',
        },
        content: 'Congratulations! Which meditation program did you follow?',
        createdAt: '2023-07-15T16:20:00.000Z',
      },
    ],
  },
  // More fallback posts...
];

export default function SocialPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [newPost, setNewPost] = useState('');
  const [userReactions, setUserReactions] = useState<{[key: number]: ReactionType | null}>({});
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [sharedEvents, setSharedEvents] = useState<{[key: string]: boolean}>({});
  const router = useRouter();

  // Fetch posts, user reactions, and saved posts on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : initialPosts);
        
        // Fetch upcoming events
        const events = await getUpcomingEvents(3);
        setUpcomingEvents(events);
        
        if (user?.id) {
          // Fetch user reactions
          const reactions = await getUserReactions(user.id);
          setUserReactions(reactions);
          
          // Fetch saved posts
          const saved = await getSavedPosts(user.id);
          setSavedPosts(saved);
        }
      } catch (err) {
        console.error('Error fetching social data:', err);
        setError('Failed to load social feed. Please try again later.');
        
        // Fallback to initial posts if API fails
        setPosts(initialPosts);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.trim() || loading || !user?.id) return;
    
    try {
      const createdPost = await apiCreatePost(user.id, newPost);
      
      if (createdPost) {
        setPosts([createdPost, ...posts]);
        setNewPost('');
      } else {
        throw new Error('Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      // Optimistic update in case of API failure
      const optimisticPost: PostType = {
        id: Date.now(), // Temporary ID
        user: {
          id: user.id,
          name: user.user_metadata?.full_name || 'Anonymous',
          avatar: user.user_metadata?.avatar_url || '/avatar-placeholder.png',
        },
        content: newPost,
        image: null,
        createdAt: new Date().toISOString(),
        reactions: {
          '❤️': 0,
          '👍': 0,
          '😂': 0,
          '😮': 0,
          '😢': 0,
          '😡': 0
        },
        comments: [],
      };
      
      setPosts([optimisticPost, ...posts]);
      setNewPost('');
    }
  };

  const handleCommentSubmit = async (postId: number, comment: string) => {
    if (!comment.trim() || loading || !user?.id) return;
    
    try {
      const newComment = await apiAddComment(user.id, postId, comment);
      
      if (newComment) {
        // Update posts with the new comment
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment],
            };
          }
          return post;
        }));
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      // Optimistic update in case of API failure
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        user: {
          id: user.id,
          name: user.user_metadata?.full_name || 'Anonymous',
          avatar: user.user_metadata?.avatar_url || '/avatar-placeholder.png',
        },
        content: comment,
        createdAt: new Date().toISOString(),
      };
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, optimisticComment],
          };
        }
        return post;
      }));
    }
  };

  const handleReactionChange = async (postId: number, reactionType: ReactionType | null) => {
    if (!user?.id) return;
    
    // First, capture the previous reaction to remove it if needed
    const prevReaction = userReactions[postId];
    
    // Optimistically update UI
    // Update user reactions state
    setUserReactions(prev => ({
      ...prev,
      [postId]: reactionType
    }));
    
    // Update posts with new reaction counts
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedReactions = { ...post.reactions };
        
        // If there was a previous reaction, decrement it
        if (prevReaction) {
          updatedReactions[prevReaction] = Math.max(0, (updatedReactions[prevReaction] || 0) - 1);
        }
        
        // If there's a new reaction, increment it
        if (reactionType) {
          updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
        }
        
        return {
          ...post,
          reactions: updatedReactions
        };
      }
      return post;
    }));
    
    // Send to API
    try {
      let success;
      
      if (reactionType) {
        success = await apiAddReaction(user.id, postId, reactionType);
      } else {
        success = await apiRemoveReaction(user.id, postId);
      }
      
      if (!success) {
        throw new Error('Failed to update reaction');
      }
    } catch (err) {
      console.error('Error updating reaction:', err);
      
      // Revert changes on failure
      setUserReactions(prev => ({
        ...prev,
        [postId]: prevReaction
      }));
      
      // Revert post reaction counts
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return post; // Revert to original post
        }
        return post;
      }));
    }
  };

  const toggleSave = async (postId: number) => {
    if (!user?.id) return;
    
    const isSaved = savedPosts.includes(postId);
    
    // Optimistic update
    if (isSaved) {
      setSavedPosts(savedPosts.filter(id => id !== postId));
    } else {
      setSavedPosts([...savedPosts, postId]);
    }
    
    // API call
    try {
      let success;
      
      if (isSaved) {
        success = await apiUnsavePost(user.id, postId);
      } else {
        success = await apiSavePost(user.id, postId);
      }
      
      if (!success) {
        throw new Error('Failed to update saved status');
      }
    } catch (err) {
      console.error('Error updating saved status:', err);
      
      // Revert on failure
      if (isSaved) {
        setSavedPosts([...savedPosts, postId]);
      } else {
        setSavedPosts(savedPosts.filter(id => id !== postId));
      }
    }
  };

  const initiateMessage = (userId: string, userName: string) => {
    // In a real app, you'd create a conversation if one doesn't exist
    // For now, we'll just redirect to the messages page
    router.push(`/messages?initiate=${userId}&name=${encodeURIComponent(userName)}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEventShare = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      const event = upcomingEvents.find(e => e.id === eventId);
      if (!event) return;
      
      const postContent = `I'm excited about this event! 🎉\n\n${event.title}\n${event.shortDescription}\n\nJoin me at ${format(parseISO(event.startDate), 'MMM d, yyyy h:mm a')}`;
      
      const createdPost = await apiCreatePost(user.id, postContent);
      
      if (createdPost) {
        setPosts([createdPost, ...posts]);
        setSharedEvents(prev => ({ ...prev, [eventId]: true }));
      }
    } catch (err) {
      console.error('Error sharing event:', err);
    }
  };

  const handleEventAttendance = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      const isAttending = sharedEvents[eventId];
      
      if (isAttending) {
        await cancelEventRegistration(eventId, user.id);
      } else {
        await registerForEvent(eventId, user.id, user.user_metadata?.full_name || 'Anonymous', user.user_metadata?.avatar_url);
      }
      
      setSharedEvents(prev => ({ ...prev, [eventId]: !isAttending }));
      
      // Refresh upcoming events
      const events = await getUpcomingEvents(3);
      setUpcomingEvents(events);
    } catch (err) {
      console.error('Error updating event attendance:', err);
    }
  };

  // Rest of the component remains the same
  return (
    <Layout>
      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-6">Community Feed</h1>
              
              {user ? (
                <div className="card mb-6">
                  <div className="p-4 flex gap-3">
                    <UserAvatar 
                      src={user.user_metadata?.avatar_url} 
                      alt={user.user_metadata?.full_name || 'User'} 
                      size="md" 
                    />
                    <form className="flex-1" onSubmit={handlePostSubmit}>
                      <textarea 
                        className="form-textarea w-full mb-3"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share something with the community..."
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <button 
                          type="submit" 
                          className="btn-primary flex items-center gap-1"
                          disabled={!newPost.trim()}
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="card bg-muted/30 mb-6 p-4 text-center">
                  <p className="mb-2">Sign in to share posts and interact with the community</p>
                  <Link href="/auth/sign-in" className="btn-primary">
                    Sign In
                  </Link>
                </div>
              )}
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="card p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div>
                          <div className="h-4 w-32 bg-muted rounded"></div>
                          <div className="h-3 w-24 bg-muted/70 rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-4/6"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-16 bg-muted rounded"></div>
                        <div className="h-8 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="card p-4 text-center text-red-500">
                  <p>{error}</p>
                  <button 
                    className="btn-secondary mt-2"
                    onClick={() => location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Post
                      key={post.id} 
                      post={post}
                      isSaved={savedPosts.includes(post.id)}
                      currentUserReaction={userReactions[post.id] || null}
                      onReactionChange={(reaction) => handleReactionChange(post.id, reaction)}
                      onToggleSave={() => toggleSave(post.id)}
                      onCommentSubmit={(comment) => handleCommentSubmit(post.id, comment)}
                      isAuthenticated={!!user}
                      formatDate={formatDate}
                      customActions={
                        user && user.id !== post.user.id && (
                          <button
                            onClick={() => initiateMessage(post.user.id, post.user.name)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            aria-label="Message"
                            title="Send message"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                            <span>Message</span>
                          </button>
                        )
                      }
                    />
                  ))}
                  
                  {posts.length === 0 && (
                    <div className="card p-6 text-center">
                      <p className="text-muted-foreground">No posts to show. Be the first to share something!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Section */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Community</h2>
              <RecommendedConnections />
              <div className="mt-4">
                <Link href="/messages" className="btn-secondary w-full justify-center flex items-center gap-2">
                  <PaperAirplaneIcon className="h-4 w-4" />
                  Messages
                </Link>
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="card p-4">
              <CommunityEventsSection
                title="Upcoming Events"
                limit={3}
                showCreateButton={true}
                showViewAllButton={true}
              />
            </div>
            
            {/* Trending Topics */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Trending Topics</h2>
              <div className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <h3 className="font-medium">#Meditation</h3>
                  <p className="text-sm text-muted-foreground">125 posts this week</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <h3 className="font-medium">#Nutrition</h3>
                  <p className="text-sm text-muted-foreground">98 posts this week</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <h3 className="font-medium">#Yoga</h3>
                  <p className="text-sm text-muted-foreground">87 posts this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventShareCard
                  key={event.id}
                  event={event}
                  onShare={() => handleEventShare(event.id)}
                  onAttend={() => handleEventAttendance(event.id)}
                  isAttending={sharedEvents[event.id]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 