import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type ScheduleType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface ScheduleRule {
  id: string;
  name: string | null;
  type: ScheduleType;
  time: string;
  days: string[] | null;
  timezone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleRuleInput {
  name?: string;
  type: ScheduleType;
  time: string;
  days?: string[];
  timezone?: string;
}

export function useScheduleRules() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    if (!user) {
      setRules([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('schedule_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('time', { ascending: true });

      if (error) throw error;

      setRules((data || []) as ScheduleRule[]);
    } catch (error) {
      console.error('Error fetching schedule rules:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRules();
    }
  }, [isAuthenticated, fetchRules]);

  const createRule = async (input: CreateScheduleRuleInput): Promise<ScheduleRule | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('schedule_rules')
        .insert({
          user_id: user.id,
          name: input.name || null,
          type: input.type,
          time: input.time,
          days: input.days || [],
          timezone: input.timezone || 'UTC',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newRule = data as ScheduleRule;
      setRules(prev => [...prev, newRule]);
      
      toast({
        title: 'Schedule rule created',
        description: 'Your new posting schedule has been saved.',
      });

      return newRule;
    } catch (error) {
      console.error('Create rule error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create schedule rule.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRule = async (id: string, updates: Partial<ScheduleRule>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schedule_rules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      
      toast({
        title: 'Schedule updated',
        description: 'Your changes have been saved.',
      });

      return true;
    } catch (error) {
      console.error('Update rule error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update schedule rule.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schedule_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: 'Schedule deleted',
        description: 'The schedule rule has been removed.',
      });

      return true;
    } catch (error) {
      console.error('Delete rule error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule rule.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleRule = async (id: string): Promise<boolean> => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return false;

    return updateRule(id, { is_active: !rule.is_active });
  };

  const activeRules = rules.filter(r => r.is_active);

  return {
    rules,
    activeRules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refresh: fetchRules,
  };
}