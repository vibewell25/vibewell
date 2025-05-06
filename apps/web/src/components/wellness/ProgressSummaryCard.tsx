import { Icons } from '@/components/icons';
import { ProgressSummary } from '@/types/progress';
interface ProgressSummaryCardProps {
  summary: ProgressSummary;
export function ProgressSummaryCard({ summary }: ProgressSummaryCardProps) {
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
return (
    <div className="card from-primary/5 bg-gradient-to-br to-transparent">
      <h3 className="mb-4 text-lg font-semibold">Progress Summary</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Daily Streak */}
        <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Streak</h4>
            <Icons.FireIcon className="h-5 w-5 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.dailyStreak} days</p>
        </div>
        {/* Active Goals */}
        <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Active Goals</h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.activeGoals}</p>
        </div>
        {/* Completed Goals */}
        <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
            <Icons.TrophyIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.completedGoals}</p>
        </div>
        {/* Total Steps */}
        <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Total Steps</h4>
            <span className="text-purple-500">👣</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatNumber(summary.thisWeekProgress.steps)}</p>
        </div>
      </div>
      {/* Weekly Progress */}
      <div className="mt-8">
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">Weekly Progress</h4>
        <div className="space-y-4">
          {/* Meditation */}
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm">Meditation</span>
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {summary.thisWeekProgress.meditation} mins
                </span>
                {summary.improvement.meditation !== 0 && (
                  <span
                    className={`ml-2 flex items-center text-xs ${
                      summary.improvement.meditation > 0 ? 'text-green-500' : 'text-red-500'
`}
                  >
                    {summary.improvement.meditation > 0 ? (
                      <Icons.ArrowUpIcon className="mr-0.5 h-3 w-3" />
                    ) : (
                      <Icons.ArrowDownIcon className="mr-0.5 h-3 w-3" />
                    )}
                    {Math.abs(summary.improvement.meditation)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-purple-500 transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, (summary.thisWeekProgress.meditation / 120) * 100)}%`,
/>
            </div>
          </div>
          {/* Workout */}
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm">Workout</span>
              <div className="flex items-center">
                <span className="text-sm font-medium">{summary.thisWeekProgress.workout} mins</span>
                {summary.improvement.workout !== 0 && (
                  <span
                    className={`ml-2 flex items-center text-xs ${
                      summary.improvement.workout > 0 ? 'text-green-500' : 'text-red-500'
`}
                  >
                    {summary.improvement.workout > 0 ? (
                      <Icons.ArrowUpIcon className="mr-0.5 h-3 w-3" />
                    ) : (
                      <Icons.ArrowDownIcon className="mr-0.5 h-3 w-3" />
                    )}
                    {Math.abs(summary.improvement.workout)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-pink-500 transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, (summary.thisWeekProgress.workout / 180) * 100)}%`,
/>
            </div>
          </div>
          {/* Water */}
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm">Water</span>
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {summary.thisWeekProgress.water} glasses
                </span>
                {summary.improvement.water !== 0 && (
                  <span
                    className={`ml-2 flex items-center text-xs ${
                      summary.improvement.water > 0 ? 'text-green-500' : 'text-red-500'
`}
                  >
                    {summary.improvement.water > 0 ? (
                      <Icons.ArrowUpIcon className="mr-0.5 h-3 w-3" />
                    ) : (
                      <Icons.ArrowDownIcon className="mr-0.5 h-3 w-3" />
                    )}
                    {Math.abs(summary.improvement.water)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, (summary.thisWeekProgress.water / 56) * 100)}%`,
/>
            </div>
          </div>
          {/* Sleep */}
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm">Sleep (avg)</span>
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {summary.thisWeekProgress.sleep.toFixed(1)} hrs
                </span>
                {summary.improvement.sleep !== 0 && (
                  <span
                    className={`ml-2 flex items-center text-xs ${
                      summary.improvement.sleep > 0 ? 'text-green-500' : 'text-red-500'
`}
                  >
                    {summary.improvement.sleep > 0 ? (
                      <Icons.ArrowUpIcon className="mr-0.5 h-3 w-3" />
                    ) : (
                      <Icons.ArrowDownIcon className="mr-0.5 h-3 w-3" />
                    )}
                    {Math.abs(summary.improvement.sleep)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, (summary.thisWeekProgress.sleep / 8) * 100)}%`,
/>
            </div>
          </div>
        </div>
      </div>
    </div>
