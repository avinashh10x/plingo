import { useEffect, useRef } from 'react';
import { Sparkles, Copy, ListPlus, Bug, Plus, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GeneratedPostCard } from './GeneratedPostCard';
import { GeneratedPost } from './types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquare } from 'lucide-react';

interface ChatContentProps {
  generatedItems: GeneratedPost[];
  onCopy: (content: string) => void;
  onAddToEditor: (content: string) => void;
  onCopyAll: () => void;
  onAddAllToEditor: () => void;
  // Header props
  onNewChat: () => void;
  chats: Array<{ id: string; title: string; updated_at: string }>;
  currentChatId: string | null;
  isLoading: boolean;
  onSelectChat: (id: string) => void;
}

export const ChatContent = ({
  generatedItems,
  onCopy,
  onAddToEditor,
  onCopyAll,
  onAddAllToEditor,
  onNewChat,
  chats,
  currentChatId,
  isLoading,
  onSelectChat,
}: ChatContentProps) => {
  const assistantItems = generatedItems.filter(item => !item.isUserMessage);
  const hasAssistantItems = assistantItems.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [generatedItems]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header with Buggy branding and actions - at top */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Bug className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium">Buggy</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onNewChat}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">New Chat</TooltipContent>
          </Tooltip>

          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <History className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">History</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  Chat History
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {chats.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No chat history yet
                  </p>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={cn(
                        "w-full p-2 rounded-md text-left transition-colors text-xs",
                        chat.id === currentChatId
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{chat.title}</span>
                        {chat.id === currentChatId && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(chat.updated_at), 'MMM d, h:mm a')}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {generatedItems.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 space-y-2"
            >
              {/* Messages */}
              {generatedItems.map((item, index) => (
                item.isUserMessage ? (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] bg-primary text-primary-foreground rounded-xl rounded-br-sm px-3 py-2">
                      <p className="text-xs break-words">{item.content}</p>
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
              className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-8"
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Buggy - Content Specialist</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate engaging posts for any topic
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions - at bottom, above input */}
      {hasAssistantItems && (
        <div className="flex gap-1.5 px-3 py-2 border-t border-border bg-muted/20 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 gap-1 text-xs"
            onClick={onCopyAll}
          >
            <Copy className="h-3 w-3" />
            Copy all
          </Button>
          <Button
            size="sm"
            className="flex-1 h-7 gap-1 text-xs"
            onClick={onAddAllToEditor}
          >
            <ListPlus className="h-3 w-3" />
            Add all
          </Button>
        </div>
      )}
    </div>
  );
};