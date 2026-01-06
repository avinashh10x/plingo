import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Loader2,
  ExternalLink,
  Check,
} from "lucide-react";

const platforms = [
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    color: "bg-sky-500",
    available: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-600",
    available: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    available: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-500",
    available: true,
  },
];

interface ConnectPlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

import { usePlatforms, PlatformType } from "@/hooks/usePlatforms";

// ... (keep imports)

export const ConnectPlatformModal = ({
  open,
  onOpenChange,
  onSuccess,
}: ConnectPlatformModalProps) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const { getPlatformStatus } = usePlatforms();

  const handleConnect = async (platformId: string) => {
    // ... (keep existing handleConnect logic)
    setConnecting(platformId);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-init", {
        body: { platform: platformId },
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (error) {
      console.error("Error initiating OAuth:", error);
      toast.error("Failed to connect platform");
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a Platform</DialogTitle>
          <DialogDescription>
            Link your social media accounts to start scheduling and publishing
            content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {platforms.map((platform) => {
            const status = getPlatformStatus(platform.id as PlatformType);
            const isConnected = !!status;

            return (
              <motion.button
                key={platform.id}
                whileHover={{ scale: platform.available ? 1.02 : 1 }}
                whileTap={{ scale: platform.available ? 0.98 : 1 }}
                onClick={() =>
                  !isConnected &&
                  platform.available &&
                  handleConnect(platform.id)
                }
                disabled={
                  !platform.available || connecting !== null || isConnected
                }
                className={`
                  flex items-center gap-4 p-4 rounded-lg border transition-all text-left w-full
                  ${
                    isConnected
                      ? "border-green-500/50 bg-green-500/10 cursor-default"
                      : platform.available
                      ? "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                      : "border-border/50 opacity-50 cursor-not-allowed"
                  }
                `}
              >
                <div className={`p-2 rounded-lg ${platform.color}`}>
                  <platform.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{platform.name}</p>
                    {isConnected && (
                      <span className="text-[10px] uppercase font-bold text-green-600 bg-green-200 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {isConnected
                      ? `Connected as @${status?.platform_username || "user"}`
                      : platform.available
                      ? "Click to connect"
                      : "Coming soon"}
                  </p>
                </div>
                {connecting === platform.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : isConnected ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : platform.available ? (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                ) : null}
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Your credentials are encrypted and never shared.
        </p>
      </DialogContent>
    </Dialog>
  );
};
