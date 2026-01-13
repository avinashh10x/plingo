import {
  Plus,
  Moon,
  Sun,
  Menu,
  LayoutDashboard,
  Wand2,
  Calendar as CalendarIcon,
  FileText,
  Link2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const mobileNavItems = [
  { title: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Studio", icon: Wand2, path: "/dashboard/studio" },
  { title: "Calendar", icon: CalendarIcon, path: "/dashboard/calendar" },
  { title: "Drafts", icon: FileText, path: "/dashboard/drafts" },
  { title: "Accounts", icon: Link2, path: "/dashboard/accounts" },
];

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  if (isMobile) {
    return (
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo2.png" alt="Plingo" className="h-8 w-8" />
          <span className="font-bold text-lg">Plingo</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(active && "bg-primary/10 text-primary")}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.title}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/admin")}>
              Admin Panel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }

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
