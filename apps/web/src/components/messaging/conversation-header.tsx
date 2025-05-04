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
  onVideoCall,
}: ConversationHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="rounded-full p-1 transition-colors hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
          {participant.avatar ? (
            <div className="relative h-full w-full">
              <Image
                src={participant.avatar}
                alt={participant.name || 'User'}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="text-md font-semibold">{participant.name.charAt(0) || '?'}</span>
          )}
        </div>

        <div>
          <h3 className="font-medium">{participant.name}</h3>
          {participant.status === 'online' ? (
            <p className="text-xs text-green-500">Online</p>
          ) : participant.lastSeen ? (
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
              className="rounded-full p-2 transition-colors hover:bg-muted"
              aria-label="Call"
              disabled={!onCall}
            >
              <Phone className="h-5 w-5" />
            </button>

            <button
              onClick={onVideoCall}
              className="rounded-full p-2 transition-colors hover:bg-muted"
              aria-label="Video call"
              disabled={!onVideoCall}
            >
              <Video className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          onClick={onMoreOptions}
          className="rounded-full p-2 transition-colors hover:bg-muted"
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
