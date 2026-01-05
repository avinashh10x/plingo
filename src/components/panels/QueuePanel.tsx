import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MoreHorizontal, Trash2, Edit, Clock, ListTodo, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore, Platform } from '@/stores/appStore';
import { usePosts, Post, PlatformType } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { DateTimePickerContent } from '@/components/ui/date-time-picker';
import { cn, htmlToPlainText } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { AnimatedTwitterIcon, AnimatedLinkedInIcon, AnimatedInstagramIcon } from '@/components/ui/animated-icon';
import { toast } from '@/hooks/use-toast';

const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, React.ReactNode> = {
    twitter: <AnimatedTwitterIcon className="h-3.5 w-3.5" />,
    linkedin: <AnimatedLinkedInIcon className="h-3.5 w-3.5" />,
    instagram: <AnimatedInstagramIcon className="h-3.5 w-3.5" />,
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center w-5 h-5 rounded text-xs font-medium',
      platform === 'twitter' && 'bg-twitter text-white',
      platform === 'linkedin' && 'bg-linkedin text-white',
      platform === 'instagram' && 'bg-instagram text-white',
    )}>
      {icons[platform] || platform[0].toUpperCase()}
    </span>
  );
};

const iconHoverVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.15, rotate: 5 },
};

export const QueuePanel = () => {
  const { addEditorPostWithData, setActiveTab } = useAppStore();
  const { scheduledPosts, isLoading, deletePost, schedulePost } = usePosts();
  const [, setSearchParams] = useSearchParams();
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  
  // Reschedule state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [postToReschedule, setPostToReschedule] = useState<Post | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState('12:00');

  const sortedPosts = [...scheduledPosts].sort(
    (a, b) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime()
  );

  const handleEdit = (post: Post) => {
    const platforms = (post.platforms || []) as Platform[];
    addEditorPostWithData(post.content, platforms.length > 0 ? platforms : ['twitter']);
    setActiveTab('editor');
    setSearchParams({ tab: 'editor' }, { replace: true });
    deletePost(post.id);
    toast({
      title: 'Post moved to editor',
      description: 'You can now edit and reschedule this post.',
    });
  };

  const handleRescheduleOpen = (post: Post) => {
    setPostToReschedule(post);
    if (post.scheduled_at) {
      setRescheduleDate(new Date(post.scheduled_at));
      setRescheduleTime(format(new Date(post.scheduled_at), 'HH:mm'));
    } else {
      setRescheduleDate(new Date());
      setRescheduleTime('12:00');
    }
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !postToReschedule) return;

    const [hours, minutes] = rescheduleTime.split(':').map(Number);
    const newScheduledAt = new Date(rescheduleDate);
    newScheduledAt.setHours(hours, minutes, 0, 0);

    await schedulePost(postToReschedule.id, newScheduledAt);
    setRescheduleDialogOpen(false);
    setPostToReschedule(null);
  };

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (postToDelete) {
      await deletePost(postToDelete.id);
      toast({
        title: 'Post deleted',
        description: 'The scheduled post has been removed.',
      });
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scheduled Posts
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scheduled Posts
          </span>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary text-primary-foreground rounded">
            {scheduledPosts.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {sortedPosts.map((post) => {
          const platforms = post.platforms || [];
          
          return (
            <motion.div 
              key={post.id} 
              className="queue-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
            >
              <div className="flex gap-2">
                {/* Platform icons column */}
                <div className="flex flex-col gap-1 shrink-0">
                  {platforms.map((platform) => (
                    <PlatformIcon key={platform} platform={platform} />
                  ))}
                </div>
                
                {/* Content column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.scheduled_at && (
                      <span className="text-xs text-muted-foreground">
                        in {formatDistanceToNow(new Date(post.scheduled_at))}
                      </span>
                    )}
                    <span className="status-scheduled text-[10px] px-1.5 py-0.5 rounded">
                      scheduled
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {htmlToPlainText(post.content)}
                  </p>
                  {post.scheduled_at && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                        <Clock className="h-3 w-3" />
                      </motion.div>
                      <span>{format(new Date(post.scheduled_at), 'MMM d, h:mm a')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover="hover" initial="initial">
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <motion.div variants={iconHoverVariants} transition={{ type: 'spring', stiffness: 400 }}>
                          <MoreHorizontal className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => handleEdit(post)}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => handleRescheduleOpen(post)}>
                      <Clock className="h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive gap-2"
                      onClick={() => handleDeleteClick(post)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })}

        {scheduledPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ListTodo className="h-8 w-8 text-muted-foreground mb-2" />
            </motion.div>
            <p className="text-sm text-muted-foreground">No scheduled posts</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a post in the Editor tab
            </p>
          </div>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="w-auto p-0 max-w-fit">
          <DateTimePickerContent
            date={rescheduleDate}
            time={rescheduleTime}
            onDateChange={setRescheduleDate}
            onTimeChange={setRescheduleTime}
            onConfirm={handleRescheduleConfirm}
            confirmLabel="Reschedule"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your scheduled post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {postToDelete && (
            <div className="p-3 bg-muted rounded-lg my-2">
              <p className="text-sm text-foreground line-clamp-3">{htmlToPlainText(postToDelete.content)}</p>
              {postToDelete.scheduled_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Scheduled for {format(new Date(postToDelete.scheduled_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
