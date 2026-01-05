import { cn } from '@/lib/utils';
import { getPlatformLimit } from '@/lib/constants';

interface UsageBarProps {
  postsUsed: number;
  platform: string;
  className?: string;
  showLabel?: boolean;
}

export function UsageBar({ postsUsed, platform, className, showLabel = true }: UsageBarProps) {
  const limit = getPlatformLimit(platform);
  const percentage = Math.min(100, (postsUsed / limit) * 100);
  const remaining = Math.max(0, limit - postsUsed);
  
  // Determine color based on usage
  const getBarColor = () => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">
            Posts this month
          </span>
          <span className={cn('font-medium', getTextColor())}>
            {postsUsed}/{limit}
          </span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            getBarColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 100 && (
        <p className="text-xs text-destructive mt-1">
          Limit exceeded! Upgrade to post more.
        </p>
      )}
    </div>
  );
}
