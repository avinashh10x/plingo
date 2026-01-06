import { Link2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatforms, PlatformType } from "@/hooks/usePlatforms";
import { useUsage } from "@/hooks/useUsage";
import {
  AnimatedTwitterIcon,
  AnimatedLinkedInIcon,
  AnimatedInstagramIcon,
} from "@/components/ui/animated-icon";
import { UsageBar } from "@/components/usage/UsageBar";
import { cn } from "@/lib/utils";

const SUPPORTED_PLATFORMS: {
  id: PlatformType;
  name: string;
  description: string;
}[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    description: "Post tweets and threads",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Share professional content",
  },
];

const PlatformIcon = ({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) => {
  if (platform === "twitter")
    return <AnimatedTwitterIcon className={className} />;
  if (platform === "linkedin")
    return <AnimatedLinkedInIcon className={className} />;
  if (platform === "instagram")
    return <AnimatedInstagramIcon className={className} />;
  return null;
};

export const AccountsPage = () => {
  const {
    isLoading,
    isConnecting,
    connectPlatform,
    disconnectPlatform,
    isConnected,
    getPlatformStatus,
  } = usePlatforms();
  const { usage, isLoading: isUsageLoading } = useUsage();

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Platforms Skeleton */}
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-48 mb-3" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card Skeleton */}
        <Card className="mt-6 bg-muted/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connectedCount = SUPPORTED_PLATFORMS.filter((p) =>
    isConnected(p.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Connected Accounts
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your social media accounts to start posting. {connectedCount}{" "}
          of {SUPPORTED_PLATFORMS.length} connected.
        </p>
      </div>

      {/* Platforms Grid */}
      <div className="grid gap-4">
        {SUPPORTED_PLATFORMS.map((platform) => {
          const connected = isConnected(platform.id);
          const status = getPlatformStatus(platform.id);
          const platformUsage = usage[platform.id as keyof typeof usage];
          const connecting = isConnecting === platform.id;

          return (
            <Card
              key={platform.id}
              className={cn(
                "bg-card border-border transition-all",
                connected && "border-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Platform Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      connected ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <PlatformIcon platform={platform.id} className="h-7 w-7" />
                  </div>

                  {/* Platform Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {platform.name}
                      </h3>
                      {connected ? (
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-600 border-0"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not connected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {platform.description}
                    </p>

                    {connected && status?.platform_username && (
                      <p className="text-sm text-foreground mt-1">
                        @{status.platform_username}
                      </p>
                    )}

                    {/* Usage Bar */}
                    {connected && !isUsageLoading && platformUsage && (
                      <div className="mt-3">
                        <UsageBar
                          postsUsed={platformUsage.postsUsed}
                          limit={platformUsage.limit}
                          platform={platform.id}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => status && disconnectPlatform(status.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => connectPlatform(platform.id)}
                        disabled={connecting}
                        size="sm"
                      >
                        {connecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-6 bg-muted/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Why connect accounts?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Connecting your social accounts allows Plingo to publish posts
                on your behalf. We use secure OAuth authentication and never
                store your passwords.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
