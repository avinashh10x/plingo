import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const qstashToken = Deno.env.get("QSTASH_TOKEN");

  // Get auth header to verify user
  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", details: "Empty token" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Verify the user with provided JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(jwt);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: authError?.message ?? "Invalid session",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { post_id, scheduled_at, rule_id, platforms } = await req.json();

    console.log(`Scheduling post ${post_id} for ${scheduled_at}`);

    // Verify post belongs to user
    const { data: post, error: postError } = await supabaseClient
      .from("posts")
      .select("*")
      .eq("id", post_id)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      console.error("Post not found:", postError);
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate delay until scheduled time
    const scheduledDate = new Date(scheduled_at);
    const now = new Date();
    let delaySeconds = Math.max(
      0,
      Math.floor((scheduledDate.getTime() - now.getTime()) / 1000),
    );

    if (delaySeconds === 0) {
      return new Response(
        JSON.stringify({ error: "Scheduled time must be in the future" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Smart scheduling: Check for conflicting schedules and add staggering
    // This prevents multiple posts from hitting the platform API simultaneously
    const MIN_STAGGER_SECONDS = 60; // Minimum gap between scheduled posts
    const MAX_RANDOM_DELAY = 120; // Random delay to spread out posts

    // Check for existing schedules around the same time window (±5 minutes)
    const windowStart = new Date(
      scheduledDate.getTime() - 5 * 60 * 1000,
    ).toISOString();
    const windowEnd = new Date(
      scheduledDate.getTime() + 5 * 60 * 1000,
    ).toISOString();

    const { data: conflictingSchedules } = await supabaseClient
      .from("post_schedules")
      .select("id, scheduled_at")
      .gte("scheduled_at", windowStart)
      .lte("scheduled_at", windowEnd)
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true });

    // Add stagger delay if there are conflicting schedules
    if (conflictingSchedules && conflictingSchedules.length > 0) {
      const staggerOffset = conflictingSchedules.length * MIN_STAGGER_SECONDS;
      const randomDelay = Math.floor(Math.random() * MAX_RANDOM_DELAY);
      delaySeconds += staggerOffset + randomDelay;
      console.log(
        `Smart scheduling: Added ${staggerOffset + randomDelay}s delay due to ${
          conflictingSchedules.length
        } conflicting schedules`,
      );
    }

    // Determine which platforms to post to
    const targetPlatforms = platforms || post.platforms || ["twitter"];

    // --- CREDIT DEDUCTION START ---
    let totalCost = 0;
    targetPlatforms.forEach((p: string) => {
      totalCost += p === "twitter" ? 10 : 5;
    });

    if (totalCost > 0) {
      // Fetch current credits
      const { data: userCredits, error: creditError } = await supabaseClient
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (creditError && creditError.code !== "PGRST116") {
        return new Response(
          JSON.stringify({ error: "System error checking credits" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      let currentCredits = userCredits?.credits ?? 100;
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const lastReset = userCredits?.last_reset_date
        ? new Date(userCredits.last_reset_date)
        : new Date(0);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      if (lastReset < currentMonth || !userCredits) {
        currentCredits = 100;
        await supabaseClient
          .from("user_credits")
          .upsert({ user_id: user.id, credits: 100, last_reset_date: today });
      }

      if (currentCredits < totalCost) {
        return new Response(
          JSON.stringify({
            error: `Insufficient credits. Need ${totalCost}, have ${currentCredits}`,
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Deduct
      const { error: deductError } = await supabaseClient
        .from("user_credits")
        .update({ credits: currentCredits - totalCost })
        .eq("user_id", user.id)
        .eq("credits", currentCredits);

      if (deductError) {
        return new Response(
          JSON.stringify({ error: "Transaction failed, please retry" }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }
    // --- CREDIT DEDUCTION END ---

    const scheduleResults: Array<{
      platform: string;
      schedule_id: string;
      qstash_message_id: string;
      status: "scheduled";
    }> = [];

    const attempts: Array<{
      platform: string;
      stage:
        | "create_schedule"
        | "qstash_config"
        | "qstash_publish"
        | "qstash_exception";
      schedule_id?: string;
      status?: number;
      response?: unknown;
      error?: string;
    }> = [];

    for (const platform of targetPlatforms) {
      // Create post_schedule record
      const { data: schedule, error: scheduleError } = await supabaseClient
        .from("post_schedules")
        .insert({
          post_id,
          rule_id,
          scheduled_at,
          platform,
          status: "scheduled",
        })
        .select()
        .single();

      if (scheduleError) {
        console.error("Failed to create schedule:", scheduleError);
        attempts.push({
          platform: String(platform),
          stage: "create_schedule",
          error: String((scheduleError as any)?.message ?? scheduleError),
        });
        continue;
      }

      // Register with QStash
      try {
        if (!qstashToken) {
          attempts.push({
            platform: String(platform),
            stage: "qstash_config",
            schedule_id: schedule.id,
            error: "Missing QSTASH_TOKEN",
          });
          await supabaseClient
            .from("post_schedules")
            .update({
              status: "failed",
              error_message: "Scheduler not configured",
            })
            .eq("id", schedule.id);
          continue;
        }

        const baseUrl = supabaseUrl.startsWith("http")
          ? supabaseUrl
          : `https://${supabaseUrl}`;
        const publishUrl = new URL(
          "/functions/v1/publish-post",
          baseUrl,
        ).toString();

        // QStash v2 expects the destination URL in the path.
        const qstashPublishUrl = `https://qstash.upstash.io/v2/publish/${publishUrl}`;

        const qstashResponse = await fetch(qstashPublishUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${qstashToken}`,
            "Content-Type": "application/json",
            "Upstash-Delay": `${delaySeconds}s`,
            "Upstash-Retries": "3",
          },
          body: JSON.stringify({
            post_id,
            platform,
            schedule_id: schedule.id,
          }),
        });

        const qstashText = await qstashResponse.text();
        let qstashData: any = {};
        try {
          qstashData = qstashText ? JSON.parse(qstashText) : {};
        } catch {
          qstashData = { raw: qstashText };
        }

        console.log("QStash response:", {
          status: qstashResponse.status,
          data: qstashData,
        });

        const messageId = qstashData?.messageId;
        if (!qstashResponse.ok || !messageId) {
          attempts.push({
            platform: String(platform),
            stage: "qstash_publish",
            schedule_id: schedule.id,
            status: qstashResponse.status,
            response: qstashData,
            error: String(qstashData?.error ?? ""),
          });

          const err =
            qstashData?.error ||
            `QStash registration failed (status ${qstashResponse.status})`;
          await supabaseClient
            .from("post_schedules")
            .update({ status: "failed", error_message: String(err) })
            .eq("id", schedule.id);
          continue;
        }

        // Update schedule with QStash message ID
        await supabaseClient
          .from("post_schedules")
          .update({ qstash_message_id: messageId })
          .eq("id", schedule.id);

        scheduleResults.push({
          platform,
          schedule_id: schedule.id,
          qstash_message_id: messageId,
          status: "scheduled",
        });
      } catch (qstashError) {
        console.error("QStash error:", qstashError);
        attempts.push({
          platform: String(platform),
          stage: "qstash_exception",
          schedule_id: schedule.id,
          error: String((qstashError as any)?.message ?? qstashError),
        });
        await supabaseClient
          .from("post_schedules")
          .update({
            status: "failed",
            error_message: "QStash registration failed",
          })
          .eq("id", schedule.id);
        continue;
      }
    }

    if (scheduleResults.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Failed to register schedule with scheduler",
          attempts,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update post status
    await supabaseClient
      .from("posts")
      .update({
        status: "scheduled",
        scheduled_at,
        platforms: targetPlatforms,
      })
      .eq("id", post_id);

    console.log(`Post ${post_id} scheduled successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        schedules: scheduleResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("Schedule post error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
