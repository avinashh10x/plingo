# Plingo Self-Hosting Migration Guide

This guide covers everything you need to migrate Plingo from Lovable Cloud to your own infrastructure.

---

## 📋 Pre-Migration Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] A Supabase account (free tier works)
- [ ] Twitter Developer account (for OAuth)
- [ ] Upstash account (for QStash scheduling)
- [ ] A hosting provider (Vercel, Netlify, or any static host)


---

## 🗂️ Project Structure Overview

```
plingo/
├── src/                          # Frontend (React + Vite + TypeScript)
│   ├── components/               # UI components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Header, ActivityBar
│   │   ├── panels/               # Sidebar panels
│   │   ├── ai/                   # AI chatbot components
│   │   ├── editor/               # Post editor
│   │   └── feed/                 # Feed display
│   ├── hooks/                    # Custom React hooks
│   ├── pages/                    # Route components
│   ├── stores/                   # Zustand state management
│   └── integrations/supabase/    # Supabase client & types
│
├── supabase/
│   ├── functions/                # Edge Functions (Backend)
│   │   ├── oauth-init/           # Start OAuth flow
│   │   ├── oauth-callback/       # Handle OAuth callback
│   │   ├── schedule-post/        # Schedule post with QStash
│   │   ├── publish-post/         # Publish to social platforms
│   │   ├── bulk-schedule/        # Bulk schedule multiple posts
│   │   ├── generate-content/     # AI content generation
│   │   └── fetch-user-timeline/  # Fetch user's tweets
│   ├── migrations/               # Database schema migrations
│   └── config.toml               # Edge function configuration
│
└── public/                       # Static assets
```

---

## 🚀 Step-by-Step Migration

### Step 1: Export Code from Lovable

1. In Lovable, go to **Project Settings → GitHub**
2. Connect your GitHub account
3. Push the project to a new repository
4. Clone locally:

```bash
git clone https://github.com/YOUR_USERNAME/plingo.git
cd plingo
npm install
```

### Step 2: Remove Lovable-Specific Dependencies

**Update `vite.config.ts`:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// REMOVE this line: import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // REMOVE this line: mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

**Remove the package:**

```bash
npm uninstall lovable-tagger
```

**Delete Lovable-specific files:**

```bash
rm src/tailwind.config.lov.json  # If exists
rm src/App.css                    # Unused boilerplate
```

### Step 3: Create Your Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Note your credentials:
   - **Project Reference ID**: In URL after `/project/`
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **Anon Key**: Settings → API → `anon public`
   - **Service Role Key**: Settings → API → `service_role` (keep secret!)

### Step 4: Deploy Database Schema

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push all migrations (creates tables, RLS policies, triggers)
supabase db push
```

### Step 5: Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy
```

This deploys:
- `oauth-init` - Initiates OAuth flows
- `oauth-callback` - Handles OAuth callbacks
- `schedule-post` - Schedules posts via QStash
- `publish-post` - Publishes to social platforms
- `bulk-schedule` - Bulk scheduling
- `generate-content` - AI content generation
- `fetch-user-timeline` - Fetches user tweets

### Step 6: Configure Secrets

In **Supabase Dashboard → Project Settings → Edge Functions → Secrets**, add:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SUPABASE_URL` | Your project URL | Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Anonymous key | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Dashboard → Settings → API |
| `ENCRYPTION_KEY` | Token encryption | `openssl rand -base64 32` |
| `TWITTER_CLIENT_ID` | Twitter OAuth | Twitter Developer Portal |
| `TWITTER_CLIENT_SECRET` | Twitter OAuth | Twitter Developer Portal |
| `QSTASH_TOKEN` | Scheduling | Upstash Console |
| `QSTASH_CURRENT_SIGNING_KEY` | Webhook verification | Upstash Console |
| `QSTASH_NEXT_SIGNING_KEY` | Key rotation | Upstash Console |
| `GOOGLE_AI_API_KEY` | AI content generation | Google AI Studio |
| `APP_URL` | Your deployed app URL | Your domain |

### Step 7: Configure Frontend Environment

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

### Step 8: Update OAuth Redirect URLs

#### Twitter/X Developer Portal
```
https://pqowreqqqnvsonvhwfez.supabase.co/functions/v1/oauth-callback?platform=twitter

```

#### Google Cloud Console (for user login)
```
https://pqowreqqqnvsonvhwfez.supabase.co/auth/v1/callback

```

### Step 9: Configure Supabase Auth

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**: Your deployed app URL (e.g., `https://plingo.yourdomain.com`)
- **Redirect URLs**: Add all allowed redirect URLs

Enable Google OAuth:
1. Go to **Authentication → Providers**
2. Enable **Google**
3. Add your Google Client ID and Secret

### Step 10: Deploy Frontend

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm run build
# Upload dist/ folder via Netlify UI
```

**Option C: Any Static Host**
```bash
npm run build
# Deploy dist/ folder to your server
```

### Step 11: Post-Deployment

1. Update `APP_URL` secret in Supabase with your production URL
2. Update OAuth redirect URLs in Twitter/Google consoles
3. Test the complete flow

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `connected_platforms` | OAuth tokens (encrypted) |
| `posts` | Post content and metadata |
| `post_schedules` | Scheduled jobs with QStash IDs |
| `schedule_rules` | Recurring schedule patterns |
| `post_logs` | Audit trail |
| `ai_chats` | AI conversation history |
| `agent_settings` | User AI preferences |
| `user_usage` | Monthly usage tracking |

---

## 🔐 Security Architecture

### Token Encryption
- All OAuth tokens encrypted with AES-GCM before storage
- Token hashes stored for integrity verification
- Encryption key stored as secret (never in code)

### QStash Webhook Security
- HMAC signature verification on all scheduled callbacks
- Signature verification is **mandatory** when signing keys are configured
- Rejects requests without valid signatures

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Service role bypasses RLS for edge functions

---

## 📊 How Scheduling Works

```
User schedules post
        ↓
schedule-post Edge Function
        ↓
Creates QStash delayed message
        ↓
QStash stores job with timestamp
        ↓
At scheduled time, QStash calls publish-post
        ↓
publish-post decrypts user's OAuth token
        ↓
Posts to Twitter using USER's token
        ↓
Updates post status in database
```

**Important**: Posts are published using the USER's OAuth access token. Rate limits apply to their account, not your app.

---

## ✅ Post-Migration Testing Checklist

1. [ ] **User Signup**: Create new account → Confirm email works
2. [ ] **User Login**: Sign in → Redirects to dashboard
3. [ ] **Connect Twitter**: OAuth flow → Returns with success
4. [ ] **Create Post**: Write content → Saves as draft
5. [ ] **Schedule Post**: Pick time → Creates QStash job
6. [ ] **Verify Posting**: Check Twitter at scheduled time
7. [ ] **AI Chat**: Ask for content suggestions → Gets response

---

## 🔧 Troubleshooting

### "Failed to connect platform"
- Check OAuth redirect URLs match exactly
- Verify Twitter API credentials are correct
- Check Edge Function logs in Supabase dashboard

### "Post failed to publish"
- Check if token expired (will show "expired" status)
- Verify QStash secrets are configured
- Check publish-post function logs

### "AI not responding"
- Verify `GOOGLE_AI_API_KEY` is set
- Check generate-content function logs

### Database connection issues
- Verify `SUPABASE_URL` and keys are correct
- Check RLS policies if getting permission errors

---

## 📁 Cleaned Up Files

The following unused files have already been removed from the codebase:

- ~~`src/App.css`~~ - Unused Vite boilerplate (deleted)
- ~~`src/components/layout/UserMenu.tsx`~~ - Replaced by Header hamburger menu (deleted)
- ~~`src/components/ai/AgentSettingsDialog.tsx`~~ - Replaced by SettingsPanel (deleted)
- ~~`src/components/ui/chart.tsx`~~ - Not used in app (deleted)
- ~~`src/components/ui/sidebar.tsx`~~ - Custom sidebar used instead (deleted)

---

## 🔗 Quick Reference: All URLs

Replace `YOUR_PROJECT_ID` with your Supabase project ID:

```
# Supabase API
https://YOUR_PROJECT_ID.supabase.co

# Google OAuth Callback (user login)
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback

# Twitter OAuth Callback
https://YOUR_PROJECT_ID.supabase.co/functions/v1/oauth-callback?platform=twitter

# LinkedIn OAuth Callback (if implemented)
https://YOUR_PROJECT_ID.supabase.co/functions/v1/oauth-callback?platform=linkedin
```

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Upstash QStash Docs**: https://upstash.com/docs/qstash
- **Twitter API Docs**: https://developer.twitter.com/en/docs
