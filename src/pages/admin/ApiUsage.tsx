import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";

interface PlatformUsage {
  platform: string;
  readUsed: number;
  readLimit: number;
  readPercentage: number;
  writeUsed: number;
  writeLimit: number;
  writePercentage: number;
}

const platforms = ["twitter", "linkedin", "instagram", "facebook", "threads"];

const PLATFORM_API_LIMITS = {
  twitter: { read: 100, write: 500 },
  linkedin: { read: 10000, write: 10000 },
  instagram: { read: 5000, write: 5000 },
  facebook: { read: 10000, write: 10000 },
  threads: { read: 5000, write: 5000 },
};

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
};

export const ApiUsage = () => {
  const [platformUsage, setPlatformUsage] = useState<PlatformUsage[]>([]);

  useEffect(() => {
    const fetchPlatformUsage = async () => {
      try {
        const now = new Date();
        const monthYear = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;

        const { data: usageData, error: usageError } = await supabase
          .from("user_usage")
          .select("platform, posts_used")
          .eq("month_year", monthYear);

        if (usageError) throw usageError;

        const writeByPlatform: Record<string, number> = {};
        (usageData || []).forEach(
          (row: { platform: string; posts_used: number }) => {
            writeByPlatform[row.platform] =
              (writeByPlatform[row.platform] || 0) + row.posts_used;
          }
        );

        const usage: PlatformUsage[] = platforms.map((platform) => {
          const limits = PLATFORM_API_LIMITS[
            platform as keyof typeof PLATFORM_API_LIMITS
          ] || { read: 10000, write: 10000 };
          const writeUsed = writeByPlatform[platform] || 0;

          return {
            platform,
            readUsed: 0, // We track read separately if needed, currently 0 placeholder
            readLimit: limits.read,
            readPercentage: 0,
            writeUsed,
            writeLimit: limits.write,
            writePercentage:
              limits.write > 0
                ? Math.min((writeUsed / limits.write) * 100, 100)
                : 0,
          };
        });

        setPlatformUsage(usage);
      } catch (error) {
        console.error("Error fetching usage:", error);
      }
    };

    fetchPlatformUsage();
  }, []);

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Platform API Usage (This Month)</CardTitle>
        </div>
        <CardDescription>
          Monitor global system usage against platform API limits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platformUsage.map((usage) => (
            <div
              key={usage.platform}
              className="p-4 rounded-lg border border-border bg-muted/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  {platformIcons[usage.platform] || (
                    <BarChart3 className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold capitalize text-foreground">
                    {usage.platform}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    API Rate Limits
                  </p>
                </div>
              </div>

              {/* Write Operations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      Write Operations
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {usage.writeUsed.toLocaleString()} /{" "}
                    {usage.writeLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usage.writePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {usage.writePercentage.toFixed(1)}% used
                </p>
              </div>

              {usage.platform === "twitter" && (
                <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ Free tier limits: {PLATFORM_API_LIMITS.twitter.read}{" "}
                    reads, {PLATFORM_API_LIMITS.twitter.write} writes/month
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
