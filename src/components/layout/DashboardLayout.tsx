import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null; // Avoid hydration mismatch

  // Studio needs full height/width without standard padding
  const isStudio = location.pathname.includes("/dashboard/studio");

  if (isMobile) {
    return (
      <div className="flex h-screen bg-background flex-col">
        <DashboardHeader />
        <main
          className={cn(
            "flex-1 overflow-y-auto pb-16",
            isStudio ? "p-0" : "p-4"
          )}
        >
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="hidden md:block"
        >
          <div className="h-full">
            <AppSidebar isCollapsed={isSidebarCollapsed} />
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="hidden md:flex bg-border/50 hover:bg-primary/20 transition-colors w-1"
        />

        <ResizablePanel defaultSize={80}>
          <div className="flex-1 flex flex-col h-full min-w-0">
            <DashboardHeader />
            <main
              className={cn("flex-1 overflow-y-auto", isStudio ? "p-0" : "p-6")}
            >
              <Outlet />
            </main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
