// Twitter Free Tier API Limits (app-wide) - Reference only
export const TWITTER_API_LIMITS = {
  write: 500, // 500 tweets per month for the app
  read: 100, // ~100 read requests per 15 min window
} as const;

// Smart scheduling settings
export const SCHEDULING_CONFIG = {
  // Minimum delay between scheduled posts (in seconds) to prevent rate limit conflicts
  MIN_STAGGER_DELAY_SECONDS: 60,
  // Maximum random delay added to scheduled posts (in seconds)
  MAX_RANDOM_DELAY_SECONDS: 120,
} as const;
