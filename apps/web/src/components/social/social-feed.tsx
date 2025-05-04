import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/Input';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  author: {
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
  hasLiked?: boolean;
}

interface SocialFeedProps {
  className?: string;
}

export function SocialFeed({ className = '' }: SocialFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch('/api/social/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!newPost.trim()) return;

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (!response.ok) throw new Error('Failed to create post');

      const post = await response.json();
      setPosts([post, ...posts]);
      setNewPost('');

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    }
  };

  const handleLikePost = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like post');

      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
              hasLiked: !post.hasLiked,
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.Spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Create Post */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Avatar>
              <img src={user.avatar || '/default-avatar.png'} alt={user.name || 'User'} />
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Share something..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <img src={post.author.avatar || '/default-avatar.png'} alt={post.author.name} />
                </Avatar>
                <div>
                  <CardTitle className="text-base">{post.author.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="mb-4 max-h-96 w-full rounded-lg object-cover"
                />
              )}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id)}
                  className={post.hasLiked ? 'text-blue-600' : ''}
                >
                  <Icons.Heart className="mr-1 h-5 w-5" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <Icons.MessageCircle className="mr-1 h-5 w-5" />
                  {post.comments}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
