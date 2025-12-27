import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt token using AES-GCM
async function decryptToken(encryptedToken: string, key: string): Promise<string> {
  try {
    const [ivBase64, encryptedBase64] = encryptedToken.split(':');
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key.slice(0, 32).padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt token');
  }
}

// Strip HTML tags for comparison
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!;

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching timeline for user ${user.id}`);

    // Parse request body for pagination
    let paginationToken: string | null = null;
    try {
      const body = await req.json();
      paginationToken = body?.pagination_token || null;
    } catch {
      // No body or invalid JSON, that's fine
    }

    // Get Twitter platform credentials
    const { data: platformData, error: platformError } = await supabaseClient
      .from('connected_platforms')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .eq('status', 'connected')
      .maybeSingle();

    if (platformError) {
      console.error('Platform query error:', platformError);
      return new Response(JSON.stringify({ error: 'Failed to get platform data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!platformData) {
      console.log('Twitter not connected for user');
      return new Response(JSON.stringify({ tweets: [], connected: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt access token
    const accessToken = await decryptToken(platformData.access_token_encrypted, encryptionKey);
    const twitterUserId = platformData.platform_account_id;

    console.log(`Fetching tweets for Twitter user ${twitterUserId}, pagination: ${paginationToken || 'first page'}`);

    // Fetch user's tweets from Twitter API with pagination
    const tweetsUrl = new URL(`https://api.twitter.com/2/users/${twitterUserId}/tweets`);
    tweetsUrl.searchParams.set('max_results', '10');
    tweetsUrl.searchParams.set('tweet.fields', 'id,text,created_at,public_metrics,source');
    tweetsUrl.searchParams.set('expansions', 'attachments.media_keys');
    tweetsUrl.searchParams.set('media.fields', 'url,preview_image_url,type');
    
    if (paginationToken) {
      tweetsUrl.searchParams.set('pagination_token', paginationToken);
    }

    const tweetsResponse = await fetch(tweetsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!tweetsResponse.ok) {
      const errorData = await tweetsResponse.json();
      console.error('Twitter API error:', JSON.stringify(errorData));
      
      // Handle rate limiting
      if (tweetsResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limited by Twitter. Please wait a moment and try again.',
          rateLimited: true 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // If token expired, mark platform as expired
      if (tweetsResponse.status === 401) {
        await supabaseClient
          .from('connected_platforms')
          .update({ status: 'expired' })
          .eq('id', platformData.id);
        
        return new Response(JSON.stringify({ error: 'Twitter token expired', connected: false }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to fetch tweets' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tweetsData = await tweetsResponse.json();
    console.log(`Fetched ${tweetsData.data?.length || 0} tweets`);

    // Get user's posted posts from our database to mark Plingo posts
    const { data: plingoPosts } = await supabaseClient
      .from('posts')
      .select('content')
      .eq('user_id', user.id)
      .eq('status', 'posted')
      .contains('platforms', ['twitter']);

    // Create a set of normalized Plingo post content for matching
    const plingoContentSet = new Set(
      (plingoPosts || []).map(p => stripHtml(p.content).toLowerCase())
    );

    // Format tweets for the frontend
    const tweets = (tweetsData.data || []).map((tweet: any) => {
      const normalizedText = tweet.text.toLowerCase().trim();
      const isFromPlingo = plingoContentSet.has(normalizedText);
      
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        impressions: tweet.public_metrics?.impression_count || 0,
        quotes: tweet.public_metrics?.quote_count || 0,
        source: tweet.source,
        isFromPlingo,
      };
    });

    return new Response(JSON.stringify({ 
      tweets, 
      connected: true,
      username: platformData.platform_username,
      displayName: platformData.platform_display_name,
      nextToken: tweetsData.meta?.next_token || null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching timeline:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
