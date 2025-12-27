import { MessageCircle, Loader2, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AnimatedTwitterIcon } from '@/components/ui/animated-icon';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePosts } from '@/hooks/usePosts';

const POSTS_PER_PAGE = 10;

const PlatformIcon = () => (
  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-twitter text-white shrink-0">
    <AnimatedTwitterIcon className="h-5 w-5" />
  </span>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    draft: { icon: Clock, label: 'Draft', className: 'bg-muted text-muted-foreground' },
    scheduled: { icon: Clock, label: 'Scheduled', className: 'bg-warning/10 text-warning border-warning/20' },
    posting: { icon: Send, label: 'Posting', className: 'bg-primary/10 text-primary border-primary/20' },
    posted: { icon: CheckCircle2, label: 'Posted', className: 'bg-success/10 text-success border-success/20' },
    failed: { icon: AlertCircle, label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn("text-xs py-0 px-1.5", config.className)}>
      <Icon className="h-3 w-3" />
    </Badge>
  );
};

// Strip HTML tags for display
const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const FeedPanel = () => {
  const { posts, isLoading } = usePosts();
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  // Filter posts that have twitter in their platforms
  const twitterPosts = posts.filter(post => 
    post.platforms?.includes('twitter')
  ).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const displayedPosts = twitterPosts.slice(0, displayCount);
  const hasMore = displayCount < twitterPosts.length;

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + POSTS_PER_PAGE, twitterPosts.length));
      loadingMoreRef.current = false;
    }, 300);
  }, [hasMore, twitterPosts.length]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setDisplayCount(POSTS_PER_PAGE);
  }, [posts.length]);

  if (isLoading) {
    return (
      <div className="feed-container">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (twitterPosts.length === 0) {
    return (
      <div className="feed-container">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 mb-4 inline-block">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No posts yet</p>
            <p className="text-xs text-muted-foreground">
              Create your first Twitter post to see it here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <span className="text-sm text-muted-foreground">
          {twitterPosts.length} posts
        </span>
      </div>
      <div 
        ref={scrollRef}
        className="feed-content scrollbar-hide"
      >
        {displayedPosts.map((post) => (
          <div key={post.id} className="feed-post">
            <div className="feed-post-inner">
              <PlatformIcon />
              <div className="feed-post-content">
                <div className="feed-post-meta">
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(post.created_at), 'MMM d, h:mm a')}
                  </span>
                  <StatusBadge status={post.status} />
                  {post.scheduled_at && post.status === 'scheduled' && (
                    <span className="text-xs text-muted-foreground">
                      → {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>
                <p className="feed-post-text text-foreground">
                  {stripHtml(post.content)}
                </p>
                {post.error_message && (
                  <p className="text-xs text-destructive mt-2">
                    Error: {post.error_message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};