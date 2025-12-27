import {
  Moon,
  Sun,
  MessageSquareText,
  Menu,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 15 },
  tap: { scale: 0.9 },
};

export const Header = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isAIPanelOpen, toggleAIPanel } = useAppStore();
  const { profile, isAuthenticated, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <header className="h-12 bg-card border-b border-border flex items-center justify-between px-1">
      <a href="/">
        <div className="flex items-center gap-1">
          <img
            src="/logo2.png"
            alt="Plingo Logo"
            className="h-10 inline-block"
          />

          <motion.h1
            className="text-xl font-bold text-foreground"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Plingo
          </motion.h1>
        </div>
      </a>
      <div className="flex items-center gap-2">
        {/* AI Panel Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover="hover" whileTap="tap" initial="initial">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAIPanel}
                className={cn(
                  "h-8 w-8",
                  isAIPanelOpen && "bg-primary/10 text-primary"
                )}
              >
                <motion.div
                  variants={iconVariants}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <MessageSquareText className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            {isAIPanelOpen ? "Close AI Chat" : "Open AI Chat"}
          </TooltipContent>
        </Tooltip>

        {/* Dark Mode Toggle - Desktop only, visible directly */}
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover="hover" whileTap="tap" initial="initial">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8"
                >
                  <motion.div
                    variants={iconVariants}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Desktop: User dropdown with name visible */}
        {!isMobile && isAuthenticated && profile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 gap-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage
                    src={profile.avatar_url || undefined}
                    alt={profile.name || "User"}
                  />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(profile.name, profile.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {profile.name || profile.email.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none">
                    {profile.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {profile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Desktop: Sign in button when not authenticated */}
        {!isMobile && !isAuthenticated && (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}

        {/* Mobile: Hamburger Menu */}
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated && profile && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage
                          src={profile.avatar_url || undefined}
                          alt={profile.name || "User"}
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(profile.name, profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium leading-none">
                          {profile.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate max-w-[160px]">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Theme Toggle - Mobile only in menu */}
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>

              {isAuthenticated ? (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => navigate("/auth")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
