import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, X, Send, Loader2 } from 'lucide-react';
import { useAppStore, Platform, EditorPost } from '@/stores/appStore';
import { usePosts } from '@/hooks/usePosts';
import { usePlatforms } from '@/hooks/usePlatforms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { format } from 'date-fns';
import { AnimatedTwitterIcon, AnimatedLinkedInIcon } from '@/components/ui/animated-icon';
import { RichTextEditor } from './RichTextEditor';
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

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: 10 },
  tap: { scale: 0.9 },
};

const PlatformBadge = ({ platform, selected, onClick }: { 
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
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border',
        selected
          ? 'bg-primary/10 border-primary text-primary'
          : 'bg-muted border-transparent text-muted-foreground hover:text-foreground'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {icons[platform as 'twitter' | 'linkedin']}
      <span className="capitalize">{platform}</span>
    </motion.button>
  );
};

// Helper to strip HTML and get plain text for character counting
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

interface SortableEditorCardProps {
  post: EditorPost;
  onScheduleClick: (postId: string) => void;
  selectedCount: number;
}

export const SortableEditorCard = ({ post, onScheduleClick, selectedCount }: SortableEditorCardProps) => {
  const {
    editorPosts,
    updateEditorPost,
    removeEditorPost,
    toggleEditorPostSelection,
    clearEditorPosts,
  } = useAppStore();

  const { createPost, schedulePost, publishNow } = usePosts();
  const { platforms: connectedPlatforms, isConnected } = usePlatforms();

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

  const hasContent = stripHtml(post.content).trim().length > 0;

  // Get available connected platforms
  const availablePlatforms: Platform[] = ['twitter', 'linkedin'];

  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    const currentPlatforms = post.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    // Ensure at least one platform is selected
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
    const plainText = stripHtml(post.content).trim();
    
    if (!plainText) {
      toast({
        title: 'Cannot post',
        description: 'Please enter some content first.',
        variant: 'destructive',
      });
      return;
    }

    const platforms = post.platforms || ['twitter'];
    const connectedPlatform = platforms.find(p => isConnected(p));
    
    if (!connectedPlatform) {
      toast({
        title: 'No connected platform',
        description: 'Please connect a platform first.',
        variant: 'destructive',
      });
      return;
    }

    setIsPosting(true);

    try {
      // Create the post in the database first
      const newPost = await createPost(post.content, platforms as any);
      
      if (newPost) {
        // Publish immediately
        await publishNow(newPost.id, connectedPlatform as any);
        
        // Remove from editor
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
    const plainText = stripHtml(post.content).trim();
    
    if (!plainText) {
      toast({
        title: 'Cannot schedule',
        description: 'Please enter some content first.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: 'Select a date',
        description: 'Please pick a date and time for scheduling.',
        variant: 'destructive',
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    setIsScheduling(true);

    try {
      const platforms = post.platforms || ['twitter'];
      
      // Create the post in the database
      const newPost = await createPost(post.content, platforms as any);
      
      if (newPost) {
        // Schedule it
        const ok = await schedulePost(newPost.id, scheduledAt, platforms as any);

        if (!ok) return;

        // Remove from editor
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
    // If multiple posts are selected and this post is one of them, trigger bulk scheduler
    if (selectedCount >= 2 && post.selected) {
      onScheduleClick(post.id);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "editor-card relative transition-all duration-200",
          isDragging && "opacity-50 scale-[1.02] shadow-lg",
          post.selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Checkbox */}
            <Checkbox
              checked={post.selected}
              onCheckedChange={() => toggleEditorPostSelection(post.id)}
              className="h-5 w-5"
            />
            
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Delete Button */}
          {editorPosts.length > 1 && (
            <motion.div whileHover="hover" whileTap="tap" initial="initial">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleDeleteClick}
              >
                <motion.div variants={iconVariants} transition={{ type: 'spring', stiffness: 400 }}>
                  <X className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Select platforms:</p>
          <div className="flex gap-2">
            {availablePlatforms.map((platform) => (
              <PlatformBadge
                key={platform}
                platform={platform}
                selected={post.platforms?.includes(platform) || false}
                onClick={() => togglePlatform(platform)}
              />
            ))}
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="mb-4">
          <RichTextEditor
            content={post.content}
            onChange={(content) => updateEditorPost(post.id, { content })}
            placeholder="What's happening? Start writing..."
            maxLength={MAX_CHARS}
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-end gap-3">
          {selectedCount >= 2 && post.selected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleButtonClick}
              className="gap-2"
            >
              Bulk Schedule ({selectedCount})
            </Button>
          ) : (
            <DateTimePicker
              date={selectedDate}
              time={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onConfirm={handleSchedule}
              triggerLabel={isScheduling ? "Scheduling..." : "Schedule"}
            />
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              onClick={handlePostNow}
              disabled={isPosting}
              className="gap-2"
            >
              {isPosting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <motion.div
                  whileHover={{ x: 3, rotate: -15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              )}
              {isPosting ? 'Posting...' : 'Post Now'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This post has content. Are you sure you want to delete it? This action cannot be undone.
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
