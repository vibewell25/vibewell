'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChatBubbleLeftIcon, 
  BookmarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { PostReaction, ReactionType } from '@/components/post-reaction';
import { SharePost } from '@/components/share-post';
import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/hooks/useAuth';

export interface PostUser {
  id: string;
  name: string;
  avatar: string;
}

export interface PostComment {
  id: string;
  user: PostUser;
  content: string;
  createdAt: string;
}

export interface Post {
  id: number;
  user: PostUser;
  content: string;
  image: string | null;
  createdAt: string;
  reactions: {
    [key in ReactionType]?: number;
  };
  comments: PostComment[];
}

export interface PostProps {
  post: Post;
  currentUserReaction: ReactionType | null;
  isSaved: boolean;
  isAuthenticated: boolean;
  formatDate?: (dateString: string) => string;
  onReactionChange: (reactionType: ReactionType | null) => void;
  onToggleSave: () => void;
  onCommentSubmit: (comment: string) => void;
  customActions?: React.ReactNode;
}

export function Post({
  post,
  currentUserReaction,
  isSaved,
  isAuthenticated,
  formatDate,
  onReactionChange,
  onToggleSave,
  onCommentSubmit,
  customActions
}: PostProps) {
  const { user: currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState(post.comments.length < 3);
  
  const toggleComments = () => {
    setExpandedComments(!expandedComments);
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !isAuthenticated) return;
    
    onCommentSubmit(commentText);
    setCommentText('');
  };
  
  const formatDateTime = (dateString: string) => {
    if (formatDate) {
      return formatDate(dateString);
    }
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <div className="card p-4">
      {/* Post Header */}
      <div className="flex items-start space-x-3 mb-4">
        <UserAvatar 
          src={post.user.avatar} 
          alt={`${post.user.name}'s avatar`}
          size="md"
        />
        <div>
          <h3 className="font-medium">{post.user.name}</h3>
          <p className="text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
        </div>
      </div>
      
      {/* Post Content */}
      <p className="mb-4">{post.content}</p>
      
      {/* Post Image */}
      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden bg-muted">
          <div className="aspect-video flex items-center justify-center">
            <p className="text-muted-foreground">Image: {post.image}</p>
          </div>
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          <PostReaction 
            postId={post.id.toString()} 
            initialReactions={post.reactions} 
            userReaction={currentUserReaction}
            onReactionChange={(postId, reactionType) => onReactionChange(reactionType)}
          />
          
          <button 
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleComments}
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{post.comments.length}</span>
          </button>
          
          <SharePost postId={post.id.toString()} postContent={post.content} />
          
          {customActions}
        </div>
        
        <button 
          className={`p-2 rounded-md ${
            isSaved 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={onToggleSave}
          disabled={!isAuthenticated}
        >
          <BookmarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Comments */}
      {expandedComments && (
        <div className="mt-4 space-y-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 pl-4 border-l-2 border-muted mt-3">
              <UserAvatar 
                src={comment.user.avatar}
                alt={`${comment.user.name}'s avatar`}
                size="sm"
              />
              <div className="flex-grow">
                <div className="flex items-baseline space-x-2">
                  <h4 className="font-medium text-sm">{comment.user.name}</h4>
                  <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
          
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mt-3">
              <UserAvatar 
                src={currentUser?.user_metadata?.avatar_url}
                alt={currentUser?.user_metadata?.full_name || 'User'}
                size="sm"
              />
              <div className="flex-grow relative">
                <input
                  type="text"
                  className="form-input pr-10 py-2 text-sm w-full"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-2 text-primary disabled:text-muted-foreground"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-3 text-sm text-center text-muted-foreground p-2 bg-muted/30 rounded">
              <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link> to add a comment
            </div>
          )}
        </div>
      )}
      
      {/* Show Comments Toggle */}
      {!expandedComments && post.comments.length > 0 && (
        <button
          onClick={toggleComments}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
        >
          Show {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
} 