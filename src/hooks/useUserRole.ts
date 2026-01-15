import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "user";

export function useUserRole() {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    // If auth is still loading, wait.
    if (authLoading) {
      return;
    }

    // Always start loading when running this function
    setIsLoading(true);

    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // Emergency Bypass: Always grant admin to specific email
    if (user.email?.toLowerCase() === "thissideavinash@gmail.com") {
      console.log("Granting admin via email bypass");
      setRole("admin");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching role for user:", user.id, user.email);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Role fetch result:", { data, error });

      if (error) {
        console.error("Error fetching role:", error);
        setRole("user"); // Default to user if error
      } else {
        const fetchedRole = (data?.role as AppRole) || "user";
        console.log("Setting role to:", fetchedRole);
        setRole(fetchedRole);
      }
    } catch (error) {
      console.error("Role fetch error:", error);
      setRole("user");
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const isAdmin = role === "admin";

  return {
    role,
    isAdmin,
    isLoading: isLoading || authLoading,
    refresh: fetchRole,
  };
}
