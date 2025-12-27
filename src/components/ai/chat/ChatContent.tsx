import { useEffect, useRef } from 'react';
import { MessageSquare, Copy, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GeneratedPostCard } from './GeneratedPostCard';
import { GeneratedPost } from './types';

interface ChatContentProps {
  generatedItems: GeneratedPost[];
  onCopy: (content: string) => void;
  onAddToEditor: (content: string) => void;
  onCopyAll: () => void;
  onAddAllToEditor: () => void;
}

export const ChatContent = ({
  generatedItems,
  onCopy,
  onAddToEditor,
  onCopyAll,
  onAddAllToEditor,
}: ChatContentProps) => {
  const assistantItems = generatedItems.filter(item => !item.isUserMessage);
  const hasAssistantItems = assistantItems.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [generatedItems]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
      <AnimatePresence mode="wait">
        {generatedItems.length > 0 ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Bulk Actions at top - only show if there are assistant messages */}
            {hasAssistantItems && (
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs h-7"
                  onClick={onCopyAll}
                >
                  <Copy className="h-3 w-3" />
                  Copy all
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 text-xs h-7"
                  onClick={onAddAllToEditor}
                >
                  <ListPlus className="h-3 w-3" />
                  Add all
                </Button>
              </div>
            )}

            {/* Chat Messages */}
            {generatedItems.map((item, index) => (
              item.isUserMessage ? (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 overflow-hidden">
                    <p className="text-sm break-words">{item.content}</p>
                  </div>
                </motion.div>
              ) : (
                <GeneratedPostCard
                  key={item.id}
                  content={item.content}
                  index={index}
                  onCopy={onCopy}
                  onAddToEditor={onAddToEditor}
                />
              )
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-center px-6"
          >
            <div className="p-4 rounded-2xl bg-muted/30">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-1">Build with Agent</p>
              <p className="text-sm text-muted-foreground">
                Generate posts with AI. Set your guidelines in settings for better results.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
