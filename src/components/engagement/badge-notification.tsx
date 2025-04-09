'use client';

import { useEffect } from 'react';
import { useEngagement } from '@/hooks/use-engagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Confetti } from '@/components/ui/confetti';
import { Trophy } from 'lucide-react';

export function BadgeNotification() {
  const { newBadges, closeNewBadgeNotification, showBadgeNotification } = useEngagement();
  
  // Show badge notification when new badges are earned
  useEffect(() => {
    if (newBadges.length > 0) {
      // Show notification for the first badge in the queue
      showBadgeNotification(newBadges[0]);
    }
  }, [newBadges, showBadgeNotification]);
  
  if (newBadges.length === 0) {
    return null;
  }
  
  const currentBadge = newBadges[0];
  
  return (
    <Dialog 
      open={newBadges.length > 0} 
      onOpenChange={() => closeNewBadgeNotification(currentBadge.id)}
    >
      <DialogContent className="sm:max-w-md">
        <Confetti active={true} />
        
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">New Badge Earned!</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="relative h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-primary animate-pulse">
            {currentBadge.image ? (
              <Image
                src={currentBadge.image}
                alt={currentBadge.name}
                width={128}
                height={128}
                className="object-cover"
              />
            ) : (
              <Trophy className="h-16 w-16 text-primary" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">{currentBadge.name}</h3>
            <p className="text-muted-foreground">{currentBadge.description}</p>
            <p className="text-sm font-medium text-primary">+{currentBadge.points} points</p>
          </div>
        </div>
        
        <DialogFooter className="justify-center">
          <Button onClick={() => closeNewBadgeNotification(currentBadge.id)}>
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 