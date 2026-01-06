import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Encrypt token using AES-GCM
async function encryptToken(token: string, key: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key.slice(0, 32).padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    new TextEncoder().encode(token)
  );
  
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  
  return `${ivBase64}:${encryptedBase64}`;
}

// Hash token for integrity check
function hashToken(token: string): string {
  const hash = createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const platform = url.searchParams.get('platform');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Contains user_id
  const error = url.searchParams.get('error');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Base redirect URL (falls back for error cases where `state` isn't available)
  let redirectBaseUrl = Deno.env.get('APP_URL') || 'https://plingo.byavi.in';
  
  if (error) {
    console.error('OAuth error:', error);
    return Response.redirect(`${redirectBaseUrl}/dashboard?error=${encodeURIComponent(error)}`);
  }

  if (!platform || !code || !state) {
    console.error('Missing parameters');
    return Response.redirect(`${redirectBaseUrl}/dashboard?error=missing_params`);
  }
  
  try {
    // Parse state to get user_id
    const stateData = JSON.parse(atob(state));
    const userId = stateData.user_id;

    // Prefer redirecting back to the origin that initiated the OAuth flow (preview vs prod)
    const stateOrigin = typeof stateData?.app_origin === 'string' ? stateData.app_origin : null;
    if (stateOrigin && /^https?:\/\//.test(stateOrigin)) {
      redirectBaseUrl = stateOrigin.replace(/\/$/, '');
    }

    if (!userId) {
      throw new Error('Invalid state - no user_id');
    }

    console.log(`Processing OAuth callback for ${platform}, user: ${userId}`);

    let tokenData: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
      account_id: string;
      username?: string;
      display_name?: string;
    };
    
    // Exchange code for tokens based on platform
    switch (platform) {
      case 'twitter': {
        const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID')!;
        const twitterClientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')!;
        const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback?platform=twitter`;
        
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${twitterClientId}:${twitterClientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: stateData.code_verifier || 'challenge',
          }),
        });
        
        const tokens = await tokenResponse.json();
        console.log('Twitter token exchange completed, status:', tokenResponse.ok ? 'success' : 'failed');
        
        if (tokens.error) {
          throw new Error(tokens.error_description || tokens.error);
        }
        
        // Get user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });
        const userData = await userResponse.json();
        
        tokenData = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          scope: tokens.scope,
          account_id: userData.data?.id || 'unknown',
          username: userData.data?.username,
          display_name: userData.data?.name,
        };
        break;
      }
      
      case 'linkedin': {
        const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
        const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
        const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback?platform=linkedin`;
        
        if (!linkedinClientId || !linkedinClientSecret) {
          throw new Error('LinkedIn credentials not configured');
        }
        
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: linkedinClientId,
            client_secret: linkedinClientSecret,
          }),
        });
        
        const tokens = await tokenResponse.json();
        
        if (tokens.error) {
          throw new Error(tokens.error_description || tokens.error);
        }
        
        // Get user info
        const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });
        const userData = await userResponse.json();
        
        tokenData = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          scope: tokens.scope,
          account_id: userData.sub || 'unknown',
          display_name: userData.name,
        };
        break;
      }
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Encrypt tokens
    const accessTokenEncrypted = await encryptToken(tokenData.access_token, encryptionKey);
    const refreshTokenEncrypted = tokenData.refresh_token 
      ? await encryptToken(tokenData.refresh_token, encryptionKey)
      : null;
    
    // Hash tokens for integrity
    const accessTokenHash = hashToken(tokenData.access_token);
    const refreshTokenHash = tokenData.refresh_token ? hashToken(tokenData.refresh_token) : null;
    
    // Calculate expiry
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;
    
    // Upsert platform connection
    const { error: upsertError } = await supabase
      .from('connected_platforms')
      .upsert({
        user_id: userId,
        platform,
        platform_account_id: tokenData.account_id,
        platform_username: tokenData.username,
        platform_display_name: tokenData.display_name,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        access_token_hash: accessTokenHash,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
        scope: tokenData.scope,
        status: 'connected',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform,platform_account_id'
      });
    
    if (upsertError) {
      console.error('Failed to save platform connection:', upsertError);
      throw new Error('Failed to save connection');
    }
    
    console.log(`Successfully connected ${platform} for user ${userId}`);

    return Response.redirect(`${redirectBaseUrl}/dashboard?connected=${platform}`);

  } catch (error: unknown) {
    console.error('OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.redirect(`${redirectBaseUrl}/dashboard?error=${encodeURIComponent(message)}`);
  }
});
