import { useEffect, useRef } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Header } from '@/components/layout/Header';
import { ActivityBar } from '@/components/layout/ActivityBar';
import { LeftSidebar } from '@/components/panels/LeftSidebar';
import { MainWorkspace } from '@/components/workspace/MainWorkspace';
import { RightSidebar } from '@/components/panels/RightSidebar';
import { useAppStore } from '@/stores/appStore';
import { useIsMobile } from '@/hooks/use-mobile';

type TabType = 'twitter' | 'linkedin' | 'editor';

const validTabs: TabType[] = ['twitter', 'linkedin', 'editor'];

const Dashboard = () => {
  const { theme, activeTab, setActiveTab, isAIPanelOpen, activeLeftPanel, setActiveLeftPanel, setAIPanelOpen } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Default dashboard state when navigating to /dashboard:
  // - Open left panel (platforms)
  // - Open right AI panel
  // - Use Twitter feed as the active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null;

    if (!tabParam) {
      // Only set defaults when the URL doesn't explicitly set a tab
      if (activeTab !== 'twitter') setActiveTab('twitter');
      if (!activeLeftPanel) setActiveLeftPanel('queue');
      if (!isAIPanelOpen) setAIPanelOpen(true);
    }
  }, []);


  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Keep resizable layout stable and avoid inverse-drag issues when panels are toggled
  useEffect(() => {
    if (activeLeftPanel) leftPanelRef.current?.expand();
    else leftPanelRef.current?.collapse();
  }, [activeLeftPanel]);

  useEffect(() => {
    if (isAIPanelOpen) rightPanelRef.current?.expand();
    else rightPanelRef.current?.collapse();
  }, [isAIPanelOpen]);

  // Sync URL query param to store on mount and when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null;
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      // Set initial tab in URL if not present
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, []);

  // Sync store changes to URL
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <ActivityBar />
        
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="dashboard-mobile-main">
            {/* Main workspace - always visible */}
            <MainWorkspace />
            
            {/* Left sidebar overlay */}
            <AnimatePresence>
              {activeLeftPanel && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="dashboard-mobile-overlay"
                >
                  <LeftSidebar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right sidebar overlay */}
            <AnimatePresence>
              {isAIPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="dashboard-mobile-overlay"
                >
                  <RightSidebar />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Desktop Layout - Resizable panels */
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel
              ref={leftPanelRef}
              defaultSize={20}
              minSize={15}
              maxSize={35}
              collapsible
              collapsedSize={0}
              id="left-sidebar"
            >
              {activeLeftPanel ? <LeftSidebar /> : null}
            </ResizablePanel>

            <ResizableHandle withHandle className={activeLeftPanel ? undefined : 'hidden'} />

            <ResizablePanel
              defaultSize={activeLeftPanel ? (isAIPanelOpen ? 55 : 80) : (isAIPanelOpen ? 75 : 100)}
              minSize={40}
              id="main-workspace"
            >
              <MainWorkspace />
            </ResizablePanel>

            <ResizableHandle withHandle className={isAIPanelOpen ? undefined : 'hidden'} />

            <ResizablePanel
              ref={rightPanelRef}
              defaultSize={25}
              minSize={20}
              maxSize={40}
              collapsible
              collapsedSize={0}
              id="right-sidebar"
            >
              {isAIPanelOpen ? <RightSidebar /> : null}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Dashboard;