'use client';

import { useState } from 'react';
import { useEngagement } from '@/hooks/use-engagement';
import { Badge as BadgeType } from '@/services/engagement-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { BADGES } from '@/services/engagement-service';
import { Lock, Trophy } from 'lucide-react';

interface BadgesDisplayProps {
  showUnlocked?: boolean;
  maxDisplay?: number;
}

export function BadgesDisplay({ showUnlocked = true, maxDisplay }: BadgesDisplayProps) {
  const { badges, isLoading } = useEngagement();
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Get earned badge IDs
  const earnedBadgeIds = badges.map(badge => badge.badgeId);

  // Filter badges to show
  const badgesToShow = showUnlocked
    ? BADGES // Show all badges
    : BADGES.filter(badge => earnedBadgeIds.includes(badge.id)); // Only earned badges

  // Limit if maxDisplay is provided
  const displayBadges = maxDisplay ? badgesToShow.slice(0, maxDisplay) : badgesToShow;

  const handleBadgeClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayBadges.map(badge => {
          const isEarned = earnedBadgeIds.includes(badge.id);

          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleBadgeClick(badge)}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                      isEarned ? 'hover:bg-primary/10' : 'opacity-50 hover:opacity-60'
                    }`}
                  >
                    <div className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {badge.image ? (
                        <Image
                          src={isEarned ? badge.image : '/badges/locked.svg'}
                          alt={badge.name}
                          width={64}
                          height={64}
                          className={`object-cover ${!isEarned && 'grayscale'}`}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          {isEarned ? (
                            <Trophy className="h-8 w-8 text-primary" />
                          ) : (
                            <Lock className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium truncate max-w-full">
                      {badge.name}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEarned ? badge.description : 'Badge locked'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Badge details dialog */}
      {selectedBadge && (
        <Dialog open={!!selectedBadge} onOpenChange={open => !open && setSelectedBadge(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBadge.name}</DialogTitle>
              <DialogDescription>{selectedBadge.description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center py-4">
              <div className="relative h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-4">
                {selectedBadge.image ? (
                  <Image
                    src={
                      earnedBadgeIds.includes(selectedBadge.id)
                        ? selectedBadge.image
                        : '/badges/locked.svg'
                    }
                    alt={selectedBadge.name}
                    width={128}
                    height={128}
                    className={`object-cover ${!earnedBadgeIds.includes(selectedBadge.id) && 'grayscale'}`}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    {earnedBadgeIds.includes(selectedBadge.id) ? (
                      <Trophy className="h-16 w-16 text-primary" />
                    ) : (
                      <Lock className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <div className="font-medium">
                  {earnedBadgeIds.includes(selectedBadge.id) ? (
                    <span className="text-green-600">Earned!</span>
                  ) : (
                    <span className="text-gray-500">Not yet earned</span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {earnedBadgeIds.includes(selectedBadge.id) ? (
                    <span>You've earned {selectedBadge.points} points with this badge!</span>
                  ) : (
                    <span>
                      How to earn:
                      {selectedBadge.criteria.type === 'sessions' &&
                        ` Complete ${selectedBadge.criteria.count} ${
                          selectedBadge.criteria.filter?.type || ''
                        } try-on sessions`}
                      {selectedBadge.criteria.type === 'shares' &&
                        ` Share your try-ons ${selectedBadge.criteria.count} times`}
                      {selectedBadge.criteria.type === 'streak' &&
                        ` Use the try-on feature ${selectedBadge.criteria.count} days in a row`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedBadge(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
