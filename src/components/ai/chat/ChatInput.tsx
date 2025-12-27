import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AI_MODELS, AIModel } from './types';
import { Check, ChevronDown } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  postCount: string;
  onPostCountChange: (count: string) => void;
}

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  isGenerating,
  selectedModel,
  onModelChange,
  postCount,
  onPostCountChange,
}: ChatInputProps) => {
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handlePostCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string or numbers 1-10
    if (val === '' || (/^\d+$/.test(val) && parseInt(val) >= 0 && parseInt(val) <= 10)) {
      onPostCountChange(val);
    }
  };

  // Auto-resize textarea based on content, max 35% of viewport height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Calculate max height (35% of viewport)
    const maxHeight = window.innerHeight * 0.35;
    const minHeight = 44;
    
    // Only auto-resize if there's content
    if (value.trim()) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    } else {
      // Reset to minimum height when empty
      textarea.style.height = `${minHeight}px`;
    }
  }, [value]);

  return (
    <div className="border-t border-border bg-background/50">
      {/* Input */}
      <div className="p-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={postCount && parseInt(postCount) > 0 ? "Describe what to generate..." : "Chat with AI..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] resize-none bg-muted/30 border-border text-sm pr-10 overflow-y-auto"
            style={{ maxHeight: '35vh' }}
            rows={1}
          />
          <motion.div
            className="absolute right-2 bottom-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={onSubmit}
              disabled={!value.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-3 pb-2 flex items-center gap-2">
        {/* Model Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>{currentModel?.shortName}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Select Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AI_MODELS.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{model.name}</span>
                    {model.badge && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full',
                          model.badge === 'Recommended'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent text-accent-foreground'
                        )}
                      >
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </div>
                {selectedModel === model.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Post Count Input */}
        <div className="flex items-center gap-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={postCount}
            onChange={handlePostCountChange}
            className="h-6 w-10 px-1.5 text-xs text-center bg-muted/30 border-border"
          />
          <span className="text-xs text-muted-foreground">posts</span>
        </div>
      </div>
    </div>
  );
};
