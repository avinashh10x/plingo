import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAIChats } from "@/hooks/useAIChats";
import { useAgentSettings } from "@/hooks/useAgentSettings";
import { useAuth } from "@/hooks/useAuth";
import {
  ChatContent,
  GeneratedPost,
  ChatMessage,
  AI_MODELS,
} from "@/components/ai/chat";
import { CompactChatInput } from "@/components/ai/chat/CompactChatInput";

export const StudioAIPanel = () => {
  const { addEditorPost, updateEditorPost, editorPosts } = useAppStore();
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

  const [aiInput, setAiInput] = useState("");
  const [generatedItems, setGeneratedItems] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("mistral-7b");
  const [postCount, setPostCount] = useState<string>("");
  const [tone, setTone] = useState<string>("professional");

  useEffect(() => {
    if (currentChat?.messages) {
      const allMessages = currentChat.messages.map(
        (m: ChatMessage, i: number) => ({
          id: `chat-${currentChatId}-${i}`,
          content: m.content,
          isUserMessage: m.role === "user",
        }),
      );
      setGeneratedItems(allMessages);
    } else {
      setGeneratedItems([]);
    }
  }, [currentChat, currentChatId]);

  const handleGenerate = async () => {
    if (!aiInput.trim()) return;

    // Check 10 message limit per chat
    const currentMessageCount = currentChat?.messages?.length || 0;
    const MAX_MESSAGES_PER_CHAT = 100;

    if (currentMessageCount >= MAX_MESSAGES_PER_CHAT) {
      toast({
        title: "Time for a fresh start!",
        description:
          "This chat has reached its limit. Start a new chat to continue.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const count = postCount ? parseInt(postCount) : 0;

      // Build chat history for context (only for chat mode)
      const chatHistory =
        count === 0
          ? (currentChat?.messages || []).map((m) => ({
              role: m.role,
              content: m.content,
            }))
          : [];

      const { data, error } = await supabase.functions.invoke(
        "generate-content",
        {
          body: {
            prompt: aiInput,
            model: selectedModel,
            type: count > 0 ? "tweet" : "chat",
            userIdentity: agentSettings?.user_identity,
            guidelines: agentSettings?.guidelines,
            count: count > 0 ? count : 1,
            tone,
            chatHistory,
          },
        },
      );

      if (error) throw error;
      if (data.error) throw new Error(data.error);

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

      setGeneratedItems((prev) => [...prev, userMessage, ...assistantItems]);

      if (user && currentChatId) {
        const newMessages: ChatMessage[] = [
          ...(currentChat?.messages || []),
          {
            role: "user",
            content: aiInput,
            timestamp: new Date().toISOString(),
          },
          ...assistantItems.map((item) => ({
            role: "assistant" as const,
            content: item.content,
            timestamp: new Date().toISOString(),
          })),
        ];

        const title =
          currentChat?.title === "New Chat"
            ? aiInput.slice(0, 30) + (aiInput.length > 30 ? "..." : "")
            : undefined;

        await updateChat(currentChatId, newMessages, title);
      }

      setAiInput("");

      const modelName = AI_MODELS.find((m) => m.id === selectedModel)?.name;
      if (count > 0) {
        toast({
          title: "Content generated!",
          description: `Generated ${assistantItems.length} post(s) using ${modelName}`,
        });
      }

      // Warn if approaching limit
      const newCount = (currentChat?.messages?.length || 0) + 2;
      if (newCount >= 8 && newCount < MAX_MESSAGES_PER_CHAT) {
        toast({
          title: `${MAX_MESSAGES_PER_CHAT - newCount} messages left`,
          description: "This chat is approaching its limit.",
        });
      }
    } catch (error: any) {
      console.error("Error generating content:", error);

      let title = "Generation failed";
      let description = "Failed to generate content. Please try again.";

      // 1. Try to get the most specific error message
      let rawMessage = error?.message || "";

      // Check inner Supabase error context which often contains the actual JSON response
      if (error?.context?.body) {
        try {
          const body =
            typeof error.context.body === "string"
              ? JSON.parse(error.context.body)
              : error.context.body;

          if (body?.error) {
            // If it's an object, try to get message, otherwise stringify
            rawMessage =
              typeof body.error === "object"
                ? body.error.message || JSON.stringify(body.error)
                : body.error;
          }
        } catch (e) {
          // Failed to parse context body, stick with original message
        }
      }

      // 2. Clean up "Gemini API error: 503 ..." prefixes if present
      if (rawMessage.includes("Gemini API error:")) {
        rawMessage = rawMessage.split("Gemini API error:")[1].trim();
      }

      // 3. Map specific technical errors to friendly messages
      if (
        rawMessage.includes("503") ||
        rawMessage.toLowerCase().includes("overloaded") ||
        rawMessage.toLowerCase().includes("timeout")
      ) {
        title = "Server Busy";
        description =
          "The AI is currently experiencing high traffic. Please try again in a few minutes.";
      } else if (
        rawMessage.includes("429") ||
        rawMessage.toLowerCase().includes("rate limit")
      ) {
        title = "Limit Reached";
        description = "Usage limit reached. Please take a short break.";
      } else if (rawMessage.includes("403")) {
        title = "Connection Issue";
        description =
          "Could not connect to AI services. Please try again later.";
      } else {
        // Fallback for all other errors - KEEP IT FRIENDLY
        title = "Visualization Issue";
        description =
          "Something went wrong while generating content. Please try again.";
      }

      toast({
        title,
        description,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = async () => {
    await createNewChat();
    setGeneratedItems([]);
    setAiInput("");
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const handleAddToEditor = (content: string) => {
    // Find first empty post or add to it
    const emptyPost = editorPosts.find((p) => p.content === "");
    if (emptyPost) {
      updateEditorPost(emptyPost.id, { content });
    } else {
      addEditorPost();
      setTimeout(() => {
        const posts = useAppStore.getState().editorPosts;
        const lastPost = posts[posts.length - 1];
        updateEditorPost(lastPost.id, { content });
      }, 0);
    }
    toast({
      title: "Added to editor",
    });
  };

  const handleAddAllToEditor = () => {
    // Get only the last assistant response(s) - find the last user message index
    const lastUserIndex = [...generatedItems]
      .reverse()
      .findIndex((item) => item.isUserMessage);
    const lastUserActualIndex =
      lastUserIndex === -1 ? -1 : generatedItems.length - 1 - lastUserIndex;

    const lastResponseItems = generatedItems
      .slice(lastUserActualIndex + 1)
      .filter((item) => !item.isUserMessage && item.content.trim().length > 0);

    if (lastResponseItems.length === 0) {
      toast({
        title: "No content to add",
        description: "No valid posts in the last response.",
      });
      return;
    }

    // Get current state directly
    const currentPosts = useAppStore.getState().editorPosts;
    const emptyPosts = currentPosts.filter((p) => p.content.trim() === "");

    // Process items synchronously to avoid race conditions
    let itemsProcessed = 0;

    // Fill empty posts first
    emptyPosts.forEach((emptyPost, idx) => {
      if (idx < lastResponseItems.length) {
        updateEditorPost(emptyPost.id, {
          content: lastResponseItems[idx].content,
        });
        itemsProcessed++;
      }
    });

    // Add remaining items as new posts
    const remainingItems = lastResponseItems.slice(itemsProcessed);

    // Use a single batch approach
    if (remainingItems.length > 0) {
      remainingItems.forEach((item) => {
        const store = useAppStore.getState();
        store.addEditorPost();
        const newPosts = useAppStore.getState().editorPosts;
        const newPost = newPosts[newPosts.length - 1];
        if (newPost) {
          updateEditorPost(newPost.id, { content: item.content });
        }
      });
    }

    toast({
      title: `${lastResponseItems.length} posts added`,
    });
  };

  const handleCopyAll = () => {
    // Get only the last assistant response(s)
    const lastUserIndex = [...generatedItems]
      .reverse()
      .findIndex((item) => item.isUserMessage);
    const lastUserActualIndex =
      lastUserIndex === -1 ? -1 : generatedItems.length - 1 - lastUserIndex;

    const lastResponseItems = generatedItems
      .slice(lastUserActualIndex + 1)
      .filter((item) => !item.isUserMessage && item.content.trim().length > 0);

    if (lastResponseItems.length === 0) {
      toast({
        title: "No content to copy",
        description: "No valid posts in the last response.",
      });
      return;
    }

    const allContent = lastResponseItems
      .map((item) => item.content)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(allContent);
    toast({
      title: `${lastResponseItems.length} posts copied`,
    });
  };

  return (
    <div className="relative flex flex-col h-full">
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

      <CompactChatInput
        value={aiInput}
        onChange={setAiInput}
        onSubmit={handleGenerate}
        isGenerating={isGenerating}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        postCount={postCount}
        onPostCountChange={setPostCount}
        tone={tone}
        onToneChange={setTone}
      />
    </div>
  );
};
