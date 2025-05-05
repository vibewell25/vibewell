import { useEngagement } from '@/hooks/use-engagement';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, TrendingUp } from 'lucide-react';

interface LevelProgressProps {
  showDetails?: boolean;
  className?: string;
// Calculate thresholds for level up
function calculateLevelThresholds(currentLevel: number): { current: number; next: number } {
  // Level 1: 0-100, Level 2: 101-220, Level 3: 221-364, etc.
  if (currentLevel === 1) {
    return { current: 0, next: 100 };
let threshold = 100;
  for (let i = 2; i < currentLevel; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    if (threshold > Number.MAX_SAFE_INTEGER || threshold < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); threshold += Math.floor(threshold * 0.2);
const nextThreshold = threshold + Math.floor(threshold * 0.2);

  return { current: threshold, next: nextThreshold };
export function LevelProgress({ showDetails = true, className = '' }: LevelProgressProps) {
  const { points, badges, isLoading } = useEngagement();

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        {showDetails && (
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-16 w-1/3" />
            <Skeleton className="h-16 w-1/3" />
            <Skeleton className="h-16 w-1/3" />
          </div>
        )}
      </div>
if (!points) {
    return null;
const { current: currentThreshold, next: nextThreshold } = calculateLevelThresholds(points.level);
  const pointsToNextLevel = nextThreshold - points.points;
  const progressPercentage =
    ((points.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="text-primary h-5 w-5" />
          <span className="font-semibold">Level {points.level}</span>
        </div>
        <span className="text-sm text-muted-foreground">{points.points} points</span>
      </div>

      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {points.points - currentThreshold} / {nextThreshold - currentThreshold}
          </span>
          <span>
            {pointsToNextLevel} points to level {points.level + 1}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-3">
            <div className="text-primary mb-1 flex items-center gap-1">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">{badges.length}</span>
            <span className="text-xs text-muted-foreground">Badges</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-3">
            <div className="text-primary mb-1 flex items-center gap-1">
              <Star className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">{points.points}</span>
            <span className="text-xs text-muted-foreground">Points</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-3">
            <div className="text-primary mb-1 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">{points.level}</span>
            <span className="text-xs text-muted-foreground">Level</span>
          </div>
        </div>
      )}
    </div>
