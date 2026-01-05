import { Copy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface GeneratedPostCardProps {
  content: string;
  index: number;
  onCopy: (content: string) => void;
  onAddToEditor: (content: string) => void;
}

export const GeneratedPostCard = ({
  content,
  index,
  onCopy,
  onAddToEditor,
}: GeneratedPostCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group p-2.5 bg-muted/40 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
    >
      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-hidden">{content}</p>
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 gap-0.5 text-[10px]"
          onClick={() => onCopy(content)}
        >
          <Copy className="h-2.5 w-2.5" />
          Copy
        </Button>
        <Button
          size="sm"
          className="h-5 px-1.5 gap-0.5 text-[10px]"
          onClick={() => onAddToEditor(content)}
        >
          <Plus className="h-2.5 w-2.5" />
          Add
        </Button>
      </div>
    </motion.div>
  );
};
