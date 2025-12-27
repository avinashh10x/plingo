// Usage limits per platform per month
export const USAGE_LIMITS = {
  twitter: 20,
  // Add more platforms here as needed
  instagram: 20,
  linkedin: 20,
  facebook: 20,
  threads: 20,
  tiktok: 20,
  youtube: 20,
  pinterest: 20,
} as const;

// Default limit for any platform not explicitly defined
export const DEFAULT_POST_LIMIT = 20;

// Smart scheduling settings
export const SCHEDULING_CONFIG = {
  // Minimum delay between scheduled posts (in seconds) to prevent rate limit conflicts
  MIN_STAGGER_DELAY_SECONDS: 60,
  // Maximum random delay added to scheduled posts (in seconds)
  MAX_RANDOM_DELAY_SECONDS: 120,
} as const;

// Get limit for a specific platform
export function getPlatformLimit(platform: string): number {
  return USAGE_LIMITS[platform as keyof typeof USAGE_LIMITS] ?? DEFAULT_POST_LIMIT;
}
