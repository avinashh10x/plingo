import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Formats a token count into a short display string.
 * e.g. 1500 → "1.5k", 500 → "500", 10000 → "10k"
 */
export function formatTokens(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    // Show decimal only if not a whole number
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [purchasedTokens, setPurchasedTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const totalTokens = (credits ?? 0) + purchasedTokens;

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("credits, purchased_tokens")
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle to avoid error on empty

      if (error) {
        console.error("Error fetching credits:", error);
        return;
      }

      // If no row exists, we assume 100 free + 0 purchased
      setCredits(data?.credits ?? 100);
      setPurchasedTokens((data as any)?.purchased_tokens ?? 0);
    } catch (error) {
      console.error("Unexpected error in fetchCredits:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();

    if (!user) return;

    // Listen for manual validation triggers (e.g. after posting)
    const handleRefresh = () => {
      console.log("Manual credit refresh triggered");
      fetchCredits();
    };
    window.addEventListener("plingo:refresh-credits", handleRefresh);

    // Subscribe to changes
    console.log("Subscribing to user_credits changes for", user.id);
    const channel = supabase
      .channel(`credits-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Credit update received:", payload);
          if (payload.new && "credits" in payload.new) {
            setCredits((payload.new as any).credits);
            setPurchasedTokens((payload.new as any).purchased_tokens ?? 0);
          }
        }
      )
      .subscribe((status) => {
        console.log("Credit subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("plingo:refresh-credits", handleRefresh);
    };
  }, [user, fetchCredits]);

  return {
    credits,
    purchasedTokens,
    totalTokens,
    loading,
    refresh: fetchCredits,
    formatted: formatTokens(totalTokens),
    formattedFree: formatTokens(credits ?? 0),
    formattedPurchased: formatTokens(purchasedTokens),
  };
}
