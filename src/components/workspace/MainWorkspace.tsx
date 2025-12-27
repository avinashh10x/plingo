import { Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { TweetEditor } from '@/components/editor/TweetEditor';
import { FeedPanel } from '@/components/feed/FeedPanel';
import { AnimatedTwitterIcon, AnimatedLinkedInIcon } from '@/components/ui/animated-icon';

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 5 },
};

const TabButton = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    className={cn('tab-item flex items-center gap-2', active && 'active')}
    whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
    whileTap={{ scale: 0.98 }}
  >
    {icon}
    <span className="hidden sm:inline">{children}</span>
  </motion.button>
);

export const MainWorkspace = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-card">
        <TabButton
          active={activeTab === 'twitter'}
          onClick={() => setActiveTab('twitter')}
          icon={<AnimatedTwitterIcon />}
        >
          Twitter
        </TabButton>
        <TabButton
          active={activeTab === 'linkedin'}
          onClick={() => setActiveTab('linkedin')}
          icon={<AnimatedLinkedInIcon />}
        >
          LinkedIn
        </TabButton>
        <div className="flex-1" />
        <TabButton
          active={activeTab === 'editor'}
          onClick={() => setActiveTab('editor')}
          icon={
            <motion.div
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Edit3 className="h-4 w-4" />
            </motion.div>
          }
        >
          Editor
        </TabButton>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'twitter' && <FeedPanel />}
        {activeTab === 'linkedin' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>LinkedIn feed coming soon...</p>
          </div>
        )}
        {activeTab === 'editor' && <TweetEditor />}
      </div>
    </div>
  );
};
