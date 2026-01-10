import { Plus, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-end px-6">
      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <NotificationPanel />

        {/* New Post CTA */}
        <Button onClick={() => navigate("/dashboard/studio")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>
    </header>
  );
};
