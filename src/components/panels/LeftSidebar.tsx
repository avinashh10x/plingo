import { useAppStore } from '@/stores/appStore';
import { QueuePanel } from './QueuePanel';
import { CalendarPanel } from './CalendarPanel';
import { PlatformsPanel } from './PlatformsPanel';

export const LeftSidebar = () => {
  const { activeLeftPanel } = useAppStore();

  return (
    <div className="h-full bg-card border-r border-border">
      {activeLeftPanel === 'queue' && <QueuePanel />}
      {activeLeftPanel === 'calendar' && <CalendarPanel />}
      {activeLeftPanel === 'platforms' && <PlatformsPanel />}
    </div>
  );
};
