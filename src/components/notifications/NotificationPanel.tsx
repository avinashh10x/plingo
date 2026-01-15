import { useState } from "react";
import { Bell, Check, Send, Calendar, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  Notification,
  NotificationType,
} from "@/hooks/useNotifications";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "post_published":
      return (
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <Send className="h-4 w-4 text-green-600" />
        </div>
      );
    case "post_scheduled":
      return (
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "post_failed":
      return (
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-red-600" />
        </div>
      );
    case "admin_alert":
      return (
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Bell className="h-4 w-4 text-purple-600" />
        </div>
      );
    case "system":
    default:
      return (
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Info className="h-4 w-4 text-gray-600" />
        </div>
      );
  }
};

export const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Mark all as read when opening panel (Instagram-style)
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollPercentage =
      (target.scrollTop + target.clientHeight) / target.scrollHeight;

    // Load more when scrolled 80% down
    if (scrollPercentage > 0.8 && hasMore && !isLoading) {
      loadMore();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        <ScrollArea className="h-[400px]" onScrollCapture={handleScroll}>
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
              {isLoading && (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Loading more...
                </div>
              )}
              {!hasMore && notifications.length >= 10 && (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No more notifications
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  const isLong = notification.message.length > maxLength;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 items-start",
        !notification.is_read && "bg-primary/5"
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-medium text-foreground leading-none">
            {notification.title}
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="mt-1.5">
          <p className="text-xs text-muted-foreground leading-snug break-words">
            {isExpanded || !isLong
              ? notification.message
              : `${notification.message.slice(0, maxLength)}... `}
            {isLong && !isExpanded && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="text-[10px] font-medium text-primary hover:underline cursor-pointer ml-1 select-none"
              >
                See more
              </span>
            )}
          </p>
        </div>
      </div>
      {!notification.is_read && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
};
