import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface AgentSettings {
  id: string;
  user_identity: string | null;
  guidelines: string | null;
  character_prompt: string | null;
}

export const useAgentSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_settings')
        .select('id, user_identity, guidelines, character_prompt')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching agent settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (userIdentity: string, characterPrompt: string, guidelines: string) => {
    if (!user) return false;
    
    setIsSaving(true);
    try {
      if (settings) {
        // Update existing
        const { error } = await supabase
          .from('agent_settings')
          .update({
            user_identity: userIdentity,
            character_prompt: characterPrompt,
            guidelines
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('agent_settings')
          .insert({
            user_id: user.id,
            user_identity: userIdentity,
            character_prompt: characterPrompt,
            guidelines
          })
          .select('id, user_identity, guidelines, character_prompt')
          .single();

        if (error) throw error;
        setSettings(data);
      }

      setSettings(prev => prev ? {
        ...prev,
        user_identity: userIdentity,
        character_prompt: characterPrompt,
        guidelines
      } : null);

      toast({
        title: 'Settings saved',
        description: 'Agent settings updated successfully'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving agent settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    fetchSettings
  };
};
