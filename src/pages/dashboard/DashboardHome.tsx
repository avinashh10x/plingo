import {
  Clock,
  Send,
  Wand2,
  Plus,
  Calendar,
  Link2,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { usePlatforms } from "@/hooks/usePlatforms";
import {
  AnimatedTwitterIcon,
  AnimatedLinkedInIcon,
} from "@/components/ui/animated-icon";
import { format } from "date-fns";
import { htmlToPlainText } from "@/lib/utils";
const StatCard = ({
  icon: Icon,
  value,
  label,
  change,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  change?: string;
}) => (
  <Card className="bg-card border-border">
    <CardContent className="p-5">
      <div className="flex  items-start justify-between">
        <div className="flex flex-col items-start gap-2">
          <div className="p-2.5 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        {change && (
          <span className="text-xs font-medium text-primary">{change}</span>
        )}
        <p className="text-7xl font-bold text-foreground/15">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    className="w-full justify-start gap-3 h-12 bg-card border-border hover:bg-accent"
    onClick={onClick}
  >
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span>{label}</span>
  </Button>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "twitter") return <AnimatedTwitterIcon />;
  if (platform === "linkedin") return <AnimatedLinkedInIcon />;
  return null;
};

export const DashboardHome = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { posts } = usePosts();
  const { platforms, isConnected } = usePlatforms();

  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const publishedPosts = posts.filter((p) => p.status === "posted");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const failedPosts = posts.filter((p) => p.status === "failed");
  const upcomingPosts = scheduledPosts
    .sort(
      (a, b) =>
        new Date(a.scheduled_at!).getTime() -
        new Date(b.scheduled_at!).getTime(),
    )
    .slice(0, 5);

  const connectedPlatformsCount = ["twitter", "linkedin", "instagram"].filter(
    (p) => isConnected(p as any),
  ).length;
  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          You have {scheduledPosts.length} posts scheduled. Here's your
          overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          value={scheduledPosts.length}
          label="Scheduled Posts"
        />
        <StatCard
          icon={Send}
          value={publishedPosts.length}
          label="Published Posts"
        />
        <StatCard icon={FileText} value={draftPosts.length} label="Drafts" />
        <StatCard
          icon={Link2}
          value={connectedPlatformsCount}
          label="Connected Accounts"
        />
      </div>

      {/* Quick Actions + Upcoming Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <QuickActionButton
              icon={Wand2}
              label="Generate with AI"
              onClick={() => navigate("/dashboard/studio")}
            />
            <QuickActionButton
              icon={Plus}
              label="Create New Post"
              onClick={() => navigate("/dashboard/studio")}
            />
            <QuickActionButton
              icon={Calendar}
              label="Open Calendar"
              onClick={() => navigate("/dashboard/calendar")}
            />
            <QuickActionButton
              icon={Link2}
              label="Connect Account"
              onClick={() => navigate("/dashboard/accounts")}
            />
          </div>
        </div>

        {/* Upcoming Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Upcoming Posts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/calendar")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingPosts.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No upcoming posts scheduled
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => navigate("/dashboard/studio")}
                  >
                    Create your first post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcomingPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <PlatformIcon
                          platform={post.platforms?.[0] || "twitter"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">
                          {htmlToPlainText(post.content)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(post.scheduled_at!),
                              "MMM d, h:mm a",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
