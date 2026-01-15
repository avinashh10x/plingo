import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wand2,
  Calendar,
  FileText,
  Link2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

const navItems = [
  {
    title: "Home",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Studio",
    icon: Wand2,
    path: "/dashboard/studio",
  },
  {
    title: "Calendar",
    icon: Calendar,
    path: "/dashboard/calendar",
  },
  {
    title: "Drafts",
    icon: FileText,
    path: "/dashboard/drafts",
  },
  {
    title: "Accounts",
    icon: Link2,
    path: "/dashboard/accounts",
  },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // We need to fetch the role here, but be careful of circular dependencies or missing context if not inside provider
  // Assuming MobileBottomNav is inside QueryClientProvider
  const { isAdmin } = useUserRole();

  const allNavItems = isAdmin
    ? [...navItems, { title: "Admin", icon: Shield, path: "/admin" }]
    : navItems;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <nav className="flex items-center justify-around h-16 px-2">
        {allNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "fill-current")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
