import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, X, Send, Calendar, Loader2 } from 'lucide-react';
import { useAppStore, Platform, EditorPost } from '@/stores/appStore';
import { usePosts } from '@/hooks/usePosts';
import { usePlatforms } from '@/hooks/usePlatforms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { AnimatedTwitterIcon, AnimatedLinkedInIcon } from '@/components/ui/animated-icon';
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

const MAX_CHARS = 280;

const PlatformIcon = ({ platform, selected, onClick }: { 
  platform: Platform; 
  selected: boolean; 
  onClick: () => void;
}) => {
  const icons = {
    twitter: <AnimatedTwitterIcon className="h-4 w-4" />,
    linkedin: <AnimatedLinkedInIcon className="h-4 w-4" />,
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        selected
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={platform}
    >
      {icons[platform as 'twitter' | 'linkedin']}
    </motion.button>
  );
};

interface CompactEditorCardProps {
  post: EditorPost;
  onScheduleClick: (postId: string) => void;
  selectedCount: number;
  isDragging?: boolean;
  isActive?: boolean;
  onFocus?: (postId: string) => void;
  onBlur?: () => void;
}

export const CompactEditorCard = ({ post, onScheduleClick, selectedCount, isDragging: parentDragging, isActive, onFocus, onBlur }: CompactEditorCardProps) => {
  const {
    editorPosts,
    updateEditorPost,
    removeEditorPost,
    toggleEditorPostSelection,
    clearEditorPosts,
  } = useAppStore();

  const { createPost, schedulePost, publishNow } = usePosts();
  const { isConnected } = usePlatforms();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const plainText = post.content.replace(/<[^>]*>/g, '').trim();
  const charCount = plainText.length;
  const hasContent = charCount > 0;
  const availablePlatforms: Platform[] = ['twitter', 'linkedin'];

  const togglePlatform = (platform: Platform) => {
    const currentPlatforms = post.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    if (newPlatforms.length > 0) {
      updateEditorPost(post.id, { platforms: newPlatforms });
    }
  };

  const handleDeleteClick = () => {
    if (hasContent) {
      setShowDeleteDialog(true);
    } else {
      removeEditorPost(post.id);
    }
  };

  const handleConfirmDelete = () => {
    removeEditorPost(post.id);
    setShowDeleteDialog(false);
  };

  const handlePostNow = async () => {
    if (!plainText) {
      toast({ title: 'Cannot post', description: 'Please enter some content first.', variant: 'destructive' });
      return;
    }

    const platforms = post.platforms || ['twitter'];
    const connectedPlatform = platforms.find(p => isConnected(p));
    
    if (!connectedPlatform) {
      toast({ title: 'No connected platform', description: 'Please connect a platform first.', variant: 'destructive' });
      return;
    }

    setIsPosting(true);
    try {
      const newPost = await createPost(post.content, platforms as any);
      if (newPost) {
        await publishNow(newPost.id, connectedPlatform as any);
        if (editorPosts.length === 1) {
          clearEditorPosts();
        } else {
          removeEditorPost(post.id);
        }
      }
    } catch (error) {
      console.error('Post error:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (!plainText) {
      toast({ title: 'Cannot schedule', description: 'Please enter some content first.', variant: 'destructive' });
      return;
    }

    if (!selectedDate) {
      toast({ title: 'Select a date', description: 'Please pick a date and time for scheduling.', variant: 'destructive' });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    setIsScheduling(true);
    try {
      const platforms = post.platforms || ['twitter'];
      const newPost = await createPost(post.content, platforms as any);
      
      if (newPost) {
        const ok = await schedulePost(newPost.id, scheduledAt, platforms as any);
        if (!ok) return;

        if (editorPosts.length === 1) {
          clearEditorPosts();
        } else {
          removeEditorPost(post.id);
        }
        setSelectedDate(undefined);
      }
    } catch (error) {
      console.error('Schedule error:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleScheduleButtonClick = () => {
    if (selectedCount >= 2 && post.selected) {
      onScheduleClick(post.id);
    }
  };

  const isCurrentlyDragging = isDragging || parentDragging;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative bg-card border border-border rounded-lg p-3 transition-all duration-200",
          isCurrentlyDragging && "opacity-90 shadow-xl ring-2 ring-primary/50",
          post.selected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
        )}
      >
        {/* Left side: drag + checkbox */}
        <div className="flex gap-2">
          <div className="flex flex-col items-center gap-1 pt-1">
            <Checkbox
              checked={post.selected}
              onCheckedChange={() => toggleEditorPostSelection(post.id)}
              className="h-4 w-4"
            />
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted transition-colors opacity-50 hover:opacity-100"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Textarea */}
            <Textarea
              value={post.content.replace(/<[^>]*>/g, '')}
              onChange={(e) => updateEditorPost(post.id, { content: e.target.value })}
              onFocus={() => onFocus?.(post.id)}
              onBlur={onBlur}
              placeholder="What's on your mind?"
              className="min-h-[80px] max-h-[400px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50 overflow-hidden"
              style={{ height: 'auto', fieldSizing: 'content' } as React.CSSProperties}
            />

            {/* Bottom row: platforms + char count + actions */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              {/* Left: platforms + char count */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {availablePlatforms.map((platform) => (
                    <PlatformIcon
                      key={platform}
                      platform={platform}
                      selected={post.platforms?.includes(platform) || false}
                      onClick={() => togglePlatform(platform)}
                    />
                  ))}
                </div>
                <span className={cn(
                  "text-xs tabular-nums",
                  charCount > MAX_CHARS ? "text-destructive" : 
                  charCount > MAX_CHARS * 0.9 ? "text-amber-500" : 
                  "text-muted-foreground"
                )}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-1.5">
                {editorPosts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={handleDeleteClick}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}

                {selectedCount >= 2 && post.selected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScheduleButtonClick}
                    className="h-7 text-xs px-2"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Bulk ({selectedCount})
                  </Button>
                ) : (
                  <DateTimePicker
                    date={selectedDate}
                    time={selectedTime}
                    onDateChange={setSelectedDate}
                    onTimeChange={setSelectedTime}
                    onConfirm={handleSchedule}
                    triggerLabel={isScheduling ? "..." : undefined}
                    compact
                  />
                )}

                <Button
                  size="sm"
                  onClick={handlePostNow}
                  disabled={isPosting || !hasContent}
                  className="h-7 text-xs px-2.5 gap-1"
                >
                  {isPosting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This post has content. Are you sure you want to delete it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
