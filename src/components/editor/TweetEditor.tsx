import { useState, useCallback } from 'react';
import { Plus, CheckSquare, Square, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { SortableEditorCard } from './SortableEditorCard';
import { BulkSchedulerModal } from './BulkSchedulerModal';
import { cn } from '@/lib/utils';

export const TweetEditor = () => {
  const {
    editorPosts,
    addEditorPost,
    reorderEditorPosts,
    selectAllEditorPosts,
    deselectAllEditorPosts,
    getSelectedEditorPosts,
  } = useAppStore();

  const [bulkSchedulerOpen, setBulkSchedulerOpen] = useState(false);

  const selectedPosts = getSelectedEditorPosts();
  const selectedCount = selectedPosts.length;
  const allSelected = selectedCount === editorPosts.length && editorPosts.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editorPosts.findIndex((post) => post.id === active.id);
      const newIndex = editorPosts.findIndex((post) => post.id === over.id);
      
      const newPosts = arrayMove(editorPosts, oldIndex, newIndex);
      reorderEditorPosts(newPosts);
    }
  }, [editorPosts, reorderEditorPosts]);

  const handleToggleSelectAll = () => {
    if (allSelected) {
      deselectAllEditorPosts();
    } else {
      selectAllEditorPosts();
    }
  };

  const handleBulkScheduleClick = () => {
    if (selectedCount >= 2) {
      setBulkSchedulerOpen(true);
    }
  };

  const handleScheduleClick = (postId: string) => {
    // This is called from individual cards when bulk mode is active
    setBulkSchedulerOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Selection Toolbar */}
      {editorPosts.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSelectAll}
              className="gap-2"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{allSelected ? 'Deselect All' : 'Select All'}</span>
            </Button>
            
            {selectedCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
            )}
          </div>

          {selectedCount >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                size="sm"
                onClick={handleBulkScheduleClick}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Bulk Schedule</span> ({selectedCount})
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Editor Cards */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={editorPosts.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {editorPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <SortableEditorCard
                    post={post}
                    onScheduleClick={handleScheduleClick}
                    selectedCount={selectedCount}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            variant="outline"
            className="w-full border-dashed gap-2"
            onClick={addEditorPost}
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Plus className="h-4 w-4" />
            </motion.div>
            <span className="hidden sm:inline">Add Another Post</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </motion.div>
      </div>

      {/* Bulk Scheduler Modal */}
      <BulkSchedulerModal
        open={bulkSchedulerOpen}
        onOpenChange={setBulkSchedulerOpen}
        selectedPosts={selectedPosts}
      />
    </div>
  );
};
