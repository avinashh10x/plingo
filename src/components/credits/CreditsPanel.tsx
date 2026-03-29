import { useState } from "react";
import {
  Coins,
  Info,
  CheckCircle2,
  AlertCircle,
  Zap,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatTokens } from "@/hooks/useCredits";

interface CreditsPanelProps {
  credits: number | null;
  purchasedTokens?: number;
  totalTokens?: number;
  children: React.ReactNode;
}

export const CreditsPanel = ({
  credits,
  purchasedTokens = 0,
  totalTokens,
  children,
}: CreditsPanelProps) => {
  const { user } = useAuth();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const freeCredits = credits ?? 0;
  const total = totalTokens ?? freeCredits + purchasedTokens;
  const maxFree = 100;
  const freePercentage = Math.min(100, (freeCredits / maxFree) * 100);

  const handleBuyTokens = async () => {
    if (!user) return;

    setIsCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/polar-checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Checkout error:", data);
        return;
      }

      // Redirect to Polar checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header with total balance */}
        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Token Balance
            </h3>
            <span className="font-bold text-lg text-primary">
              {formatTokens(total)}
            </span>
          </div>

          {/* Free tokens progress */}
          <div className="space-y-1.5">
            <Progress value={freePercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Free Monthly</span>
              <span>
                {freeCredits} / {maxFree}
              </span>
            </div>
          </div>

          {/* Purchased tokens display */}
          {purchasedTokens > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Purchased Tokens
              </span>
              <span className="font-medium text-amber-500">
                {formatTokens(purchasedTokens)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Cost per post */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              Cost per Post
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--twitter))]"></div>
                  Twitter
                </span>
                <span className="font-medium">10 tokens</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--linkedin))]"></div>
                  LinkedIn
                </span>
                <span className="font-medium">5 tokens</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Posting rules */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
              Posting Rules
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span>Stay safe: Max 3 posts per platform each day.</span>
              </li>
              <li className="flex gap-2">
                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>100 free tokens reset every month</span>
              </li>
              <li className="flex gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Purchased tokens never expire</span>
              </li>
            </ul>
          </div>

          {/* Buy Tokens CTA */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-3 text-center space-y-2">
            <p className="text-xs font-medium text-primary">
              Need more tokens?
            </p>
            <p className="text-[10px] text-muted-foreground">
              500 tokens per $1 · Pay what you want
            </p>
            <Button
              size="sm"
              className="w-full gap-2 text-xs h-8"
              onClick={handleBuyTokens}
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buy Tokens
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
