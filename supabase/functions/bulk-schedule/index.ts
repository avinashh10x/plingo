import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRule {
  type: 'daily' | 'weekdays' | 'weekends' | 'custom';
  days?: string[];
  time: string; // HH:MM format
  timezone: string;
}

// Calculate next scheduled dates based on rule
function calculateScheduleDates(
  rule: ScheduleRule,
  count: number,
  startFrom: Date = new Date()
): Date[] {
  const dates: Date[] = [];
  const [hours, minutes] = rule.time.split(':').map(Number);
  
  let currentDate = new Date(startFrom);
  currentDate.setHours(hours, minutes, 0, 0);
  
  // If current time has passed today, start from tomorrow
  if (currentDate <= new Date()) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const getDayName = (date: Date): string => {
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
  };
  
  const isValidDay = (date: Date): boolean => {
    const dayName = getDayName(date);
    const dayNum = date.getDay();
    
    switch (rule.type) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayNum >= 1 && dayNum <= 5;
      case 'weekends':
        return dayNum === 0 || dayNum === 6;
      case 'custom':
        return rule.days?.includes(dayName) || false;
      default:
        return false;
    }
  };
  
  while (dates.length < count) {
    if (isValidDay(currentDate)) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Safety limit
    if (currentDate.getTime() - startFrom.getTime() > 365 * 24 * 60 * 60 * 1000) {
      break;
    }
  }
  
  return dates;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const qstashToken = Deno.env.get('QSTASH_TOKEN');

  const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Unauthorized', details: 'Empty token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message ?? 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { post_ids, rule, platforms } = await req.json();
    
    if (!post_ids || !Array.isArray(post_ids) || post_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No posts provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!rule || !rule.type || !rule.time) {
      return new Response(JSON.stringify({ error: 'Invalid schedule rule' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Bulk scheduling ${post_ids.length} posts with rule:`, rule);
    
    // Verify all posts belong to user
    const { data: posts, error: postsError } = await supabaseClient
      .from('posts')
      .select('id, content, platforms')
      .in('id', post_ids)
      .eq('user_id', user.id);
    
    if (postsError || !posts || posts.length !== post_ids.length) {
      return new Response(JSON.stringify({ error: 'Some posts not found or unauthorized' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Calculate schedule dates
    const scheduleDates = calculateScheduleDates(rule, post_ids.length);
    
    if (scheduleDates.length < post_ids.length) {
      return new Response(JSON.stringify({ 
        error: `Could only schedule ${scheduleDates.length} of ${post_ids.length} posts within the next year` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create schedule rule in DB
    const { data: savedRule, error: ruleError } = await supabaseClient
      .from('schedule_rules')
      .insert({
        user_id: user.id,
        type: rule.type,
        days: rule.days || [],
        time: rule.time,
        timezone: rule.timezone || 'UTC',
        is_active: true
      })
      .select()
      .single();
    
    if (ruleError) {
      console.error('Failed to save rule:', ruleError);
      throw new Error('Failed to save schedule rule');
    }
    
    const results = [];
    
    // Schedule each post
    for (let i = 0; i < post_ids.length; i++) {
      const postId = post_ids[i];
      const scheduledAt = scheduleDates[i];
      const post = posts.find(p => p.id === postId);
      const targetPlatforms = platforms || post?.platforms || ['twitter'];
      
      // Create schedule record
      const { data: schedule, error: scheduleError } = await supabaseClient
        .from('post_schedules')
        .insert({
          post_id: postId,
          rule_id: savedRule.id,
          scheduled_at: scheduledAt.toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();
      
      if (scheduleError) {
        console.error(`Failed to schedule post ${postId}:`, scheduleError);
        results.push({
          post_id: postId,
          success: false,
          error: 'Failed to create schedule'
        });
        continue;
      }
      
      // Update post status
      await supabaseClient
        .from('posts')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString(),
          platforms: targetPlatforms
        })
        .eq('id', postId);
      
      // Register with QStash for each platform
      if (qstashToken) {
        for (const platform of targetPlatforms) {
          const delaySeconds = Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000));
          
           try {
             if (!qstashToken) {
               console.error('Scheduler not configured: missing QSTASH_TOKEN');
               await supabaseClient
                 .from('post_schedules')
                 .update({ status: 'failed', error_message: 'Scheduler not configured' })
                 .eq('id', schedule.id);
               continue;
             }

              const baseUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
              const publishUrl = new URL('/functions/v1/publish-post', baseUrl).toString();
              const qstashPublishUrl = `https://qstash.upstash.io/v2/publish/${publishUrl}`;

             const qstashResponse = await fetch(qstashPublishUrl, {
               method: 'POST',
               headers: {
                 'Authorization': `Bearer ${qstashToken}`,
                 'Content-Type': 'application/json',
                 'Upstash-Delay': `${delaySeconds}s`,
                 'Upstash-Retries': '3',
               },
               body: JSON.stringify({
                 post_id: postId,
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

             const messageId = qstashData?.messageId;
             if (!qstashResponse.ok || !messageId) {
               const err = qstashData?.error || `QStash registration failed (status ${qstashResponse.status})`;
               await supabaseClient
                 .from('post_schedules')
                 .update({ status: 'failed', error_message: String(err) })
                 .eq('id', schedule.id);
               continue;
             }

             await supabaseClient
               .from('post_schedules')
               .update({ qstash_message_id: messageId })
               .eq('id', schedule.id);
           } catch (qstashError) {
             console.error('QStash registration failed:', qstashError);
             await supabaseClient
               .from('post_schedules')
               .update({ status: 'failed', error_message: 'QStash registration failed' })
               .eq('id', schedule.id);
           }
        }
      }
      
      results.push({
        post_id: postId,
        success: true,
        scheduled_at: scheduledAt.toISOString(),
        schedule_id: schedule.id
      });
    }
    
    console.log(`Bulk scheduled ${results.filter(r => r.success).length}/${post_ids.length} posts`);
    
    return new Response(JSON.stringify({
      success: true,
      rule_id: savedRule.id,
      scheduled: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Bulk schedule error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
