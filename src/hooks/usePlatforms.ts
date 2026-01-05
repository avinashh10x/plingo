import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type PlatformType = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'threads' | 'tiktok' | 'youtube' | 'pinterest';
export type ConnectionStatus = 'connected' | 'expired' | 'revoked' | 'error';

export interface ConnectedPlatform {
  id: string;
  platform: PlatformType;
  platform_account_id: string;
  platform_username: string | null;
  platform_display_name: string | null;
  status: ConnectionStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePlatforms() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<PlatformType | null>(null);

  const fetchPlatforms = useCallback(async () => {
    if (!user) {
      setPlatforms([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('connected_platforms')
        .select('id, platform, platform_account_id, platform_username, platform_display_name, status, expires_at, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlatforms((data || []) as ConnectedPlatform[]);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlatforms();
    }
  }, [isAuthenticated, fetchPlatforms]);

  const connectPlatform = async (platform: PlatformType) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to connect platforms.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(platform);

    try {
      // Get current session to pass auth header explicitly
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('oauth-init', {
        body: { platform },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to OAuth provider
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (err: unknown) {
      console.error('Connect platform error:', err);

      // Supabase Functions errors often hide the real backend message inside `context`.
      const anyErr = err as any;
      const context = anyErr?.context;

      const baseMessage =
        typeof anyErr?.message === 'string'
          ? anyErr.message
          : err instanceof Error
            ? err.message
            : 'Failed to initiate connection';

      const contextStatus =
        typeof context?.status === 'number'
          ? context.status
          : typeof anyErr?.status === 'number'
            ? anyErr.status
            : undefined;

      const contextBody =
        typeof context?.body === 'string'
          ? context.body
          : context?.body
            ? JSON.stringify(context.body)
            : undefined;

      const description = [
        baseMessage,
        contextStatus ? `Status: ${contextStatus}` : null,
        contextBody ? `Body: ${contextBody}` : null,
      ]
        .filter(Boolean)
        .join(' — ');

      toast({
        title: 'Connection failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    try {
      const { error } = await supabase
        .from('connected_platforms')
        .delete()
        .eq('id', platformId);

      if (error) throw error;

      setPlatforms(prev => prev.filter(p => p.id !== platformId));
      
      toast({
        title: 'Platform disconnected',
        description: 'The platform has been removed from your account.',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect platform.',
        variant: 'destructive',
      });
    }
  };

  const getPlatformStatus = (platform: PlatformType): ConnectedPlatform | undefined => {
    return platforms.find(p => p.platform === platform && p.status === 'connected');
  };

  const isConnected = (platform: PlatformType): boolean => {
    return platforms.some(p => p.platform === platform && p.status === 'connected');
  };

  return {
    platforms,
    isLoading,
    isConnecting,
    connectPlatform,
    disconnectPlatform,
    getPlatformStatus,
    isConnected,
    refresh: fetchPlatforms,
  };
}
