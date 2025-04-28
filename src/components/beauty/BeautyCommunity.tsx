import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import {
  getCommunityPosts,
  createPost,
  likePost,
  commentOnPost,
  followUser,
} from '@/lib/api/beauty';

export default function BeautyCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    images: [] as File[],
    tags: [] as string[],
    routineId: '',
  });
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const communityPosts = await getCommunityPosts();
      setPosts(communityPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPost((prev) => ({
        ...prev,
        images: [...prev.images, ...Array.from(e.target.files!)],
      }));
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newPost.tags.includes(tag)) {
      setNewPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmitPost = async () => {
    try {
      await createPost(newPost);
      setShowNewPost(false);
      setNewPost({
        content: '',
        images: [],
        tags: [],
        routineId: '',
      });
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    try {
      await commentOnPost(postId, { content: newComment[postId] });
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
      loadPosts();
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
      loadPosts();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beauty Community</h2>
        <Button onClick={() => setShowNewPost(!showNewPost)}>
          {showNewPost ? 'Cancel' : 'Share Post'}
        </Button>
      </div>

      {showNewPost && (
        <Card className="space-y-4 p-6">
          <Input
            label="Share your thoughts..."
            value={newPost.content}
            onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
            multiline
            rows={4}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">Add Photos</label>
            <div className="flex flex-wrap gap-2">
              {newPost.images.map((image, index) => (
                <div key={index} className="relative h-24 w-24 overflow-hidden rounded">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setNewPost((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }))
                    }
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
                <span className="text-3xl text-gray-400">+</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Add Tags</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {newPost.tags.map((tag) => (
                <Badge key={tag} className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  #{tag} ×
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Add tag and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          <Button onClick={handleSubmitPost}>Share</Button>
        </Card>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start gap-4">
              <img src={post.user.avatar} alt={post.user.name} className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{post.user.name}</h3>
                    <p className="text-sm text-gray-600">{formatTimeAgo(post.createdAt)}</p>
                  </div>
                  {!post.user.isCurrentUser && (
                    <Button variant="outline" size="sm" onClick={() => handleFollow(post.user.id)}>
                      {post.user.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>

                <p className="mt-2">{post.content}</p>

                {post.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="rounded"
                      />
                    ))}
                  </div>
                )}

                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag}>#{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <span className={post.isLiked ? 'text-primary' : ''}>♥ {post.likes}</span>
                  </button>
                  <span className="text-sm">{post.comments.length} comments</span>
                </div>

                <div className="mt-4 space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm font-medium">{comment.user.name}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                    />
                    <Button onClick={() => handleComment(post.id)} disabled={!newComment[post.id]}>
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
