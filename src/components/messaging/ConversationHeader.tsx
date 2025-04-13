import React from 'react';
import Image from 'next/image';
import { Participant } from '@/types/messaging';
import { formatLastSeen } from './utils';
import { MoreHorizontal, ArrowLeft, Phone, Video } from 'lucide-react';

interface ConversationHeaderProps {
  /**
   * Participant to display in the header
   */
  participant: Participant;
  
  /**
   * Optional className for styling
   */
  className?: string;
  
  /**
   * Optional callback for back button
   */
  onBack?: () => void;
  
  /**
   * Optional callback for the more options button
   */
  onMoreOptions?: () => void;
  
  /**
   * Whether to show the back button (useful on mobile)
   */
  showBackButton?: boolean;
  
  /**
   * Whether to show action buttons like call and video
   */
  showActionButtons?: boolean;
  
  /**
   * Optional callback for call button
   */
  onCall?: () => void;
  
  /**
   * Optional callback for video call button
   */
  onVideoCall?: () => void;
}

/**
 * ConversationHeader component
 * 
 * Displays the header of a conversation with the participant's info
 * and optional action buttons.
 */
export function ConversationHeader({
  participant,
  className = '',
  onBack,
  onMoreOptions,
  showBackButton = false,
  showActionButtons = true,
  onCall,
  onVideoCall
}: ConversationHeaderProps) {
  return (
    <div className={`p-4 border-b flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <button 
            onClick={onBack}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
          {participant?.avatar ? (
            <div className="relative w-full h-full">
              <Image 
                src={participant.avatar} 
                alt={participant?.name || 'User'} 
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="text-md font-semibold">
              {participant?.name.charAt(0) || '?'}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="font-medium">{participant?.name}</h3>
          {participant?.status === 'online' ? (
            <p className="text-xs text-green-500">Online</p>
          ) : participant?.lastSeen ? (
            <p className="text-xs text-muted-foreground">
              Last seen: {formatLastSeen(participant.lastSeen)}
            </p>
          ) : null}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {showActionButtons && (
          <>
            <button 
              onClick={onCall}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Call"
              disabled={!onCall}
            >
              <Phone className="h-5 w-5" />
            </button>
            
            <button 
              onClick={onVideoCall}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Video call"
              disabled={!onVideoCall}
            >
              <Video className="h-5 w-5" />
            </button>
          </>
        )}
        
        <button 
          onClick={onMoreOptions}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="More options"
          disabled={!onMoreOptions}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default ConversationHeader; 