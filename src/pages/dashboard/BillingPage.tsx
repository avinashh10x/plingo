import { useState, useEffect } from "react";
import {
  Coins,
  Receipt,
  ArrowUpRight,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits, formatTokens } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TokenTransaction {
  id: string;
  amount_cents: number;
  tokens_granted: number;
  polar_order_id: string | null;
  polar_checkout_id: string | null;
  customer_email: string | null;
  status: string;
  created_at: string;
}

export function BillingPage() {
  const { user } = useAuth();
  const { credits, purchasedTokens, totalTokens } = useCredits();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("token_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions((data as TokenTransaction[]) || []);
      }
      setLoading(false);
    };

    fetchTransactions();

    // Subscribe to new transactions
    const channel = supabase
      .channel(`billing-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "token_transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setTransactions((prev) => [payload.new as TokenTransaction, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleBuyTokens = async () => {
    if (!user) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("polar-checkout", {
        body: {},
      });
      if (error) {
        console.error("Checkout error:", error);
        return;
      }
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalSpent = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const totalTokensPurchased = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.tokens_granted, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing & Tokens</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your tokens and view payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tokens */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Balance
            </span>
            <Coins className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">
            {formatTokens(totalTokens)}
          </p>
          <p className="text-xs text-muted-foreground">tokens available</p>
        </div>

        {/* Free Tokens */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Free Monthly
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{formatTokens(credits ?? 0)}</p>
          <p className="text-xs text-muted-foreground">of 100 remaining</p>
        </div>

        {/* Purchased Tokens */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Purchased
            </span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500">
            {formatTokens(purchasedTokens)}
          </p>
          <p className="text-xs text-muted-foreground">never expire</p>
        </div>

        {/* Total Spent */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Spent
            </span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">
            ${(totalSpent / 100).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTokens(totalTokensPurchased)} tokens earned
          </p>
        </div>
      </div>

      {/* Buy Tokens CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Buy More Tokens
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            500 tokens per $1 · Pay what you want · Tokens never expire
          </p>
        </div>
        <Button
          onClick={handleBuyTokens}
          disabled={checkoutLoading}
          className="gap-2 shrink-0"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Buy Tokens
            </>
          )}
        </Button>
      </div>

      {/* Token Pricing Info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-3">Token Pricing</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="font-bold text-lg">$1</p>
            <p className="text-muted-foreground text-xs">500 tokens</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="font-bold text-lg">$3</p>
            <p className="text-muted-foreground text-xs">1.5k tokens</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="font-bold text-lg">$5</p>
            <p className="text-muted-foreground text-xs">2.5k tokens</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="font-bold text-lg">$10</p>
            <p className="text-muted-foreground text-xs">5k tokens</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--twitter))]"></div>
            Twitter: 10 tokens/post
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--linkedin))]"></div>
            LinkedIn: 5 tokens/post
          </span>
        </div>
      </div>

      <Separator />

      {/* Transaction History */}
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment History
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No payments yet
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Your payment history will appear here after your first purchase
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tokens
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Order ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {formatDate(tx.created_at)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(tx.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ${(tx.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                          <ArrowUpRight className="h-3.5 w-3.5" />+
                          {formatTokens(tx.tokens_granted)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            tx.status === "completed"
                              ? "default"
                              : tx.status === "refunded"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-mono">
                          {tx.polar_order_id
                            ? tx.polar_order_id.slice(0, 8) + "..."
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
