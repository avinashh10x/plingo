import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

const MAX_CHATS = 3;

export const useAIChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<AIChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(MAX_CHATS);

      if (error) throw error;
      
      const parsedChats = (data || []).map(chat => ({
        ...chat,
        messages: (chat.messages as unknown as ChatMessage[]) || []
      }));
      
      setChats(parsedChats);
      
      if (parsedChats.length > 0 && !currentChatId) {
        setCurrentChatId(parsedChats[0].id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [user, currentChatId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createNewChat = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      // If we have max chats, delete the oldest one
      if (chats.length >= MAX_CHATS) {
        const oldestChat = chats[chats.length - 1];
        await supabase.from('ai_chats').delete().eq('id', oldestChat.id);
      }

      const { data, error } = await supabase
        .from('ai_chats')
        .insert({
          user_id: user.id,
          title: 'New Chat',
          messages: []
        })
        .select()
        .single();

      if (error) throw error;

      const newChat = {
        ...data,
        messages: []
      };
      
      setChats(prev => [newChat, ...prev.slice(0, MAX_CHATS - 1)]);
      setCurrentChatId(data.id);
      
      return data.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create new chat'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChat = async (chatId: string, messages: ChatMessage[], title?: string) => {
    if (!user) return;

    try {
      const updateData: { messages: Json; title?: string } = { 
        messages: messages as unknown as Json 
      };
      if (title) updateData.title = title;

      const { error } = await supabase
        .from('ai_chats')
        .update(updateData)
        .eq('id', chatId);

      if (error) throw error;

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages, ...(title && { title }) }
          : chat
      ));
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  return {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    createNewChat,
    updateChat,
    selectChat,
    fetchChats
  };
};
