'use client';

import { Icons } from '@/components/icons';
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
    return postContent.length > 60 ? `${postContent.substring(0, 60)}...` : postContent;
  };
  return (
    <div className="relative" ref={shareRef}>
      <button
        className="flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        onClick={() => setShowOptions(!showOptions)}
        aria-label="Share post"
      >
        <Icons.ShareIcon className="h-5 w-5" />
      </button>
      {showOptions && (
        <div className="absolute bottom-full right-0 z-10 mb-2 w-60 rounded-lg border border-border bg-card p-3 shadow-lg">
          <h4 className="mb-2 text-sm font-medium">Share this post</h4>
          <div className="space-y-2">
            {/* Share via message */}
            <Link
              href={`/messages?share=${encodeURIComponent(getShareLink())}`}
              className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted"
            >
              <Icons.EnvelopeIcon className="h-4 w-4" />
              <span className="text-sm">Send as message</span>
            </Link>
            {/* Share in community */}
            <button className="flex w-full items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted">
              <Icons.ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
              <span className="text-sm">Share to community</span>
            </button>
            {/* Copy link */}
            <button
              className="flex w-full items-center space-x-2 rounded-md p-2 transition-colors hover:bg-muted"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Icons.ClipboardDocumentCheckIcon className="text-primary h-4 w-4" />
              ) : (
                <Icons.DocumentDuplicateIcon className="h-4 w-4" />
              )}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy link'}</span>
            </button>
          </div>
          <div className="mt-3 border-t border-border pt-2">
            <div className="flex items-center space-x-2">
              <Icons.LinkIcon className="h-4 w-4 text-muted-foreground" />
              <p className="truncate text-xs text-muted-foreground">{getTruncatedContent()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
