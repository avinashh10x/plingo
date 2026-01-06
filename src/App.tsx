import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useThemeColor } from "@/hooks/useThemeColor";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import { ConnectPlatformModal } from "./components/platforms/ConnectPlatformModal";

// Lazy load heavy pages for better initial load performance
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  }))
);
const DashboardHome = lazy(() =>
  import("./pages/dashboard/DashboardHome").then((m) => ({
    default: m.DashboardHome,
  }))
);
const ContentStudio = lazy(() =>
  import("./pages/dashboard/ContentStudio").then((m) => ({
    default: m.ContentStudio,
  }))
);
const CalendarPage = lazy(() =>
  import("./pages/dashboard/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  }))
);
const DraftsPage = lazy(() =>
  import("./pages/dashboard/DraftsPage").then((m) => ({
    default: m.DraftsPage,
  }))
);
const AccountsPage = lazy(() =>
  import("./pages/dashboard/AccountsPage").then((m) => ({
    default: m.AccountsPage,
  }))
);
const SettingsPage = lazy(() =>
  import("./pages/dashboard/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    // Only show onboarding once per user - localStorage persists across sessions
    const hasSeenOnboarding = localStorage.getItem(
      "plingo_onboarding_complete"
    );
    if (profile && profile.status === "approved" && !hasSeenOnboarding) {
      // Show onboarding for new users who haven't seen it yet
      setShowOnboarding(true);
    }
  }, [profile]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("plingo_onboarding_complete", "true");
    setShowOnboarding(false);
    setShowConnectModal(true);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("plingo_onboarding_complete", "true");
    setShowOnboarding(false);
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Thanks for joining the waitlist!
          </h1>
          <p className="text-muted-foreground">
            We're currently reviewing your account. You'll receive an email once
            approved.
          </p>
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

  if (authLoading || roleLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    // DEBUG: Show why access is denied
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-background">
        <div className="max-w-md w-full border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            ⚠️ Admin Access Denied
          </h2>
          <div className="space-y-2 font-mono text-xs">
            <p>
              <strong>Path:</strong> {window.location.pathname}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id || "null"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || "null"}
            </p>
            <p>
              <strong>Role:</strong> {JSON.stringify(role)}
            </p>
            <p>
              <strong>IsAdmin:</strong> {String(isAdmin)}
            </p>
            <p>
              <strong>Auth Loading:</strong> {String(authLoading)}
            </p>
            <p>
              <strong>Role Loading:</strong> {String(roleLoading)}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry / Reload
          </button>
        </div>
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

          <Route
            path="/admin"
            element={<Navigate to="/dashboard/admin" replace />}
          />

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
              path="admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminRoute>
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
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
