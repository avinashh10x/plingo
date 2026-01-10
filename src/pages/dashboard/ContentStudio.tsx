import { useState, useEffect } from "react";
import { TweetEditor } from "@/components/editor/TweetEditor";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { StudioAIPanel } from "@/components/ai/StudioAIPanel";
import { useIsMobile } from "@/hooks/use-mobile";

export const ContentStudio = () => {
  const isMobile = useIsMobile();
  // Open AI panel by default on larger screens (laptop/desktop)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsAIPanelOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="flex flex-col h-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <h1 className="text-sm font-medium text-foreground">Content Studio</h1>
        <Button
          onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
          variant={isAIPanelOpen ? "ghost" : "default"}
          size="sm"
          className="h-7 gap-1.5 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isAIPanelOpen ? "Hide AI" : "AI Assistant"}
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {isMobile ? (
          // Mobile Layout
          <div className="h-full relative">
            <div className={`h-full ${isAIPanelOpen ? "hidden" : "block"}`}>
              <TweetEditor />
            </div>
            {isAIPanelOpen && (
              <div className="absolute inset-0 z-10 bg-background">
                <StudioAIPanel />
              </div>
            )}
          </div>
        ) : // Desktop Layout
        isAIPanelOpen ? (
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full bg-background"
          >
            <ResizablePanel defaultSize={60} minSize={35}>
              <div className="h-full overflow-hidden bg-background">
                <TweetEditor />
              </div>
            </ResizablePanel>
            <ResizableHandle
              withHandle
              className="bg-border/50 hover:bg-primary/20 transition-colors w-1"
            />
            <ResizablePanel defaultSize={40} minSize={25}>
              <div className="h-full bg-background border-l border-border flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <StudioAIPanel />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full overflow-hidden bg-background">
            <TweetEditor />
          </div>
        )}
      </div>
    </div>
  );
};
