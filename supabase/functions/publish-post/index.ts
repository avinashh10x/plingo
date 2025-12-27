import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upstash-signature',
};

// QStash signature verification (Upstash-Signature is a JWT)
function base64UrlToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const base64 = normalized + padding;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function normalizeBase64Url(input: string): string {
  return input
    .trim()
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function hmacSha256Base64Url(data: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key.trim()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return bytesToBase64Url(new Uint8Array(sig));
}

async function sha256Base64Url(body: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return bytesToBase64Url(new Uint8Array(digest));
}

// Simplified QStash signature verification - validates HMAC signature, issuer/timing and body hash
async function verifyQStashSignature(opts: {
  signatureJwt: string;
  rawBody: string;
  signingKey: string;
}): Promise<boolean> {
  const parts = opts.signatureJwt.split('.');
  if (parts.length !== 3) {
    console.log('Invalid JWT format - not 3 parts');
    return false;
  }

  const [headerB64, payloadB64, sigB64Raw] = parts;
  let header: any;
  let payload: any;

  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(headerB64)));
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
  } catch (e) {
    console.log('Failed to parse JWT header/payload:', e);
    return false;
  }

  if (header?.alg !== 'HS256') {
    console.log('Invalid algorithm:', header?.alg);
    return false;
  }

  // Verify HMAC signature
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = await hmacSha256Base64Url(signingInput, opts.signingKey);
  if (normalizeBase64Url(expectedSig) !== normalizeBase64Url(sigB64Raw)) {
    console.log('Signature mismatch');
    return false;
  }

  // Verify issuer
  if (payload?.iss !== 'Upstash') {
    console.log('Invalid issuer:', payload?.iss);
    return false;
  }

  // Verify timing
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload?.nbf === 'number' && nowSec < payload.nbf) {
    console.log('Token not yet valid');
    return false;
  }
  if (typeof payload?.exp === 'number' && nowSec > payload.exp) {
    console.log('Token expired');
    return false;
  }

  // Verify body hash (Upstash uses Base64Url; some SDKs include padding '=')
  const payloadBody = typeof payload?.body === 'string' ? payload.body : '';
  if (!payloadBody) {
    console.log('Missing body claim');
    return false;
  }

  const bodyHash = await sha256Base64Url(opts.rawBody);
  if (normalizeBase64Url(payloadBody) !== normalizeBase64Url(bodyHash)) {
    console.log('Body hash mismatch, expected:', payloadBody, 'got:', bodyHash);
    return false;
  }

  return true;
}

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

// Hash token for integrity check
function hashToken(token: string): string {
  const hash = createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}

// Content validation constants
const MAX_CONTENT_LENGTH = 10000; // Maximum raw HTML content length
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'code', 'pre'];
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
  /data:/gi,
];

// Server-side content sanitization
function sanitizeHtmlContent(html: string): { isValid: boolean; sanitized: string; error?: string } {
  // Check length limit
  if (html.length > MAX_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` 
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(html)) {
      console.warn('Dangerous content pattern detected and blocked');
      return { 
        isValid: false, 
        sanitized: '', 
        error: 'Content contains potentially dangerous elements' 
      };
    }
  }

  // Remove dangerous attributes while preserving content
  let sanitized = html
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/\s*javascript:[^"'\s]*/gi, '')        // Remove javascript: URLs
    .replace(/\s*data:[^"'\s]*/gi, '');             // Remove data: URLs

  return { isValid: true, sanitized };
}

// Strip HTML tags and decode entities for plain text posting
function htmlToPlainText(html: string): string {
  // First sanitize the input
  const { sanitized } = sanitizeHtmlContent(html);
  const safeHtml = sanitized || html;
  
  // Remove HTML tags
  let text = safeHtml.replace(/<[^>]*>/g, '');
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Platform adapters
const platformAdapters: Record<string, {
  post: (content: string, accessToken: string) => Promise<{ success: boolean; postId?: string; error?: string }>;
}> = {
  twitter: {
    post: async (content: string, accessToken: string) => {
      console.log('Posting to Twitter...');
      
      // OAuth 2.0 Bearer Token approach
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      
      const data = await response.json();
      console.log('Twitter API response status:', response.status, response.ok ? 'success' : 'failed');
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || data.title || 'Twitter API error' 
        };
      }
      
      return { success: true, postId: data.data?.id };
    }
  },
  linkedin: {
    post: async (content: string, accessToken: string) => {
      console.log('Posting to LinkedIn...');
      
      // Get user info first
      const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!userResponse.ok) {
        return { success: false, error: 'Failed to get LinkedIn user info' };
      }
      
      const userData = await userResponse.json();
      const personId = userData.sub;
      
      // Create post
      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:person:${personId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: content },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || 'LinkedIn API error' };
      }
      
      return { success: true, postId: data.id };
    }
  },
  instagram: {
    post: async (content: string, _accessToken: string) => {
      // Instagram requires media, text-only posts not supported via API
      console.log('Instagram posting - requires media attachment');
      return { success: false, error: 'Instagram requires media for posts' };
    }
  },
  facebook: {
    post: async (content: string, accessToken: string) => {
      console.log('Posting to Facebook...');
      
      const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          access_token: accessToken,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error?.message || 'Facebook API error' };
      }
      
      return { success: true, postId: data.id };
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!;
  const qstashCurrentKey = Deno.env.get('QSTASH_CURRENT_SIGNING_KEY');
  const qstashNextKey = Deno.env.get('QSTASH_NEXT_SIGNING_KEY');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const rawBody = await req.text();
    const signatureJwt = req.headers.get('Upstash-Signature') ?? req.headers.get('upstash-signature');

    // Verify QStash signature - MANDATORY when signing keys are configured
    const hasSigningKeys = qstashCurrentKey || qstashNextKey;
    
    if (signatureJwt) {
      console.log('Verifying QStash signature...');
      
      // Parse JWT to get the actual 'sub' claim for URL matching
      const parts = signatureJwt.split('.');
      let jwtPayload: { sub?: string; body?: string; iss?: string } | null = null;
      
      if (parts.length === 3) {
        try {
          const payloadB64 = parts[1];
          const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
          const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
          jwtPayload = JSON.parse(atob(normalized + padding));
          console.log('QStash request received from:', jwtPayload?.iss || 'unknown');
        } catch (e) {
          console.error('Failed to parse JWT payload');
        }
      }
      
      const isValidCurrent = qstashCurrentKey
        ? await verifyQStashSignature({
            signatureJwt,
            rawBody,
            signingKey: qstashCurrentKey,
          })
        : false;

      const isValidNext = !isValidCurrent && qstashNextKey
        ? await verifyQStashSignature({
            signatureJwt,
            rawBody,
            signingKey: qstashNextKey,
          })
        : false;

      if (!isValidCurrent && !isValidNext) {
        console.error('Invalid QStash signature - verification failed');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('QStash signature verified successfully');
    } else if (hasSigningKeys) {
      // Signature is missing but signing keys are configured - reject request
      console.error('Missing QStash signature - request rejected');
      return new Response(JSON.stringify({ error: 'Unauthorized - signature required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { post_id, platform, schedule_id } = JSON.parse(rawBody);
    
    console.log(`Publishing post ${post_id} to ${platform}`);
    
    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post_id)
      .single();
    
    if (postError || !post) {
      console.error('Post not found:', postError);
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Update status to posting
    await supabase
      .from('posts')
      .update({ status: 'posting' })
      .eq('id', post_id);
    
    // Get platform credentials
    const { data: platformData, error: platformError } = await supabase
      .from('connected_platforms')
      .select('*')
      .eq('user_id', post.user_id)
      .eq('platform', platform)
      .eq('status', 'connected')
      .single();
    
    if (platformError || !platformData) {
      console.error('Platform not connected:', platformError);
      
      await supabase
        .from('posts')
        .update({ 
          status: 'failed', 
          error_message: `${platform} not connected` 
        })
        .eq('id', post_id);
      
      return new Response(JSON.stringify({ error: 'Platform not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Decrypt access token
    let accessToken = await decryptToken(platformData.access_token_encrypted, encryptionKey);

    // Check if token is expired and refresh if needed
    if (platformData.expires_at && new Date(platformData.expires_at) < new Date()) {
      console.log('Token expired, attempting refresh...');

      // Mark as expired if no refresh token
      if (!platformData.refresh_token_encrypted) {
        await supabase
          .from('connected_platforms')
          .update({ status: 'expired' })
          .eq('id', platformData.id);

        const msg = 'Token expired, please reconnect platform';

        await supabase
          .from('posts')
          .update({ status: 'failed', error_message: msg })
          .eq('id', post_id);

        if (schedule_id) {
          await supabase
            .from('post_schedules')
            .update({ status: 'failed', error_message: msg })
            .eq('id', schedule_id);
        }

        return new Response(JSON.stringify({ error: 'Token expired' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const refreshToken = await decryptToken(platformData.refresh_token_encrypted, encryptionKey);

      if (platform === 'twitter') {
        const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID');
        const twitterClientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');

        if (!twitterClientId || !twitterClientSecret) {
          const msg = 'Twitter credentials not configured';
          console.error(msg);

          await supabase
            .from('connected_platforms')
            .update({ status: 'error' })
            .eq('id', platformData.id);

          await supabase
            .from('posts')
            .update({ status: 'failed', error_message: msg })
            .eq('id', post_id);

          if (schedule_id) {
            await supabase
              .from('post_schedules')
              .update({ status: 'failed', error_message: msg })
              .eq('id', schedule_id);
          }

          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${twitterClientId}:${twitterClientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });

        const tokenText = await tokenResponse.text();
        let tokens: any = {};
        try {
          tokens = tokenText ? JSON.parse(tokenText) : {};
        } catch {
          tokens = { raw: tokenText };
        }

        if (!tokenResponse.ok || tokens?.error) {
          const err = String(tokens?.error_description ?? tokens?.error ?? `Twitter refresh failed (status ${tokenResponse.status})`);
          console.error('Twitter token refresh failed:', err, tokens);

          await supabase
            .from('connected_platforms')
            .update({ status: 'expired' })
            .eq('id', platformData.id);

          await supabase
            .from('posts')
            .update({ status: 'failed', error_message: err })
            .eq('id', post_id);

          if (schedule_id) {
            await supabase
              .from('post_schedules')
              .update({ status: 'failed', error_message: err })
              .eq('id', schedule_id);
          }

          return new Response(JSON.stringify({ error: err }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!tokens?.access_token) {
          const err = 'Twitter refresh response missing access_token';
          console.error(err, tokens);
          throw new Error(err);
        }

        const nowIso = new Date().toISOString();
        const expiresAt = typeof tokens?.expires_in === 'number'
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null;

        const updatedAccessToken = String(tokens.access_token);
        const updates: Record<string, unknown> = {
          access_token_encrypted: await encryptToken(updatedAccessToken, encryptionKey),
          access_token_hash: hashToken(updatedAccessToken),
          expires_at: expiresAt,
          status: 'connected',
          updated_at: nowIso,
        };

        if (typeof tokens?.refresh_token === 'string' && tokens.refresh_token) {
          const updatedRefreshToken = String(tokens.refresh_token);
          updates.refresh_token_encrypted = await encryptToken(updatedRefreshToken, encryptionKey);
          updates.refresh_token_hash = hashToken(updatedRefreshToken);
        }

        if (typeof tokens?.scope === 'string') {
          updates.scope = tokens.scope;
        }

        await supabase
          .from('connected_platforms')
          .update(updates)
          .eq('id', platformData.id);

        accessToken = updatedAccessToken;
        console.log('Twitter token refreshed successfully');
      } else {
        console.log(`Token refresh not yet implemented for platform: ${platform}`);
      }
    }

    // Get the platform adapter
    const adapter = platformAdapters[platform];
    
    if (!adapter) {
      await supabase
        .from('posts')
        .update({ 
          status: 'failed', 
          error_message: `Platform ${platform} not supported` 
        })
        .eq('id', post_id);
      
      return new Response(JSON.stringify({ error: 'Platform not supported' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and sanitize content before posting
    const contentValidation = sanitizeHtmlContent(post.content);
    if (!contentValidation.isValid) {
      console.error('Content validation failed:', contentValidation.error);
      
      await supabase
        .from('posts')
        .update({ 
          status: 'failed', 
          error_message: contentValidation.error || 'Content validation failed' 
        })
        .eq('id', post_id);
      
      return new Response(JSON.stringify({ error: contentValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert sanitized HTML content to plain text before posting
    const plainTextContent = htmlToPlainText(contentValidation.sanitized);

    // Check usage limit before posting
    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const POST_LIMIT = 20; // Monthly limit per platform
    
    const { data: usageData } = await supabase
      .from('user_usage')
      .select('posts_used')
      .eq('user_id', post.user_id)
      .eq('platform', platform)
      .eq('month_year', monthYear)
      .single();
    
    const currentUsage = usageData?.posts_used ?? 0;
    
    if (currentUsage >= POST_LIMIT) {
      const limitError = `Monthly limit of ${POST_LIMIT} posts for ${platform} exceeded`;
      console.log(limitError);
      
      await supabase
        .from('posts')
        .update({ status: 'failed', error_message: limitError })
        .eq('id', post_id);
      
      if (schedule_id) {
        await supabase
          .from('post_schedules')
          .update({ status: 'failed', error_message: limitError })
          .eq('id', schedule_id);
      }
      
      return new Response(JSON.stringify({ error: limitError }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Post using adapter
    const result = await adapter.post(plainTextContent, accessToken);
    
    if (result.success) {
      // Increment usage counter
      if (usageData) {
        await supabase
          .from('user_usage')
          .update({ posts_used: currentUsage + 1 })
          .eq('user_id', post.user_id)
          .eq('platform', platform)
          .eq('month_year', monthYear);
      } else {
        await supabase
          .from('user_usage')
          .insert({
            user_id: post.user_id,
            platform,
            month_year: monthYear,
            posts_used: 1,
          });
      }
      
      // Update post status
      await supabase
        .from('posts')
        .update({ 
          status: 'posted', 
          posted_at: new Date().toISOString() 
        })
        .eq('id', post_id);
      
      // Update schedule status if applicable
      if (schedule_id) {
        await supabase
          .from('post_schedules')
          .update({ 
            status: 'executed',
            executed_at: new Date().toISOString()
          })
          .eq('id', schedule_id);
      }
      
      // Log success
      await supabase
        .from('post_logs')
        .insert({
          post_id,
          action: 'posted',
          platform,
          details: { post_id: result.postId }
        });
      
      console.log(`Successfully posted to ${platform}, post ID: ${result.postId}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        postId: result.postId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Handle failure
      await supabase
        .from('posts')
        .update({ 
          status: 'failed', 
          error_message: result.error 
        })
        .eq('id', post_id);
      
      if (schedule_id) {
        await supabase
          .from('post_schedules')
          .update({ 
            status: 'failed',
            error_message: result.error
          })
          .eq('id', schedule_id);
      }
      
      // Log failure
      await supabase
        .from('post_logs')
        .insert({
          post_id,
          action: 'failed',
          platform,
          details: { error: result.error }
        });
      
      console.error(`Failed to post to ${platform}:`, result.error);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: unknown) {
    console.error('Publish post error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
