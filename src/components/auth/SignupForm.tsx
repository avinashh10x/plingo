import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { Loader2, Mail, User } from "lucide-react";
import type { SignupOtpState } from "@/hooks/useAuthOtp";

interface SignupFormProps {
  state: SignupOtpState;
  onUpdateState: (updates: Partial<SignupOtpState>) => void;
  onSendOtp: () => Promise<boolean>;
  onVerifyOtp: () => Promise<boolean>;
  onResendOtp: () => Promise<boolean>;
}

export function SignupForm({
  state,
  onUpdateState,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
}: SignupFormProps) {
  const { name, email, otp, otpSent, resendCountdown, isLoading } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) {
      await onVerifyOtp();
    } else {
      await onSendOtp();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex  gap-4 max-md:flex-col">
        {/* Full Name Field */}
        <div className="space-y-2 flex-1">
          <Label htmlFor="signup-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => onUpdateState({ name: e.target.value })}
              className="pl-10"
              required
              disabled={otpSent && isLoading}
            />
          </div>
        </div>

        {/* Email Field */}
          <div className="space-y-2  flex-1">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onUpdateState({ email: e.target.value })}
              className="pl-10"
              required
              disabled={otpSent && isLoading}
            />
          </div>
        </div>
      </div>

      {/* OTP Field - appears after OTP sent */}
      {otpSent && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Label className="text-center block">Enter Verification Code</Label>
          <OtpInput
            value={otp}
            onChange={(value) => onUpdateState({ otp: value })}
            disabled={isLoading}
            autoFocus
          />
          <p className="text-xs text-muted-foreground text-center">
            We sent a 6-digit code to {email}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {otpSent ? "Create Account" : "Verify Email"}
      </Button>

      {/* Resend OTP */}
      {otpSent && (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm"
          onClick={onResendOtp}
          disabled={isLoading || resendCountdown > 0}
        >
          {resendCountdown > 0
            ? `Resend OTP in ${resendCountdown}s`
            : "Resend OTP"}
        </Button>
      )}
    </form>
  );
}
