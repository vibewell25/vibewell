import { useEffect } from 'react';
import { useEngagement } from '@/hooks/use-engagement';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
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
[newBadges, showBadgeNotification]);

  if (newBadges.length === 0) {
    return null;
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

        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="bg-primary/10 border-primary relative flex h-32 w-32 animate-pulse items-center justify-center overflow-hidden rounded-full border-4">
            {currentBadge.image ? (
              <Image
                src={currentBadge.image}
                alt={currentBadge.name}
                width={128}
                height={128}
                className="object-cover"
              />
            ) : (
              <Trophy className="text-primary h-16 w-16" />
            )}
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold">{currentBadge.name}</h3>
            <p className="text-muted-foreground">{currentBadge.description}</p>
            <p className="text-primary text-sm font-medium">+{currentBadge.points} points</p>
          </div>
        </div>

        <DialogFooter className="justify-center">
          <Button onClick={() => closeNewBadgeNotification(currentBadge.id)}>Awesome!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
