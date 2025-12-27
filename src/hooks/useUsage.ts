import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getPlatformLimit } from '@/lib/constants';

export type PlatformType = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'threads' | 'tiktok' | 'youtube' | 'pinterest';

interface UsageData {
  platform: PlatformType;
  postsUsed: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export function useUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Record<PlatformType, UsageData>>({} as Record<PlatformType, UsageData>);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const monthYear = getCurrentMonthYear();
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', monthYear);

      if (error) throw error;

      const usageMap: Record<PlatformType, UsageData> = {} as Record<PlatformType, UsageData>;
      
      // Initialize all platforms with 0 usage
      const platforms: PlatformType[] = ['twitter', 'instagram', 'linkedin', 'facebook', 'threads', 'tiktok', 'youtube', 'pinterest'];
      platforms.forEach(platform => {
        const limit = getPlatformLimit(platform);
        usageMap[platform] = {
          platform,
          postsUsed: 0,
          limit,
          remaining: limit,
          percentage: 0,
        };
      });

      // Update with actual usage data
      data?.forEach(record => {
        const platform = record.platform as PlatformType;
        const limit = getPlatformLimit(platform);
        const postsUsed = record.posts_used;
        usageMap[platform] = {
          platform,
          postsUsed,
          limit,
          remaining: Math.max(0, limit - postsUsed),
          percentage: Math.min(100, (postsUsed / limit) * 100),
        };
      });

      setUsage(usageMap);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkLimit = useCallback((platform: PlatformType): { allowed: boolean; remaining: number } => {
    const platformUsage = usage[platform];
    if (!platformUsage) {
      return { allowed: true, remaining: getPlatformLimit(platform) };
    }
    return {
      allowed: platformUsage.remaining > 0,
      remaining: platformUsage.remaining,
    };
  }, [usage]);

  const incrementUsage = useCallback(async (platform: PlatformType): Promise<boolean> => {
    if (!user) return false;

    const { allowed } = checkLimit(platform);
    if (!allowed) {
      return false;
    }

    try {
      const monthYear = getCurrentMonthYear();
      
      // Try to upsert the usage record
      const { data: existing } = await supabase
        .from('user_usage')
        .select('id, posts_used')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .eq('month_year', monthYear)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_usage')
          .update({ posts_used: existing.posts_used + 1 })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_usage')
          .insert({
            user_id: user.id,
            platform,
            month_year: monthYear,
            posts_used: 1,
          });

        if (error) throw error;
      }

      // Refresh usage data
      await fetchUsage();
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }, [user, checkLimit, fetchUsage]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    isLoading,
    checkLimit,
    incrementUsage,
    refresh: fetchUsage,
  };
}
