import { Plus, Settings, X, Loader2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface ChatHeaderProps {
  chats: Array<{ id: string; title: string; updated_at: string }>;
  currentChatId: string | null;
  isLoading: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const ChatHeader = ({
  chats,
  currentChatId,
  isLoading,
  onNewChat,
  onSelectChat,
  onOpenSettings,
  onClose,
}: ChatHeaderProps) => {
  return (
    <div className="h-9 px-3 flex items-center justify-between border-b border-border bg-muted/30">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Chat</span>
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onNewChat}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>

        {/* Chat History Dialog */}
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <History className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Chat History</TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat History
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {chats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No chat history yet
                </p>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      chat.id === currentChatId
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{chat.title}</span>
                      {chat.id === currentChatId && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(chat.updated_at), 'MMM d, h:mm a')}
                    </span>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onOpenSettings}>
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agent Settings</TooltipContent>
        </Tooltip>
        <div className="w-px h-4 bg-border mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
