import { Send, Loader2, ChevronDown, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AI_MODELS } from "./types";
import { useRef, useEffect } from "react";

interface CompactChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  postCount: string;
  onPostCountChange: (count: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
}

const TONES = [
  {
    id: "professional",
    label: "Professional",
    desc: "Polished & business-appropriate",
  },
  { id: "casual", label: "Casual", desc: "Relaxed & conversational" },
  { id: "friendly", label: "Friendly", desc: "Warm & encouraging" },
  { id: "witty", label: "Witty", desc: "Clever & playful" },
  { id: "formal", label: "Formal", desc: "Serious & dignified" },
  {
    id: "inspirational",
    label: "Inspirational",
    desc: "Uplifting & motivating",
  },
];

export const CompactChatInput = ({
  value,
  onChange,
  onSubmit,
  isGenerating,
  selectedModel,
  onModelChange,
  postCount,
  onPostCountChange,
  tone,
  onToneChange,
}: CompactChatInputProps) => {
  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);
  const currentTone = TONES.find((t) => t.id === tone);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handlePostCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (
      val === "" ||
      (/^\d+$/.test(val) && parseInt(val) >= 0 && parseInt(val) <= 10)
    ) {
      onPostCountChange(val);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const maxHeight = window.innerHeight * 0.3;
    const minHeight = 40;

    if (value.trim()) {
      textarea.style.height = "auto";
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );
      textarea.style.height = `${newHeight}px`;
    } else {
      textarea.style.height = `${minHeight}px`;
    }
  }, [value]);

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm shrink-0">
      {/* Input area */}
      <div className="p-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={
              postCount && parseInt(postCount) > 0
                ? "What should Buggy write about?"
                : "Chat with Buggy..."
            }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] resize-none bg-muted/30 border-border text-sm pr-9 overflow-y-auto py-2"
            style={{ maxHeight: "30vh" }}
            rows={1}
          />
          <motion.div
            className="absolute right-1.5 bottom-1.5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onSubmit}
              disabled={!value.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Controls bar - Model, Posts, Tone */}
      <div className="px-2 pb-2 flex items-center gap-1.5 flex-wrap">
        {/* Model Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-5 px-1.5 gap-0.5 text-[10px] bg-muted/30"
            >
              <span>{currentModel?.icon || "⚡"}</span>
              <span>{currentModel?.shortName || "Nova"}</span>
              <ChevronDown className="h-2.5 w-2.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel className="text-[10px]">
              AI Model
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AI_MODELS.map((m) => (
              <DropdownMenuItem
                key={m.id}
                onClick={() => onModelChange(m.id)}
                className="flex flex-col items-start py-1.5"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <span>{m.icon}</span>
                    {m.name}
                    {m.badge && (
                      <span
                        className={cn(
                          "text-[8px] px-1 py-0.5 rounded",
                          m.badge === "Fast" &&
                            "bg-green-500/20 text-green-500",
                          m.badge === "Creative" &&
                            "bg-purple-500/20 text-purple-500"
                        )}
                      >
                        {m.badge}
                      </span>
                    )}
                  </span>
                  {selectedModel === m.id && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {m.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Post Count */}
        <div className="flex items-center gap-0.5">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={postCount}
            onChange={handlePostCountChange}
            className="h-5 w-8 px-1 text-[10px] text-center bg-muted/30 border-border"
          />
          <span className="text-[10px] text-muted-foreground">posts</span>
        </div>

        {/* Tone Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-5 px-1.5 gap-0.5 text-[10px] bg-muted/30"
            >
              <span>{currentTone?.label || "Tone"}</span>
              <ChevronDown className="h-2.5 w-2.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-[10px]">
              Writing Tone
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {TONES.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onToneChange(t.id)}
                className="flex flex-col items-start py-1.5"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium">{t.label}</span>
                  {tone === t.id && <Check className="h-3 w-3 text-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {t.desc}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
