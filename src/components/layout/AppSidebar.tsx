import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wand2,
  Calendar,
  FileText,
  Link2,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    tourId: "dashboard",
  },
  {
    title: "Content Studio",
    icon: Wand2,
    path: "/dashboard/studio",
    tourId: "studio",
  },
  {
    title: "Calendar",
    icon: Calendar,
    path: "/dashboard/calendar",
    tourId: "calendar",
  },
  {
    title: "Drafts & Library",
    icon: FileText,
    path: "/dashboard/drafts",
    tourId: "drafts",
  },
  {
    title: "Accounts",
    icon: Link2,
    path: "/dashboard/accounts",
    tourId: "accounts",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
    tourId: "settings",
  },
];

const adminItem = {
  title: "Admin Panel",
  icon: Shield,
  path: "/admin",
  tourId: "admin",
};

interface AppSidebarProps {
  isCollapsed?: boolean;
}

export const AppSidebar = ({ isCollapsed = false }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (
    name: string | null | undefined,
    email: string | null | undefined
  ) => {
    if (name && name.length > 0) {
      return (
        name
          .split(" ")
          .map((n) => n[0] || "")
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U"
      );
    }
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const NavButton = ({ item }: { item: (typeof navItems)[0] }) => {
    const active = isActive(item.path);
    const button = (
      <button
        onClick={() => navigate(item.path)}
        data-tour={item.tourId}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          isCollapsed && "justify-center px-2"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span>{item.title}</span>}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <aside className="h-full bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-200 w-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-sidebar-border">
        <Link to={"/"}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <span className="size-6 m-1">
                <img src="/logonly.svg" alt="" />
              </span>
              <h1 className="text-xl font-bold text-sidebar-primary">Plingo</h1>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="size-6">
                <img src="/logonly.svg" alt="" />
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavButton item={item} />
            </li>
          ))}
          {isAdmin && (
            <li>
              <NavButton item={adminItem} />
            </li>
          )}
        </ul>
      </nav>

      {/* Profile at bottom */}
      {profile && (
        <div className="p-2 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors",
                  isCollapsed && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8 border border-sidebar-border flex-shrink-0">
                  <AvatarImage
                    src={profile.avatar_url || undefined}
                    alt={profile.name || "User"}
                  />
                  <AvatarFallback className="text-xs bg-sidebar-primary/20 text-sidebar-primary">
                    {getInitials(profile.name, profile.email)}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile.name || profile.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      Free Plan
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuItem
                onClick={() => navigate("/dashboard/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
        </div>
      )}
    </aside>
  );
};
