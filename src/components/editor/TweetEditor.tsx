import { useState, useCallback, useRef } from "react";
import { Plus, CheckSquare, Square, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";
import { CompactEditorCard } from "./CompactEditorCard";
import { BulkSchedulerModal } from "./BulkSchedulerModal";
import { toast } from "@/hooks/use-toast";

const MAX_CARDS = 35;

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
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selectedPosts = getSelectedEditorPosts();
  const selectedCount = selectedPosts.length;
  const allSelected =
    selectedCount === editorPosts.length && editorPosts.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragId = event.active.id as string;
    setDraggingId(dragId);
    setActiveCardId(dragId);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingId(null);
      setActiveCardId(null);
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = editorPosts.findIndex((post) => post.id === active.id);
        const newIndex = editorPosts.findIndex((post) => post.id === over.id);
        reorderEditorPosts(arrayMove(editorPosts, oldIndex, newIndex));
      }
    },
    [editorPosts, reorderEditorPosts],
  );

  const handleCardFocus = useCallback((postId: string) => {
    setActiveCardId(postId);
  }, []);

  const handleCardBlur = useCallback(() => {
    // Only clear if not dragging
    if (!draggingId) {
      setActiveCardId(null);
    }
  }, [draggingId]);

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

  const handleScheduleClick = () => {
    setBulkSchedulerOpen(true);
  };

  const handleIndicatorClick = (index: number) => {
    const postId = editorPosts[index]?.id;
    setActiveCardId(postId);
    const el = cardRefs.current.get(postId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {editorPosts.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSelectAll}
                className="h-7 gap-1.5 text-xs"
              >
                {allSelected ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                {allSelected ? "Deselect" : "Select All"}
              </Button>
              {selectedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCount >= 2 && (
            <Button
              size="sm"
              onClick={handleBulkScheduleClick}
              className="h-7 gap-1.5 text-xs"
            >
              <Calendar className="h-3.5 w-3.5" />
              Bulk Schedule ({selectedCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (editorPosts.length >= MAX_CARDS) {
                toast({
                  title: "Card limit reached",
                  description: `You can have up to ${MAX_CARDS} posts in the workspace.`,
                });
                return;
              }
              addEditorPost();
            }}
            className="h-7 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Card
          </Button>
        </div>
      </div>

      {/* Editor Cards */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={editorPosts.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {editorPosts.map((post) => {
                const isDragging = draggingId === post.id;
                const isActive = activeCardId === post.id || isDragging;

                return (
                  <motion.div
                    key={post.id}
                    data-post-id={post.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(post.id, el);
                      else cardRefs.current.delete(post.id);
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isDragging ? 1.02 : 1,
                      zIndex: isDragging ? 50 : 1,
                    }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{
                      type: "tween",
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                    layout="position"
                    style={{
                      position: "relative",
                    }}
                  >
                    <CompactEditorCard
                      post={post}
                      onScheduleClick={handleScheduleClick}
                      selectedCount={selectedCount}
                      isDragging={isDragging}
                      isActive={isActive}
                      onFocus={handleCardFocus}
                      onBlur={handleCardBlur}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>

      {/* Sequence Indicators */}
      {editorPosts.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 py-3 border-t border-border bg-muted/20 h-10">
          <div className="relative flex items-center gap-2.5">
            {editorPosts.map((post) => {
              const isActive =
                activeCardId === post.id || draggingId === post.id;
              const isDragging = draggingId === post.id;

              return (
                <motion.button
                  key={post.id}
                  onClick={() =>
                    handleIndicatorClick(
                      editorPosts.findIndex((p) => p.id === post.id),
                    )
                  }
                  className={`rounded-full ${
                    isActive
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  style={{ position: "relative" }}
                  animate={{
                    scale: isDragging ? 1.5 : isActive ? 1.3 : 1,
                    zIndex: isDragging ? 20 : isActive ? 10 : 1,
                  }}
                  transition={{
                    type: "tween",
                    duration: 0.15,
                    ease: "easeOut",
                  }}
                  title={`Post ${
                    editorPosts.findIndex((p) => p.id === post.id) + 1
                  }`}
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-inherit" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <BulkSchedulerModal
        open={bulkSchedulerOpen}
        onOpenChange={setBulkSchedulerOpen}
        selectedPosts={selectedPosts}
      />
    </div>
  );
};
