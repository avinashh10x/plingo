import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatTokens } from "@/hooks/useCredits";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const checkoutId = searchParams.get("checkout_id");
  
  const [status, setStatus] = useState<"verifying" | "success" | "timeout" | "error">("verifying");
  const [tokensGranted, setTokensGranted] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  useEffect(() => {
    if (!user || !checkoutId) {
      if (!checkoutId) {
        setStatus("error");
      }
      return;
    }

    let isMounted = true;
    let pollInterval: number;
    let timeoutId: number;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    const checkTransaction = async () => {
      try {
        const { data, error } = await supabase
          .from("token_transactions")
          .select("tokens_granted, amount_cents, status")
          .eq("polar_checkout_id", checkoutId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking transaction:", error);
          return;
        }

        if (data) {
          if (isMounted) {
            setTokensGranted(data.tokens_granted);
            setAmountPaid(data.amount_cents);
            setStatus("success");
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
          }
        } else {
          attempts++;
          if (attempts >= maxAttempts && isMounted) {
            setStatus("timeout");
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error("Failed to poll transaction:", err);
      }
    };

    // Initial check
    checkTransaction();

    // Poll every 1 second
    pollInterval = window.setInterval(checkTransaction, 1000);

    // Fallback timeout after 35s
    timeoutId = window.setTimeout(() => {
      if (isMounted && status === "verifying") {
        setStatus("timeout");
        clearInterval(pollInterval);
      }
    }, 35000);

    // Subscribe to realtime inserts as a backup
    const channel = supabase
      .channel(`checkout-${checkoutId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_transactions",
          filter: `polar_checkout_id=eq.${checkoutId}`,
        },
        (payload) => {
          if (isMounted) {
            setTokensGranted(payload.new.tokens_granted);
            setAmountPaid(payload.new.amount_cents);
            setStatus("success");
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user, checkoutId, status]);

  if (!checkoutId) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-[60vh]">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Invalid Checkout Link</h2>
          <p className="text-muted-foreground text-sm">
            We couldn't verify this payment because the checkout ID is missing.
          </p>
          <Button asChild className="mt-4">
            <Link to="/dashboard/billing">Return to Billing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-[60vh]">
      <div className="max-w-md w-full bg-card border border-border shadow-sm rounded-xl p-8 text-center space-y-6">
        
        {status === "verifying" && (
          <div className="space-y-4 py-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Verifying your payment...</h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your transaction and add tokens to your account. This usually takes just a few seconds.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground">
                Your payment of ${(amountPaid / 100).toFixed(2)} has been processed successfully.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border inline-block min-w-48">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                Tokens Added
              </p>
              <p className="text-3xl font-bold text-primary">
                +{formatTokens(tokensGranted)}
              </p>
            </div>

            <div className="pt-4">
              <Button asChild className="w-full gap-2">
                <Link to="/dashboard/billing">
                  View Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {status === "timeout" && (
          <div className="space-y-6 py-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Verification is taking longer than usual...</h2>
              <p className="text-sm text-muted-foreground">
                Your payment may still be processing with the payment provider. Your tokens will automatically appear in your balance once the provider confirms the transaction.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full">
                <Link to="/dashboard/billing">Go to Billing & Tokens</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                If your tokens don't appear within 5 minutes, please contact support.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
