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
      transition={{ delay: index * 0.05 }}
      className="group p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors"
    >
      <p className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">{content}</p>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 gap-1 text-xs"
          onClick={() => onCopy(content)}
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        <Button
          size="sm"
          className="h-6 px-2 gap-1 text-xs"
          onClick={() => onAddToEditor(content)}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
    </motion.div>
  );
};
