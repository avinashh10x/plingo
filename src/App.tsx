import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppStore } from "@/stores/appStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import { ConnectPlatformModal } from "./components/platforms/ConnectPlatformModal";

// Lazy load heavy pages for better initial load performance
const Profile = lazy(() => import("./pages/Profile"));
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { UserManagement } from "./pages/admin/UserManagement";
import { NotificationManager } from "./pages/admin/NotificationManager";
import { ApiUsage } from "./pages/admin/ApiUsage";
const DashboardHome = lazy(() =>
  import("./pages/dashboard/DashboardHome").then((m) => ({
    default: m.DashboardHome,
  })),
);
const ContentStudio = lazy(() =>
  import("./pages/dashboard/ContentStudio").then((m) => ({
    default: m.ContentStudio,
  })),
);
const CalendarPage = lazy(() =>
  import("./pages/dashboard/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const DraftsPage = lazy(() =>
  import("./pages/dashboard/DraftsPage").then((m) => ({
    default: m.DraftsPage,
  })),
);
const AccountsPage = lazy(() =>
  import("./pages/dashboard/AccountsPage").then((m) => ({
    default: m.AccountsPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/dashboard/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const { showOnboarding, setShowOnboarding } = useAppStore();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Show onboarding only if user hasn't seen it (DB flag) and is approved
    if (
      profile &&
      profile.status === "approved" &&
      profile.has_seen_onboarding === false
    ) {
      if (window.innerWidth < 768) {
        toast({
          title: "Please use desktop",
          description: "For onboarding process please open in desktop",
        });
      } else {
        setShowOnboarding(true);
      }
    }
  }, [profile, setShowOnboarding, toast]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setShowConnectModal(true);

    // Update DB to persist that user has seen onboarding
    if (profile) {
      const { error } = await supabase
        .from("profiles")
        .update({ has_seen_onboarding: true })
        .eq("user_id", profile.user_id);

      if (error) {
        console.error("Failed to update onboarding status", error);
      }
    }
  };

  const handleOnboardingSkip = async () => {
    setShowOnboarding(false);

    // Update DB on skip too
    if (profile) {
      await supabase
        .from("profiles")
        .update({ has_seen_onboarding: true })
        .eq("user_id", profile.user_id);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (profile && profile.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Account Under Verification
          </h1>
          <div className="space-y-2 text-muted-foreground">
            <p>User ID is verifying by Plingo, it will be approved soon.</p>
            <p>
              For more info email at{" "}
              <a
                href="mailto:thissideavinash@gamil.com"
                className="text-primary hover:underline"
              >
                thissideavinash@gamil.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTour
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </AnimatePresence>
      <ConnectPlatformModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
      />
    </>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading, role } = useUserRole();

  console.log("AdminRoute Check:", {
    user: user?.email,
    isAdmin,
    authLoading,
    roleLoading,
  });

  if (authLoading || roleLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>User: {user?.email}</p>
        <p>ID: {user?.id}</p>
        <p>IsAdmin: {String(isAdmin)}</p>
        <p>Role Loading: {String(roleLoading)}</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    );
    // return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const AppContent = () => {
  useThemeColor();

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="notifications" element={<NotificationManager />} />
            <Route path="status" element={<ApiUsage />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardHome />
                </Suspense>
              }
            />
            <Route
              path="studio"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ContentStudio />
                </Suspense>
              }
            />
            <Route
              path="calendar"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CalendarPage />
                </Suspense>
              }
            />
            <Route
              path="drafts"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DraftsPage />
                </Suspense>
              }
            />
            <Route
              path="accounts"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AccountsPage />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              }
            />

            <Route
              path="create"
              element={<Navigate to="/dashboard/studio" replace />}
            />
          </Route>

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
