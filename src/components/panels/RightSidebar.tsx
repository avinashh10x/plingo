import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAIChats } from '@/hooks/useAIChats';
import { useAgentSettings } from '@/hooks/useAgentSettings';
import { useAuth } from '@/hooks/useAuth';
import {
  ChatHeader,
  ChatContent,
  ChatInput,
  SettingsPanel,
  GeneratedPost,
  ChatMessage,
  AI_MODELS,
} from '@/components/ai/chat';

export const RightSidebar = () => {
  const { addEditorPost, updateEditorPost, editorPosts, setAIPanelOpen } = useAppStore();
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    currentChatId,
    isLoading: chatsLoading,
    createNewChat,
    updateChat,
    selectChat,
  } = useAIChats();
  const { settings: agentSettings } = useAgentSettings();

  const [aiInput, setAiInput] = useState('');
  const [generatedItems, setGeneratedItems] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash');
  const [postCount, setPostCount] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // Load messages from current chat - show both user and assistant messages
  useEffect(() => {
    if (currentChat?.messages) {
      const allMessages = currentChat.messages.map((m: ChatMessage, i: number) => ({
        id: `chat-${currentChatId}-${i}`,
        content: m.content,
        isUserMessage: m.role === 'user',
      }));
      setGeneratedItems(allMessages);
    } else {
      setGeneratedItems([]);
    }
  }, [currentChat, currentChatId]);

  const handleGenerate = async () => {
    if (!aiInput.trim()) return;

    setIsGenerating(true);

    try {
      const count = postCount ? parseInt(postCount) : 0;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: aiInput,
          model: selectedModel,
          type: count > 0 ? 'tweet' : 'chat',
          userIdentity: agentSettings?.user_identity,
          aiCharacter: agentSettings?.character_prompt,
          guidelines: agentSettings?.guidelines,
          count: count > 0 ? count : 1,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Handle response - include user message in the display
      const userMessage: GeneratedPost = {
        id: `user-${Date.now()}`,
        content: aiInput,
        isUserMessage: true,
      };

      let assistantItems: GeneratedPost[] = [];
      if (Array.isArray(data.content)) {
        assistantItems = data.content.map((content: string, index: number) => ({
          id: `gen-${Date.now()}-${index}`,
          content,
          isUserMessage: false,
        }));
      } else {
        assistantItems = [
          {
            id: `gen-${Date.now()}-0`,
            content: data.content,
            isUserMessage: false,
          },
        ];
      }

      // Append to existing messages
      setGeneratedItems(prev => [...prev, userMessage, ...assistantItems]);

      // Save to chat history if user is authenticated
      if (user && currentChatId) {
        const newMessages: ChatMessage[] = [
          ...(currentChat?.messages || []),
          { role: 'user', content: aiInput, timestamp: new Date().toISOString() },
          ...assistantItems.map((item) => ({
            role: 'assistant' as const,
            content: item.content,
            timestamp: new Date().toISOString(),
          })),
        ];

        // Generate title from first user message if it's a new chat
        const title =
          currentChat?.title === 'New Chat'
            ? aiInput.slice(0, 30) + (aiInput.length > 30 ? '...' : '')
            : undefined;

        await updateChat(currentChatId, newMessages, title);
      }

      setAiInput('');
      
      const modelName = AI_MODELS.find((m) => m.id === selectedModel)?.name;
      if (count > 0) {
        toast({
          title: 'Content generated!',
          description: `Generated ${assistantItems.length} post(s) using ${modelName}`,
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description:
          error instanceof Error ? error.message : 'Failed to generate content. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = async () => {
    await createNewChat();
    setGeneratedItems([]);
    setAiInput('');
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
    });
  };

  const handleAddToEditor = (content: string) => {
    if (editorPosts.length > 0 && editorPosts[0].content === '') {
      updateEditorPost(editorPosts[0].id, { content });
    } else {
      addEditorPost();
      setTimeout(() => {
        const posts = useAppStore.getState().editorPosts;
        const lastPost = posts[posts.length - 1];
        updateEditorPost(lastPost.id, { content });
      }, 0);
    }
    toast({
      title: 'Added to editor',
      description: 'Content added to a new post card.',
    });
  };

  const handleAddAllToEditor = () => {
    // Filter only assistant messages with actual content
    const validItems = generatedItems.filter(
      (item) => !item.isUserMessage && item.content.trim().length > 0
    );
    
    if (validItems.length === 0) {
      toast({
        title: 'No content to add',
        description: 'No valid posts to add to editor.',
      });
      return;
    }

    validItems.forEach((item, index) => {
      setTimeout(() => {
        addEditorPost();
        setTimeout(() => {
          const posts = useAppStore.getState().editorPosts;
          const lastPost = posts[posts.length - 1];
          updateEditorPost(lastPost.id, { content: item.content });
        }, 0);
      }, index * 50);
    });
    toast({
      title: 'All content added',
      description: `${validItems.length} posts added to editor.`,
    });
  };

  const handleCopyAll = () => {
    // Only copy assistant messages with actual content
    const validItems = generatedItems.filter(
      (item) => !item.isUserMessage && item.content.trim().length > 0
    );
    const allContent = validItems.map((item) => item.content).join('\n\n---\n\n');
    navigator.clipboard.writeText(allContent);
    toast({
      title: 'All copied!',
      description: `${validItems.length} posts copied to clipboard.`,
    });
  };

  return (
    <div className="relative flex flex-col h-full bg-card border-l border-border">
      <ChatHeader
        chats={chats}
        currentChatId={currentChatId}
        isLoading={chatsLoading}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onOpenSettings={() => setShowSettings(true)}
        onClose={() => setAIPanelOpen(false)}
      />

      <ChatContent
        generatedItems={generatedItems}
        onCopy={handleCopy}
        onAddToEditor={handleAddToEditor}
        onCopyAll={handleCopyAll}
        onAddAllToEditor={handleAddAllToEditor}
        onNewChat={handleNewChat}
        chats={chats}
        currentChatId={currentChatId}
        isLoading={chatsLoading}
        onSelectChat={handleSelectChat}
      />

      <ChatInput
        value={aiInput}
        onChange={setAiInput}
        onSubmit={handleGenerate}
        isGenerating={isGenerating}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        postCount={postCount}
        onPostCountChange={setPostCount}
      />

      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
};
