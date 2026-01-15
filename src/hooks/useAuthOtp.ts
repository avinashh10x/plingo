import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const RESEND_COOLDOWN = 60; // seconds

export type OtpState = {
  email: string;
  otp: string;
  otpSent: boolean;
  resendCountdown: number;
  isLoading: boolean;
};

export type SignupOtpState = OtpState & {
  name: string;
};

export function useAuthOtp() {
  const { toast } = useToast();

  // Login state
  const [loginState, setLoginState] = useState<OtpState>({
    email: "",
    otp: "",
    otpSent: false,
    resendCountdown: 0,
    isLoading: false,
  });

  // Signup state
  const [signupState, setSignupState] = useState<SignupOtpState>({
    name: "",
    email: "",
    otp: "",
    otpSent: false,
    resendCountdown: 0,
    isLoading: false,
  });

  // Timer refs
  const loginTimerRef = useRef<NodeJS.Timeout | null>(null);
  const signupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (loginTimerRef.current) clearInterval(loginTimerRef.current);
      if (signupTimerRef.current) clearInterval(signupTimerRef.current);
    };
  }, []);

  // Start countdown timer
  const startCountdown = useCallback((type: "login" | "signup") => {
    const timerRef = type === "login" ? loginTimerRef : signupTimerRef;
    const setState = type === "login" ? setLoginState : setSignupState;

    setState((prev) => ({ ...prev, resendCountdown: RESEND_COOLDOWN }));

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.resendCountdown <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, resendCountdown: 0 };
        }
        return { ...prev, resendCountdown: prev.resendCountdown - 1 };
      });
    }, 1000);
  }, []);

  // Validate email
  const validateEmail = useCallback(
    (email: string): boolean => {
      try {
        emailSchema.parse(email);
        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast({
            title: "Validation Error",
            description: err.errors[0].message,
          });
        }
        return false;
      }
    },
    [toast]
  );

  // Send OTP for login
  const sendLoginOtp = useCallback(async (): Promise<boolean> => {
    if (!validateEmail(loginState.email)) return false;

    setLoginState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginState.email.trim(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        if (error.message.includes("Signups not allowed")) {
          throw new Error(
            "This email is not registered. Please sign up first."
          );
        }
        throw error;
      }

      setLoginState((prev) => ({ ...prev, otpSent: true, isLoading: false }));
      startCountdown("login");

      toast({
        title: "OTP Sent!",
        description: "Check your email for the verification code.",
      });

      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast({ title: "Error", description: message });
      setLoginState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [loginState.email, validateEmail, startCountdown, toast]);

  // Verify login OTP
  const verifyLoginOtp = useCallback(async (): Promise<boolean> => {
    if (!loginState.otp || loginState.otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code from your email.",
      });
      return false;
    }

    setLoginState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: loginState.email.trim(),
        token: loginState.otp.trim(),
        type: "email",
      });

      if (error) {
        if (error.message.includes("Token has expired")) {
          throw new Error("OTP has expired. Please request a new one.");
        }
        if (error.message.includes("Invalid")) {
          throw new Error("Invalid OTP. Please check and try again.");
        }
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP";
      toast({ title: "Error", description: message });
      setLoginState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [loginState.email, loginState.otp, toast]);

  // Resend login OTP
  const resendLoginOtp = useCallback(async (): Promise<boolean> => {
    if (loginState.resendCountdown > 0) return false;

    setLoginState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginState.email.trim(),
        options: { shouldCreateUser: false },
      });

      if (error) throw error;

      startCountdown("login");
      toast({
        title: "OTP Resent!",
        description: "Check your email for the new verification code.",
      });
      setLoginState((prev) => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to resend OTP";
      toast({ title: "Error", description: message });
      setLoginState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [loginState.email, loginState.resendCountdown, startCountdown, toast]);

  // Send OTP for signup
  const sendSignupOtp = useCallback(async (): Promise<boolean> => {
    if (!validateEmail(signupState.email)) return false;

    if (signupState.name.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
      });
      return false;
    }

    setSignupState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: signupState.email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: signupState.name.trim(),
            name: signupState.name.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error(
            "This email is already registered. Please sign in instead."
          );
        }
        throw error;
      }

      setSignupState((prev) => ({ ...prev, otpSent: true, isLoading: false }));
      startCountdown("signup");

      toast({
        title: "OTP Sent!",
        description: "Check your email for the verification code.",
      });

      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast({ title: "Error", description: message });
      setSignupState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [
    signupState.email,
    signupState.name,
    validateEmail,
    startCountdown,
    toast,
  ]);

  // Verify signup OTP
  const verifySignupOtp = useCallback(async (): Promise<boolean> => {
    if (!signupState.otp || signupState.otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code from your email.",
      });
      return false;
    }

    setSignupState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signupState.email.trim(),
        token: signupState.otp.trim(),
        type: "email",
      });

      if (error) {
        if (error.message.includes("Token has expired")) {
          throw new Error("OTP has expired. Please request a new one.");
        }
        if (error.message.includes("Invalid")) {
          throw new Error("Invalid OTP. Please check and try again.");
        }
        throw error;
      }

      toast({ title: "Account Created!", description: "Welcome to Plingo!" });
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP";
      toast({ title: "Error", description: message });
      setSignupState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [signupState.email, signupState.otp, toast]);

  // Resend signup OTP
  const resendSignupOtp = useCallback(async (): Promise<boolean> => {
    if (signupState.resendCountdown > 0) return false;

    setSignupState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: signupState.email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            full_name: signupState.name.trim(),
            name: signupState.name.trim(),
          },
        },
      });

      if (error) throw error;

      startCountdown("signup");
      toast({
        title: "OTP Resent!",
        description: "Check your email for the new verification code.",
      });
      setSignupState((prev) => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to resend OTP";
      toast({ title: "Error", description: message });
      setSignupState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [
    signupState.email,
    signupState.name,
    signupState.resendCountdown,
    startCountdown,
    toast,
  ]);

  // Update login state
  const updateLoginState = useCallback((updates: Partial<OtpState>) => {
    setLoginState((prev) => {
      // Reset OTP state when email changes
      if (
        updates.email !== undefined &&
        updates.email !== prev.email &&
        prev.otpSent
      ) {
        return { ...prev, ...updates, otpSent: false, otp: "" };
      }
      return { ...prev, ...updates };
    });
  }, []);

  // Update signup state
  const updateSignupState = useCallback((updates: Partial<SignupOtpState>) => {
    setSignupState((prev) => {
      // Reset OTP state when email changes
      if (
        updates.email !== undefined &&
        updates.email !== prev.email &&
        prev.otpSent
      ) {
        return { ...prev, ...updates, otpSent: false, otp: "" };
      }
      return { ...prev, ...updates };
    });
  }, []);

  return {
    // Login
    loginState,
    updateLoginState,
    sendLoginOtp,
    verifyLoginOtp,
    resendLoginOtp,

    // Signup
    signupState,
    updateSignupState,
    sendSignupOtp,
    verifySignupOtp,
    resendSignupOtp,
  };
}
