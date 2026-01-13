import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type NotificationType =
  | "post_published"
  | "post_scheduled"
  | "post_failed"
  | "admin_alert"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
}

const INITIAL_LOAD = 10;
const LOAD_MORE_SIZE = 10;
const MAX_IN_MEMORY = 20;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [oldestLoadedId, setOldestLoadedId] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (initial = true) => {
      if (!user) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      try {
        const limit = initial ? INITIAL_LOAD : LOAD_MORE_SIZE;

        let query = supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        // If loading more, start from oldest loaded
        if (!initial && oldestLoadedId) {
          const { data: oldestNotif } = await supabase
            .from("notifications")
            .select("created_at")
            .eq("id", oldestLoadedId)
            .single();

          if (oldestNotif) {
            query = query.lt("created_at", oldestNotif.created_at);
          }
        }

        const { data, error } = await query;

        if (error) throw error;

        const newNotifications = (data || []) as Notification[];

        if (initial) {
          setNotifications(newNotifications);
        } else {
          // Add new notifications and maintain sliding window (max 20)
          setNotifications((prev) => {
            const combined = [...prev, ...newNotifications];
            // Keep only newest 20
            return combined.slice(0, MAX_IN_MEMORY);
          });
        }

        // Update oldest loaded ID
        if (newNotifications.length > 0) {
          setOldestLoadedId(newNotifications[newNotifications.length - 1].id);
        }

        // Check if there are more notifications
        setHasMore(newNotifications.length === limit);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, oldestLoadedId]
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNotifications(false);
    }
  }, [isLoading, hasMore, fetchNotifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications(true);
    }
  }, [user]);

  // Real-time subscription - prepend new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => {
            // Add new notification at top, maintain max 20
            const updated = [newNotification, ...prev];
            return updated.slice(0, MAX_IN_MEMORY);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const createNotification = async (
    type: NotificationType,
    title: string,
    message: string,
    postId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          post_id: postId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    createNotification,
    loadMore,
    refresh: () => fetchNotifications(true),
  };
}
