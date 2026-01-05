import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Loader2,
  ExternalLink
} from 'lucide-react';

const platforms = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: Twitter,
    color: 'bg-sky-500',
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-600',
    available: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    available: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-500',
    available: false,
  },
];

interface ConnectPlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ConnectPlatformModal = ({
  open,
  onOpenChange,
  onSuccess,
}: ConnectPlatformModalProps) => {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const { data, error } = await supabase.functions.invoke('oauth-init', {
        body: { platform: platformId },
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast.error('Failed to connect platform');
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a Platform</DialogTitle>
          <DialogDescription>
            Link your social media accounts to start scheduling and publishing content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {platforms.map((platform) => (
            <motion.button
              key={platform.id}
              whileHover={{ scale: platform.available ? 1.02 : 1 }}
              whileTap={{ scale: platform.available ? 0.98 : 1 }}
              onClick={() => platform.available && handleConnect(platform.id)}
              disabled={!platform.available || connecting !== null}
              className={`
                flex items-center gap-4 p-4 rounded-lg border transition-all
                ${platform.available 
                  ? 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer' 
                  : 'border-border/50 opacity-50 cursor-not-allowed'}
              `}
            >
              <div className={`p-2 rounded-lg ${platform.color}`}>
                <platform.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{platform.name}</p>
                <p className="text-xs text-muted-foreground">
                  {platform.available ? 'Click to connect' : 'Coming soon'}
                </p>
              </div>
              {connecting === platform.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : platform.available ? (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              ) : null}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Your credentials are encrypted and never shared.
        </p>
      </DialogContent>
    </Dialog>
  );
};
