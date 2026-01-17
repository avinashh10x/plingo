import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export const LandingHeader = () => {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getInitials = (
    name: string | null | undefined,
    email: string | null | undefined,
  ) => {
    if (name)
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    if (email) return email[0].toUpperCase();
    return "U";
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50  px-6">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        <Link to="/">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-6 rounded-lg flex items-center justify-center">
              <img src="./favicon.svg" alt="" className="w-full" />
            </div>
            <span className="text-xl font-bold text-foreground font-oswald uppercase">
              Plingo
            </span>
          </motion.div>
        </Link>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {isAuthenticated && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-2 pr-4 h-10 gap-2 hover:bg-muted/50 "
                >
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage
                      src={profile.avatar_url || undefined}
                      alt={profile.name || "User"}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(profile.name, profile.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-right w-full">
                    <p className="text-sm font-medium leading-none">
                      {profile.name || "User"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard")}
                  className="cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
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
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 text-base font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </header>
  );
};
