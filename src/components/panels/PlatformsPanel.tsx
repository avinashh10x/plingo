import { Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlatforms, PlatformType } from '@/hooks/usePlatforms';
import { useUsage } from '@/hooks/useUsage';
import { cn } from '@/lib/utils';
import { AnimatedTwitterIcon, AnimatedLinkedInIcon, AnimatedInstagramIcon } from '@/components/ui/animated-icon';
import { UsageBar } from '@/components/usage/UsageBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const platformIconVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1, y: -2 },
  tap: { scale: 0.95 },
};

const SUPPORTED_PLATFORMS: { id: PlatformType; name: string }[] = [
  { id: 'twitter', name: 'Twitter / X' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'instagram', name: 'Instagram' },
];

const PlatformCard = ({
  platform,
  name,
  connected,
  username,
  isConnecting,
  postsUsed,
  onConnect,
  onDisconnect,
}: {
  platform: PlatformType;
  name: string;
  connected: boolean;
  username?: string | null;
  isConnecting: boolean;
  postsUsed?: number;
  onConnect: () => void;
  onDisconnect?: () => void;
}) => {
  const icons: Record<string, React.ReactNode> = {
    twitter: <AnimatedTwitterIcon className="h-5 w-5" />,
    linkedin: <AnimatedLinkedInIcon className="h-5 w-5" />,
    instagram: <AnimatedInstagramIcon className="h-5 w-5" />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          className={cn(
            'relative p-3 rounded-lg border cursor-pointer transition-all',
            connected
              ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
              : 'bg-muted/30 border-border hover:border-muted-foreground/30'
          )}
          variants={platformIconVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              connected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                icons[platform]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{name}</span>
                {connected && (
                  <span className="w-2 h-2 rounded-full bg-success" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {connected ? (username || 'Connected') : 'Not connected'}
              </p>
            </div>
            {connected && (
              <motion.span 
                className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Check className="h-3 w-3 text-primary" />
              </motion.span>
            )}
          </div>
          
          {/* Usage Bar */}
          {connected && postsUsed !== undefined && (
            <div className="mt-2">
              <UsageBar 
                postsUsed={postsUsed} 
                platform={platform} 
              />
            </div>
          )}
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {connected ? (
          <>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {username || 'Connected'}
            </DropdownMenuItem>
            {onDisconnect && (
              <DropdownMenuItem onClick={onDisconnect} className="text-destructive">
                Disconnect
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem onClick={onConnect}>
            Connect {name}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const PlatformsPanel = () => {
  const { isLoading, isConnecting, connectPlatform, disconnectPlatform, isConnected, getPlatformStatus } = usePlatforms();
  const { usage, isLoading: isUsageLoading } = useUsage();

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Connected Platforms
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          SUPPORTED_PLATFORMS.map((platform) => {
            const status = getPlatformStatus(platform.id);
            const platformUsage = usage[platform.id as keyof typeof usage];
            return (
              <PlatformCard
                key={platform.id}
                platform={platform.id}
                name={platform.name}
                connected={isConnected(platform.id)}
                username={status?.platform_username}
                isConnecting={isConnecting === platform.id}
                postsUsed={!isUsageLoading && platformUsage ? platformUsage.postsUsed : undefined}
                onConnect={() => connectPlatform(platform.id)}
                onDisconnect={status ? () => disconnectPlatform(status.id) : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
