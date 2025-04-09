'use client';

import { useState, useEffect } from 'react';
import { Tooltip } from '@/components/ui/tooltip';

export type ReactionType = '❤️' | '👍' | '😂' | '😮' | '😢' | '😡';

interface Reaction {
  type: ReactionType;
  count: number;
  reacted: boolean;
}

interface PostReactionProps {
  postId: string;
  initialReactions?: Partial<Record<ReactionType, number>>;
  userReaction?: ReactionType | null;
  onReactionChange?: (postId: string, reactionType: ReactionType | null) => void;
}

const REACTION_TYPES: ReactionType[] = ['❤️', '👍', '😂', '😮', '😢', '😡'];

const REACTION_LABELS: Record<ReactionType, string> = {
  '❤️': 'Love',
  '👍': 'Like',
  '😂': 'Haha',
  '😮': 'Wow',
  '😢': 'Sad',
  '😡': 'Angry'
};

export function PostReaction({
  postId,
  initialReactions = {},
  userReaction = null,
  onReactionChange
}: PostReactionProps) {
  // Initialize reactions with defaults
  const [reactions, setReactions] = useState<Reaction[]>(
    REACTION_TYPES.map(type => ({
      type,
      count: initialReactions[type] || 0,
      reacted: type === userReaction
    }))
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(userReaction);

  // Calculate total reaction count
  const totalReactions = reactions.reduce((sum, reaction) => sum + reaction.count, 0);

  // Handle reaction selection
  const handleReactionClick = (type: ReactionType) => {
    const newReactions = [...reactions];
    
    // If the same reaction is clicked again, remove it
    if (selectedReaction === type) {
      // Find the reaction and decrement its count
      const index = newReactions.findIndex(r => r.type === type);
      if (index !== -1 && newReactions[index].count > 0) {
        newReactions[index].count -= 1;
        newReactions[index].reacted = false;
      }
      setSelectedReaction(null);
      
      // Call the callback if provided
      if (onReactionChange) {
        onReactionChange(postId, null);
      }
    } else {
      // If user had previously reacted, remove that reaction first
      if (selectedReaction) {
        const previousIndex = newReactions.findIndex(r => r.type === selectedReaction);
        if (previousIndex !== -1 && newReactions[previousIndex].count > 0) {
          newReactions[previousIndex].count -= 1;
          newReactions[previousIndex].reacted = false;
        }
      }
      
      // Add the new reaction
      const index = newReactions.findIndex(r => r.type === type);
      if (index !== -1) {
        newReactions[index].count += 1;
        newReactions[index].reacted = true;
      }
      setSelectedReaction(type);
      
      // Call the callback if provided
      if (onReactionChange) {
        onReactionChange(postId, type);
      }
    }
    
    setReactions(newReactions);
    setShowReactionPicker(false);
  };

  // Get the main button display
  const getMainButtonDisplay = () => {
    if (selectedReaction) {
      return (
        <span className="flex items-center">
          <span className="mr-1">{selectedReaction}</span>
          <span>{REACTION_LABELS[selectedReaction]}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center">
        <span className="mr-1">👍</span>
        <span>React</span>
      </span>
    );
  };

  return (
    <div className="relative">
      {/* Main reaction button */}
      <button 
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm 
          ${selectedReaction 
            ? 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          } transition-colors`}
        onClick={() => setShowReactionPicker(!showReactionPicker)}
      >
        {getMainButtonDisplay()}
        {totalReactions > 0 && <span className="ml-1">{totalReactions}</span>}
      </button>

      {/* Reaction picker */}
      {showReactionPicker && (
        <div className="absolute bottom-full mb-2 left-0 bg-card rounded-lg shadow-lg border border-border p-2 flex space-x-1 z-10">
          {REACTION_TYPES.map(type => (
            <Tooltip key={type} content={REACTION_LABELS[type]}>
              <button
                className={`text-xl p-1.5 rounded-full transition-transform hover:scale-125 ${
                  selectedReaction === type ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => handleReactionClick(type)}
              >
                {type}
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
} 