import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 bg-card flex flex-col z-10"
    >
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Agent Info
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">P</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Plingo AI</p>
              <p className="text-xs text-muted-foreground">Professional Content Strategist</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
            <p className="font-medium text-foreground text-sm">Goal</p>
            <p>Generate high-quality, platform-aware posts that are relevant, factual, concise, engaging, and ready to publish.</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
            <p className="font-medium text-foreground text-sm">Writing Style</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Clear, professional human tone</li>
              <li>No fantasy, magic, or poetic language</li>
              <li>No cringe motivational phrases</li>
              <li>No filler like "Ah user," "Behold," etc.</li>
              <li>Clarity over drama</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
            <p className="font-medium text-foreground text-sm">Content Rules</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Relevant to user's topic</li>
              <li>Based on real trends</li>
              <li>No fake claims or hallucinated data</li>
              <li>Platform-aware (Twitter 280 chars, etc.)</li>
              <li>Hashtags: relevant & limited (1-2 max)</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
            <p className="font-medium text-foreground text-sm">Interaction</p>
            <p>Short, crisp, useful. No emojis unless requested.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
