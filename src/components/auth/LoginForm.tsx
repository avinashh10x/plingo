import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { Loader2, Mail } from "lucide-react";
import type { OtpState } from "@/hooks/useAuthOtp";

interface LoginFormProps {
  state: OtpState;
  onUpdateState: (updates: Partial<OtpState>) => void;
  onSendOtp: () => Promise<boolean>;
  onVerifyOtp: () => Promise<boolean>;
  onResendOtp: () => Promise<boolean>;
}

export function LoginForm({
  state,
  onUpdateState,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
}: LoginFormProps) {
  const { email, otp, otpSent, resendCountdown, isLoading } = state;

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
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
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
        {otpSent ? "Sign In" : "Send OTP"}
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
