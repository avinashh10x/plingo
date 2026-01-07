import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const MIN_SIDEBAR_SIZE = 3; // percentage
const MAX_SIDEBAR_SIZE = 25; // percentage
const DEFAULT_SIDEBAR_SIZE = 20; // percentage

export const DashboardLayout = () => {
  const { theme } = useAppStore();
  const [sidebarSize, setSidebarSize] = useState(DEFAULT_SIDEBAR_SIZE);
  const location = useLocation();
  const isStudio = location.pathname.includes("/studio");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Resizable Sidebar */}
        <ResizablePanel
          defaultSize={DEFAULT_SIDEBAR_SIZE}
          minSize={MIN_SIDEBAR_SIZE}
          maxSize={MAX_SIDEBAR_SIZE}
          onResize={setSidebarSize}
          className="min-w-[60px]"
        >
          <AppSidebar isCollapsed={sidebarSize <= 12} />
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle
          withHandle
          className="w-1 bg-transparent hover:bg-primary/20 transition-colors"
        />

        {/* Main area */}
        <ResizablePanel defaultSize={85} minSize={75}>
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <DashboardHeader />

            {/* Page content with proper padding */}
            <main
              className={cn(
                "flex-1 overflow-auto",
                isStudio ? "p-0 overflow-hidden" : "p-6"
              )}
            >
              <div
                className={cn(isStudio ? "h-full w-full" : "max-w-7xl mx-auto")}
              >
                <Outlet />
              </div>
            </main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
