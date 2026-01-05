import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'user';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        setRole('user'); // Default to user if error
      } else {
        setRole((data?.role as AppRole) || 'user');
      }
    } catch (error) {
      console.error('Role fetch error:', error);
      setRole('user');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    isLoading,
    refresh: fetchRole,
  };
}
