import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const qstashToken = Deno.env.get("QSTASH_TOKEN");

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
      }
    );
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: authError?.message ?? "Invalid session",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { schedules, platforms } = await req.json();

    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return new Response(JSON.stringify({ error: "No schedules provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Bulk scheduling ${schedules.length} posts`);

    const results = [];

    // Schedule each post - same as single post scheduling
    for (const schedule of schedules) {
      const { post_id, scheduled_at } = schedule;

      // Verify post belongs to user
      const { data: post, error: postError } = await supabaseClient
        .from("posts")
        .select("*")
        .eq("id", post_id)
        .eq("user_id", user.id)
        .single();

      if (postError || !post) {
        console.error(`Post ${post_id} not found:`, postError);
        results.push({
          post_id: post_id,
          success: false,
          error: "Post not found",
        });
        continue;
      }

      // Validate scheduled time is in future
      const scheduledDate = new Date(scheduled_at);
      const now = new Date();
      const delaySeconds = Math.max(
        0,
        Math.floor((scheduledDate.getTime() - now.getTime()) / 1000)
      );

      if (delaySeconds === 0) {
        results.push({
          post_id: post_id,
          success: false,
          error: "Scheduled time must be in the future",
        });
        continue;
      }

      // Determine platforms
      const targetPlatforms = platforms || post.platforms || ["twitter"];

      let scheduleSuccess = false;

      for (const platform of targetPlatforms) {
        // Create schedule record
        const { data: scheduleRecord, error: scheduleError } =
          await supabaseClient
            .from("post_schedules")
            .insert({
              post_id: post_id,
              scheduled_at: scheduled_at,
              status: "scheduled",
            })
            .select()
            .single();

        if (scheduleError) {
          console.error(
            `Failed to create schedule for ${post_id}:`,
            scheduleError
          );
          continue;
        }

        // Register with QStash
        if (qstashToken) {
          try {
            const baseUrl = supabaseUrl.startsWith("http")
              ? supabaseUrl
              : `https://${supabaseUrl}`;
            const publishUrl = new URL(
              "/functions/v1/publish-post",
              baseUrl
            ).toString();
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
                post_id: post_id,
                platform,
                schedule_id: scheduleRecord.id,
              }),
            });

            const qstashText = await qstashResponse.text();
            let qstashData: any = {};
            try {
              qstashData = qstashText ? JSON.parse(qstashText) : {};
            } catch {
              qstashData = { raw: qstashText };
            }

            const messageId = qstashData?.messageId;
            if (!qstashResponse.ok || !messageId) {
              const err =
                qstashData?.error ||
                `QStash failed (status ${qstashResponse.status})`;
              await supabaseClient
                .from("post_schedules")
                .update({ status: "failed", error_message: String(err) })
                .eq("id", scheduleRecord.id);
              continue;
            }

            // Update schedule with QStash message ID
            await supabaseClient
              .from("post_schedules")
              .update({ qstash_message_id: messageId })
              .eq("id", scheduleRecord.id);

            scheduleSuccess = true;
          } catch (qstashError) {
            console.error("QStash error:", qstashError);
            await supabaseClient
              .from("post_schedules")
              .update({
                status: "failed",
                error_message: "QStash registration failed",
              })
              .eq("id", scheduleRecord.id);
          }
        } else {
          scheduleSuccess = true;
        }
      }

      if (scheduleSuccess) {
        // THIS IS THE KEY: Update post status to 'scheduled'
        await supabaseClient
          .from("posts")
          .update({
            status: "scheduled",
            scheduled_at: scheduled_at,
            platforms: targetPlatforms,
          })
          .eq("id", post_id);

        results.push({
          post_id: post_id,
          success: true,
          scheduled_at: scheduled_at,
        });
      } else {
        results.push({
          post_id: post_id,
          success: false,
          error: "Failed to register with scheduler",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`Bulk scheduled ${successCount}/${schedules.length} posts`);

    return new Response(
      JSON.stringify({
        success: true,
        scheduled: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Bulk schedule error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
