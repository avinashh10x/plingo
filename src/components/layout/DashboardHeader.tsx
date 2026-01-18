import { useState, useEffect, useRef } from "react";
import { CreditsPanel } from "@/components/credits/CreditsPanel";
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
  Coins,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { useCredits } from "@/hooks/useCredits";
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

// Animated credit number component
const AnimatedCredits = ({ value }: { value: number | null }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animation, setAnimation] = useState<"up" | "down" | null>(null);
  const prevValueRef = useRef<number | null>(value);

  useEffect(() => {
    if (
      value !== null &&
      prevValueRef.current !== null &&
      value !== prevValueRef.current
    ) {
      // Determine animation direction
      if (value > prevValueRef.current) {
        setAnimation("up"); // Increment - scroll from bottom
      } else {
        setAnimation("down"); // Decrement - scroll from top
      }

      // Update display after short delay to show animation
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimation(null);
      }, 200);

      prevValueRef.current = value;
      return () => clearTimeout(timer);
    } else if (value !== null) {
      setDisplayValue(value);
      prevValueRef.current = value;
    }
  }, [value]);

  if (displayValue === null) {
    return <span>...</span>;
  }

  return (
    <span className="relative inline-flex overflow-hidden h-5">
      <span
        className={cn(
          "transition-all duration-300 ease-out",
          animation === "up" && "animate-slide-up",
          animation === "down" && "animate-slide-down",
        )}
      >
        {displayValue}
      </span>
    </span>
  );
};

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const isMobile = useIsMobile();
  const { credits } = useCredits();

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
          <Link to="/">
            <img src="/logonly.svg" alt="Plingo" className="h-8 w-8" />
          </Link>
          {/* <span className="font-bold text-lg">Plingo</span> */}
        </div>

        <div className="flex items-center gap-2">
          {/* Credits Badge - Mobile */}
          <div className="flex items-center gap-1">
            <CreditsPanel credits={credits}>
              <button className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer outline-none">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  <AnimatedCredits value={credits} />
                </span>
              </button>
            </CreditsPanel>

            <NotificationPanel />
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
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-end px-6">
      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Credits Badge */}
        <CreditsPanel credits={credits}>
          <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer outline-none">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              <AnimatedCredits value={credits} /> Credits
            </span>
          </button>
        </CreditsPanel>

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
