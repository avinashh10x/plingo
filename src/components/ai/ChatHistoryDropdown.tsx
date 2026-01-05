import { Plus, ChevronDown, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatHistoryProps {
  chats: Array<{
    id: string;
    title: string;
    updated_at: string;
  }>;
  currentChatId: string | null;
  isLoading: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export const ChatHistoryDropdown = ({
  chats,
  currentChatId,
  isLoading,
  onNewChat,
  onSelectChat
}: ChatHistoryProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 gap-0.5">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center"
              >
                <Plus className="h-3 w-3" />
                <ChevronDown className="h-2.5 w-2.5" />
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chat History</TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs flex items-center gap-2">
          <MessageSquare className="h-3 w-3" />
          Chat History
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onNewChat}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          <span>New Chat</span>
        </DropdownMenuItem>
        
        {chats.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {chats.map((chat) => (
              <DropdownMenuItem
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="flex flex-col items-start gap-0.5"
              >
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">
                    {chat.title}
                  </span>
                  {chat.id === currentChatId && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground ml-5">
                  {format(new Date(chat.updated_at), 'MMM d, h:mm a')}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {chats.length === 0 && (
          <div className="px-2 py-3 text-center">
            <p className="text-xs text-muted-foreground">No chat history yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
