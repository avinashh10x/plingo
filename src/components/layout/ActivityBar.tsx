import { Calendar, ListTodo, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: 5 },
  tap: { scale: 0.95 },
};

export const ActivityBar = () => {
  const { activeLeftPanel, toggleLeftPanel } = useAppStore();

  const items = [
    { id: 'queue' as const, icon: ListTodo, label: 'Queue' },
    { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
    { id: 'platforms' as const, icon: Share2, label: 'Platforms' },
  ];

  return (
    <div className="w-12 bg-activitybar flex flex-col items-center py-2 border-r border-border">
      {items.map((item) => (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => toggleLeftPanel(item.id)}
              className={cn(
                'activity-btn',
                activeLeftPanel === item.id && 'active'
              )}
              whileHover="hover"
              whileTap="tap"
              initial="initial"
            >
              <motion.div variants={iconVariants} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                <item.icon className="h-5 w-5" />
              </motion.div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
