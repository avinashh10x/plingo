import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "posting"
  | "posted"
  | "failed";
export type PlatformType =
  | "twitter"
  | "instagram"
  | "linkedin"
  | "facebook"
  | "threads"
  | "tiktok"
  | "youtube"
  | "pinterest";

export interface Post {
  id: string;
  content: string;
  platforms: PlatformType[];
  status: PostStatus;
  scheduled_at: string | null;
  posted_at: string | null;
  error_message: string | null;
  media_urls: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleRule {
  type: "daily" | "weekdays" | "weekends" | "custom";
  days?: string[];
  time: string;
  timezone?: string;
}

type PostsSyncPayload =
  | { type: "upsert"; post: Post }
  | { type: "update"; id: string; updates: Partial<Post> }
  | { type: "delete"; id: string }
  | { type: "refetch" };

const POSTS_SYNC_EVENT = "plingo:posts-sync";

function emitPostsSync(payload: PostsSyncPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PostsSyncPayload>(POSTS_SYNC_EVENT, { detail: payload })
  );
}

export function usePosts() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      if (error) throw error;

      setPosts((data || []) as Post[]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (ev: Event) => {
      const payload = (ev as CustomEvent<PostsSyncPayload>).detail;
      if (!payload) return;

      if (payload.type === "refetch") {
        fetchPosts();
        return;
      }

      setPosts((prev) => {
        switch (payload.type) {
          case "upsert": {
            const exists = prev.some((p) => p.id === payload.post.id);
            return exists
              ? prev.map((p) => (p.id === payload.post.id ? payload.post : p))
              : [...prev, payload.post];
          }
          case "update":
            return prev.map((p) =>
              p.id === payload.id ? { ...p, ...payload.updates } : p
            );
          case "delete":
            return prev.filter((p) => p.id !== payload.id);
          default:
            return prev;
        }
      });
    };

    window.addEventListener(POSTS_SYNC_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(POSTS_SYNC_EVENT, handler as EventListener);
  }, [fetchPosts]);

  const createPost = async (
    content: string = "",
    platforms: PlatformType[] = []
  ): Promise<Post | null> => {
    if (!user) return null;

    try {
      const maxOrder =
        posts.length > 0 ? Math.max(...posts.map((p) => p.order_index)) : 0;

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content,
          platforms,
          status: "draft",
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      const newPost = data as Post;
      setPosts((prev) => [...prev, newPost]);
      emitPostsSync({ type: "upsert", post: newPost });
      return newPost;
    } catch (error) {
      console.error("Create post error:", error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePost = async (
    id: string,
    updates: Partial<Post>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      emitPostsSync({ type: "update", id, updates });
      return true;
    } catch (error) {
      console.error("Update post error:", error);
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== id));
      emitPostsSync({ type: "delete", id });
      return true;
    } catch (error) {
      console.error("Delete post error:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderPosts = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from("posts")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
      }

      setPosts((prev) => {
        const reordered = [...prev].sort((a, b) => {
          return orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id);
        });
        return reordered.map((p, i) => ({ ...p, order_index: i }));
      });

      return true;
    } catch (error) {
      console.error("Reorder posts error:", error);
      return false;
    }
  };

  const schedulePost = async (
    id: string,
    scheduledAt: Date,
    platforms?: PlatformType[]
  ): Promise<boolean> => {
    const nextIso = scheduledAt.toISOString();

    try {
      // Get current session for explicit auth header
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke("schedule-post", {
        body: {
          post_id: id,
          scheduled_at: nextIso,
          platforms,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Surface backend attempt details (if any) for easier debugging
        const details = (error as any)?.context ?? (data as any);
        const msg =
          typeof details === "string"
            ? details
            : details?.error ?? error.message;

        // Provide user-friendly error messages
        if (msg.includes("past") || msg.includes("already passed")) {
          throw new Error(
            "Cannot schedule posts in the past. Please select a future date and time."
          );
        } else if (
          msg.includes("not connected") ||
          msg.includes("authentication")
        ) {
          throw new Error(
            "Platform not connected. Please connect your account in Settings."
          );
        } else if (msg.includes("maxDelay") || msg.includes("quota")) {
          throw new Error(
            "Scheduling limit: On the free plan, you can only schedule up to 7 days in advance."
          );
        } else {
          throw new Error(msg || "Failed to schedule post");
        }
      }

      // Update UI only after backend confirms success
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "scheduled" as PostStatus,
                scheduled_at: nextIso,
                ...(platforms ? { platforms } : {}),
              }
            : p
        )
      );

      emitPostsSync({
        type: "update",
        id,
        updates: {
          status: "scheduled" as PostStatus,
          scheduled_at: nextIso,
          ...(platforms ? { platforms } : {}),
        },
      });

      toast({
        title: "📅 Post scheduled!",
        description: `Scheduled for ${scheduledAt.toLocaleString()}`,
      });

      // Refresh in background to sync with server state
      fetchPosts();

      return true;
    } catch (error) {
      // Sync back to server truth
      fetchPosts();
      console.error("Schedule post error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to schedule post. Please try again.";

      toast({
        title: "❌ Scheduling failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const bulkSchedule = async (
    postIds: string[],
    rule: ScheduleRule,
    platforms?: PlatformType[]
  ): Promise<boolean> => {
    try {
      // Get current session for explicit auth header
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke("bulk-schedule", {
        body: {
          post_ids: postIds,
          rule,
          platforms,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      await fetchPosts();

      const successCount =
        data?.scheduled?.filter((s: { success: boolean }) => s.success)
          .length || 0;

      toast({
        title: "Bulk scheduling complete",
        description: `${successCount} of ${postIds.length} posts scheduled.`,
      });

      return true;
    } catch (error) {
      console.error("Bulk schedule error:", error);
      toast({
        title: "Bulk scheduling failed",
        description:
          error instanceof Error ? error.message : "Failed to schedule posts",
        variant: "destructive",
      });
      return false;
    }
  };

  const publishNow = async (
    id: string,
    platform: PlatformType
  ): Promise<boolean> => {
    // Optimistically update UI
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "posting" as PostStatus } : p
      )
    );

    try {
      // Get current session for explicit auth header
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke("publish-post", {
        body: {
          post_id: id,
          platform,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Parse error details for better user feedback
        const errorMsg = error.message || "Unknown error occurred";

        // Check for common error patterns
        if (
          errorMsg.includes("not connected") ||
          errorMsg.includes("authentication")
        ) {
          throw new Error(
            `Your ${platform} account is not connected. Please reconnect in Settings.`
          );
        } else if (errorMsg.includes("rate limit")) {
          throw new Error(
            `Rate limit exceeded for ${platform}. Please try again later.`
          );
        } else if (
          errorMsg.includes("invalid token") ||
          errorMsg.includes("expired")
        ) {
          throw new Error(
            `Your ${platform} session has expired. Please reconnect your account.`
          );
        } else {
          throw new Error(errorMsg);
        }
      }

      // Check for error in response data
      if (data?.error) {
        throw new Error(data.error);
      }

      // Optimistically mark as posted
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "posted" as PostStatus,
                posted_at: new Date().toISOString(),
              }
            : p
        )
      );

      toast({
        title: "✨ Post published!",
        description: `Successfully posted to ${platform}`,
      });

      // Background refresh
      fetchPosts();

      return true;
    } catch (error) {
      // Revert on error
      fetchPosts();
      console.error("Publish error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to publish post. Please check your connection and try again.";

      toast({
        title: "❌ Publishing failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Computed properties
  const draftPosts = posts.filter((p) => p.status === "draft");
  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const postedPosts = posts.filter((p) => p.status === "posted");
  const failedPosts = posts.filter((p) => p.status === "failed");

  return {
    posts,
    draftPosts,
    scheduledPosts,
    postedPosts,
    failedPosts,
    isLoading,
    createPost,
    updatePost,
    deletePost,
    reorderPosts,
    schedulePost,
    bulkSchedule,
    publishNow,
    refresh: fetchPosts,
  };
}
