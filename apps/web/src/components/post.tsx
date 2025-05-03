'use client';

import { Icons } from '@/components/icons';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PostReaction, ReactionType } from '@/components/post-reaction';
import { SharePost } from '@/components/share-post';
import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/hooks/useAuth';

/**
 * Represents a user in the context of a post
 * @interface PostUser
 * @property {string} id - Unique identifier for the user
 * @property {string} name - Display name of the user
 * @property {string} avatar - URL to the user's avatar image
 */
export interface PostUser {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Represents a comment on a post
 * @interface PostComment
 * @property {string} id - Unique identifier for the comment
 * @property {PostUser} user - User who created the comment
 * @property {string} content - Text content of the comment
 * @property {string} createdAt - ISO date string for when the comment was created
 */
export interface PostComment {
  id: string;
  user: PostUser;
  content: string;
  createdAt: string;
}

/**
 * Represents a post in the social feed
 * @interface Post
 * @property {number} id - Unique identifier for the post
 * @property {PostUser} user - User who created the post
 * @property {string} content - Text content of the post
 * @property {string | null} image - Optional image URL for the post
 * @property {string} createdAt - ISO date string for when the post was created
 * @property {Object} reactions - Count of each reaction type on the post
 * @property {PostComment[]} comments - Comments on the post
 */
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

/**
 * Props for the Post component
 * @interface PostProps
 * @property {Post} post - The post data to display
 * @property {ReactionType | null} currentUserReaction - The current user's reaction to the post, if any
 * @property {boolean} isSaved - Whether the current user has saved this post
 * @property {boolean} isAuthenticated - Whether the user is authenticated
 * @property {Function} [formatDate] - Optional custom function to format dates
 * @property {Function} onReactionChange - Handler for when reaction changes
 * @property {Function} onToggleSave - Handler for when save status changes
 * @property {Function} onCommentSubmit - Handler for when a comment is submitted
 * @property {React?.ReactNode} [customActions] - Optional additional action buttons
 */
export interface PostProps {
  post: Post;
  currentUserReaction: ReactionType | null;
  isSaved: boolean;
  isAuthenticated: boolean;
  formatDate?: (dateString: string) => string;
  onReactionChange: (reactionType: ReactionType | null) => void;
  onToggleSave: () => void;
  onCommentSubmit: (comment: string) => void;
  customActions?: React?.ReactNode;
}

/**
 * Post component for displaying social media posts with reactions and comments
 *
 * Displays a post with user information, content, image (if available),
 * reaction buttons, comments section, and comment form for authenticated users.
 *
 * @param {PostProps} props - Component properties
 * @returns {JSX?.Element} Rendered post component
 */
export function Post({
  post,
  currentUserReaction,
  isSaved,
  isAuthenticated,
  formatDate,
  onReactionChange,
  onToggleSave,
  onCommentSubmit,
  customActions,
}: PostProps) {
  const { user: currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState(post?.comments.length < 3);

  /**
   * Toggles the expanded state of the comments section
   */
  const toggleComments = () => {
    setExpandedComments(!expandedComments);
  };

  /**
   * Handles submission of a new comment
   * @param {React?.FormEvent} e - Form event
   */
  const handleCommentSubmit = (e: React?.FormEvent) => {
    e?.preventDefault();
    if (!commentText?.trim() || !isAuthenticated) return;
    onCommentSubmit(commentText);
    setCommentText('');
  };

  /**
   * Formats a date string for display
   * Uses custom format function if provided, otherwise uses date-fns
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date string
   */
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
      <div className="mb-4 flex items-start space-x-3">
        <UserAvatar src={post?.user.avatar} alt={`${post?.user.name}'s avatar`} size="md" />
        <div>
          <h3 className="font-medium">{post?.user.name}</h3>
          <p className="text-xs text-muted-foreground">{formatDateTime(post?.createdAt)}</p>
        </div>
      </div>
      {/* Post Content */}
      <p className="mb-4">{post?.content}</p>
      {/* Post Image */}
      {post?.image && (
        <div className="mb-4 overflow-hidden rounded-lg bg-muted">
          <div className="flex aspect-video items-center justify-center">
            <p className="text-muted-foreground">Image: {post?.image}</p>
          </div>
        </div>
      )}
      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center space-x-2">
          <PostReaction
            postId={post?.id.toString()}
            initialReactions={post?.reactions}
            userReaction={currentUserReaction}
            onReactionChange={(postId, reactionType) => onReactionChange(reactionType)}
          />
          <button
            className="flex items-center space-x-1 rounded-md px-3 py-1?.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            onClick={toggleComments}
          >
            <Icons?.messageCircle className="h-5 w-5" />
            <span>{post?.comments.length}</span>
          </button>
          <SharePost postId={post?.id.toString()} postContent={post?.content} />
          {customActions}
        </div>
        <button
          className={`rounded-md p-2 ${
            isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={onToggleSave}
          disabled={!isAuthenticated}
        >
          <Icons?.bookmark className="h-5 w-5" />
        </button>
      </div>
      {/* Comments */}
      {expandedComments && (
        <div className="mt-4 space-y-4">
          {post?.comments.map((comment) => (
            <div
              key={comment?.id}
              className="mt-3 flex items-start space-x-3 border-l-2 border-muted pl-4"
            >
              <UserAvatar
                src={comment?.user.avatar}
                alt={`${comment?.user.name}'s avatar`}
                size="sm"
              />
              <div className="flex-grow">
                <div className="flex items-baseline space-x-2">
                  <h4 className="text-sm font-medium">{comment?.user.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(comment?.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm">{comment?.content}</p>
              </div>
            </div>
          ))}
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mt-3 flex items-start space-x-3">
              <UserAvatar
                src={
                  currentUser?.name
                    ? `https://ui-avatars?.com/api/?name=${encodeURIComponent(currentUser?.name)}`
                    : undefined
                }
                alt={currentUser?.name || 'User'}
                fallbackInitials={currentUser?.name}
                size="sm"
              />
              <div className="relative flex-grow">
                <input
                  type="text"
                  className="form-input w-full py-2 pr-10 text-sm"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e?.target.value)}
                />
                <button
                  type="submit"
                  disabled={!commentText?.trim()}
                  className="text-primary absolute right-2 top-2 disabled:text-muted-foreground"
                >
                  <Icons?.send className="h-5 w-5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-3 rounded bg-muted/30 p-2 text-center text-sm text-muted-foreground">
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>{' '}
              to add a comment
            </div>
          )}
        </div>
      )}
      {/* Show Comments Toggle */}
      {!expandedComments && post?.comments.length > 0 && (
        <button
          onClick={toggleComments}
          className="mt-2 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Show {post?.comments.length} comment{post?.comments.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
