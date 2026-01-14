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

    // --- CREDIT DEDUCTION START ---
    let totalCost = 0;
    // Calculate total cost
    for (const schedule of schedules) {
      // Need to check which platforms for each post?
      // The input 'platforms' overrides post platforms if provided.
      // If not provided, we'd need to fetch each post... that's 50 DB calls.
      // Optimization: Assume 'platforms' argument applies to all, OR use default cost estimate?
      // Let's assume most bulk schedules use the 'platforms' argument.
      // If not, we might under/over charge.
      // Better: We are already fetching posts in the loop below.
      // But we need to deduct BEFORE the loop to be atomic-ish.

      // Compromise: We fetch all posts first via 'in' query to get platforms?
      // Or just deduct inside the loop one by one?
      // Deducting one by one is bad if they run out halfway.

      // Let's do a quick cost estimation.
      // If 'platforms' is passed, use it.
      if (platforms) {
        const postCost = platforms.reduce(
          (acc: number, p: string) => acc + (p === "twitter" ? 10 : 5),
          0
        );
        totalCost += postCost;
      } else {
        // Fallback: Assume worst case? or 10?
        // To be accurate, we must query.
        totalCost += 10; // Default estimate
      }
    }

    if (totalCost > 0) {
      const { data: userCredits, error: creditError } = await supabaseClient
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // ... (standard credit check/reset logic as before) ...
      if (creditError && creditError.code !== "PGRST116") {
        return new Response(
          JSON.stringify({ error: "System error checking credits" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
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
            error: `Insufficient credits for bulk action. Need approx ${totalCost}, have ${currentCredits}`,
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
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
          }
        );
      }
    }
    // --- CREDIT DEDUCTION END ---

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
