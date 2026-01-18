"use client";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthOtp } from "@/hooks/useAuthOtp";
import { GoogleAuthButton, LoginForm, SignupForm } from "@/components/auth";
import { AnimatePresence } from "framer-motion";
import InteractiveAi from "@/components/landing/InteractiveAi";

export default function Auth() {
  const navigate = useNavigate();
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const {
    loginState,
    updateLoginState,
    sendLoginOtp,
    verifyLoginOtp,
    resendLoginOtp,
    signupState,
    updateSignupState,
    sendSignupOtp,
    verifySignupOtp,
    resendSignupOtp,
  } = useAuthOtp();

  // Check if already logged in
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Eye tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), 12);

      const eyeX = Math.cos(angle) * distance;
      const eyeY = Math.sin(angle) * distance;

      setEyePosition({ x: eyeX, y: eyeY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="h-screen bg-background flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <Helmet>
        <title>Sign In | Plingo</title>
        <meta
          name="description"
          content="Sign in or create an account to access Plingo's social media scheduling tools."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Main Card Container */}
      <motion.div
        className="w-full max-w-7xl transition-all duration-300 ease-in-out max-h-[95vh] bg-foreground/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 0.5 },
          layout: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        {/* Left Side - Form */}
        <div className="flex-1 p-2 md:p-8 flex flex-col items-center justify-center overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-4 w-[80%]  mx-auto">
            {/* <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src="./favicon.svg" alt="Plingo" className="w-6 h-7" />
              <span className="text-xl font-bold font-oswald uppercase">
                Plingo
              </span>
            </Link> */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome to{" "}
              <Link to="/" className="text-primary">
                {" "}
                Plingo
              </Link>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Sign in to manage your content
            </p>
          </div>

          {/* Auth Form */}
          <div className="max-w-xl mx-auto w-full space-y-4">
            {/* Google Auth */}
            <GoogleAuthButton />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 py-1 text-muted-foreground rounded-xl ">
                  or
                </span>
              </div>
            </div>

            {/* Login/Signup Tabs - Custom Animated */}
            <div className="w-full">
              {/* Tab Buttons with Sliding Indicator */}
              <div className="relative grid grid-cols-2 mb-4 bg-muted rounded-lg p-1">
                {/* Sliding Background Indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-md shadow-sm"
                  initial={false}
                  animate={{
                    x: activeTab === "login" ? 4 : "calc(100% + 4px)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />

                {/* Tab Buttons */}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`relative z-10 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                    activeTab === "login"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className={`relative z-10 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                    activeTab === "signup"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Tab Content with Animation */}
              <AnimatePresence mode="wait">
                {activeTab === "login" ? (
                  <motion.div
                    key="login"
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      opacity: { duration: 0.15 },
                      y: { duration: 0.15 },
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    <LoginForm
                      state={loginState}
                      onUpdateState={updateLoginState}
                      onSendOtp={sendLoginOtp}
                      onVerifyOtp={verifyLoginOtp}
                      onResendOtp={resendLoginOtp}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      opacity: { duration: 0.15 },
                      y: { duration: 0.15 },
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    <SignupForm
                      state={signupState}
                      onUpdateState={updateSignupState}
                      onSendOtp={sendSignupOtp}
                      onVerifyOtp={verifySignupOtp}
                      onResendOtp={resendSignupOtp}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden rounded-2xl m-7">
          <div className="hidden md:flex items-center justify-center lg:justify-start flex-col relative border bg-[url('./journey/bg.png')] bg-cover bg-center h-full w-full rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full h-full gap-3 text-center px-4 py-8"
              >
                <div className="p-3 rounded-xl absolute w-[100%] top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <InteractiveAi size="h-[20vh] w-[20vh]" standalone={false} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
