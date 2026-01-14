import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle to avoid error on empty

      if (error) {
        console.error("Error fetching credits:", error);
        return;
      }

      // If no row exists, we assume 100 (initial default) but it should be created by now
      setCredits(data?.credits ?? 100);
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

  return { credits, loading, refresh: fetchCredits };
}
