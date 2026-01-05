import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { usePosts } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { cn, htmlToPlainText } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    instagram: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center w-5 h-5 rounded text-xs',
      platform === 'twitter' && 'bg-twitter text-white',
      platform === 'linkedin' && 'bg-linkedin text-white',
      platform === 'instagram' && 'bg-instagram text-white',
    )}>
      {icons[platform] || platform[0].toUpperCase()}
    </span>
  );
};

export const CalendarPanel = () => {
  const { selectedDate, setSelectedDate } = useAppStore();
  const { scheduledPosts, isLoading } = usePosts();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const postsOnDate = useMemo(() => {
    return scheduledPosts.filter((post) =>
      post.scheduled_at && isSameDay(new Date(post.scheduled_at), selectedDate)
    );
  }, [scheduledPosts, selectedDate]);

  const hasPostsOnDay = (day: Date) => {
    return scheduledPosts.some((post) =>
      post.scheduled_at && isSameDay(new Date(post.scheduled_at), day)
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Calendar
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Calendar
        </span>
      </div>

      <div className="p-3">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="h-7 flex items-center justify-center text-xs text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const hasPosts = hasPostsOnDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'calendar-day',
                  !isCurrentMonth && 'text-muted-foreground/50',
                  hasPosts && !isSelected && 'has-posts',
                  isSelected && 'selected'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts on selected date */}
      <div className="flex-1 border-t border-border overflow-y-auto panel-scroll">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>

        <div className="p-3 space-y-2">
          {postsOnDate.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No posts scheduled for this day
            </p>
          ) : (
            postsOnDate.map((post) => {
              const platforms = post.platforms || [];
              const primaryPlatform = platforms[0] || 'twitter';
              
              return (
                <div
                  key={post.id}
                  className="p-3 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PlatformIcon platform={primaryPlatform} />
                    <span className="text-xs font-medium capitalize">
                      {primaryPlatform}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded status-scheduled">
                      scheduled
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-3">
                    {htmlToPlainText(post.content)}
                  </p>
                  {post.scheduled_at && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(post.scheduled_at), 'h:mm a')}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
