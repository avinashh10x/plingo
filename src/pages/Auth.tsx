import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthOtp } from "@/hooks/useAuthOtp";
import { GoogleAuthButton, LoginForm, SignupForm } from "@/components/auth";

export default function Auth() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Plingo
          </h1>
          <p className="text-muted-foreground mt-2">
            Multi-platform social media automation
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/50 shadow-xl backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to manage your social media posts
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Auth */}
            <GoogleAuthButton />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Login/Signup Tabs */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <LoginForm
                  state={loginState}
                  onUpdateState={updateLoginState}
                  onSendOtp={sendLoginOtp}
                  onVerifyOtp={verifyLoginOtp}
                  onResendOtp={resendLoginOtp}
                />
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <SignupForm
                  state={signupState}
                  onUpdateState={updateSignupState}
                  onSendOtp={sendSignupOtp}
                  onVerifyOtp={verifySignupOtp}
                  onResendOtp={resendSignupOtp}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
