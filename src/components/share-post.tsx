import { Icons } from '@/components/icons';
'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
interface SharePostProps {
  postId: string;
  postContent: string;
}
export function SharePost({ postId, postContent }: SharePostProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  // Close share options when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Get a shareable link for the post
  const getShareLink = () => {
    return `${window.location.origin}/post/${postId}`;
  };
  // Copy the post link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Truncate long content for sharing
  const getTruncatedContent = () => {
    return postContent.length > 60 
      ? `${postContent.substring(0, 60)}...` 
      : postContent;
  };
  return (
    <div className="relative" ref={shareRef}>
      <button
        className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setShowOptions(!showOptions)}
        aria-label="Share post"
      >
        <Icons.ShareIcon className="h-5 w-5" />
      </button>
      {showOptions && (
        <div className="absolute bottom-full mb-2 right-0 bg-card rounded-lg shadow-lg border border-border p-3 w-60 z-10">
          <h4 className="text-sm font-medium mb-2">Share this post</h4>
          <div className="space-y-2">
            {/* Share via message */}
            <Link
              href={`/messages?share=${encodeURIComponent(getShareLink())}`}
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Icons.EnvelopeIcon className="h-4 w-4" />
              <span className="text-sm">Send as message</span>
            </Link>
            {/* Share in community */}
            <button 
              className="w-full flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Icons.ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
              <span className="text-sm">Share to community</span>
            </button>
            {/* Copy link */}
            <button 
              className="w-full flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Icons.ClipboardDocumentCheckIcon className="h-4 w-4 text-primary" />
              ) : (
                <Icons.DocumentDuplicateIcon className="h-4 w-4" />
              )}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </div>
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <Icons.LinkIcon className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">
                {getTruncatedContent()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 