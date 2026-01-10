import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "post_published"
  | "post_scheduled"
  | "post_failed"
  | "admin_alert"
  | "system";

/**
 * Create a notification for the current user
 * Can be called from anywhere in the app
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  postId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      post_id: postId || null,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Create notifications for all users (admin alert)
 */
export async function createAdminAlert(
  adminId: string,
  title: string,
  message: string
): Promise<boolean> {
  try {
    // First, create the admin alert record
    const { error: alertError } = await supabase.from("admin_alerts").insert({
      title,
      message,
      created_by: adminId,
    });

    if (alertError) {
      console.error("Error creating admin alert:", alertError);
      return false;
    }

    // Get all user IDs
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("user_id");

    if (usersError || !users) {
      console.error("Error fetching users:", usersError);
      return false;
    }

    // Create notification for each user
    const notifications = users.map((user) => ({
      user_id: user.user_id,
      type: "admin_alert" as NotificationType,
      title,
      message,
    }));

    const { error: notifError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notifError) {
      console.error("Error creating notifications:", notifError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error creating admin alert:", error);
    return false;
  }
}
