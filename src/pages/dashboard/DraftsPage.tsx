import { useState, useEffect } from "react";
import {
  FileText,
  Edit,
  Trash2,
  Clock,
  Send,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import { useInfiniteScroll } from "@/hooks/usePagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  AnimatedTwitterIcon,
  AnimatedLinkedInIcon,
} from "@/components/ui/animated-icon";
import { format, addDays } from "date-fns";
import { htmlToPlainText } from "@/lib/utils";
import { useAppStore, Platform } from "@/stores/appStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "twitter") return <AnimatedTwitterIcon />;
  if (platform === "linkedin") return <AnimatedLinkedInIcon />;
  return <span className="text-xs font-medium uppercase">{platform[0]}</span>;
};

export const DraftsPage = () => {
  const navigate = useNavigate();
  const [platformFilter, setPlatformFilter] = useState<
    "all" | "twitter" | "linkedin"
  >("all");
  const [activeTab, setActiveTab] = useState<"drafts" | "all">("drafts");

  // Pagination & Infinite Scroll logic
  // Pagination & Infinite Scroll logic
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const nextPage = () => setPage((p) => p + 1);

  // Note: For infinite scroll, totalItems in usePagination needs to be accurate to allow 'nextPage' to work.
  // We need to pass totalCount from usePosts to usePagination somehow, or just handle 'hasMore' manually.
  // Actually, usePagination calculates 'canNext' based on totalItems.

  const statusFilter = activeTab === "drafts" ? "draft" : undefined;

  const {
    posts,
    isLoading,
    isFetching,
    deletePost,
    publishNow,
    updatePost,
    schedulePost,
    totalCount,
  } = usePosts({
    page,
    pageSize: 10,
    status: statusFilter,
    infinite: true,
  });

  // NOTE: filtering is now done server-side via usePosts based on activeTab (status).
  // platformFilter is still client-side for now as it's a sub-filter of the fetched set.
  const filteredPosts = posts.filter((post) => {
    if (platformFilter === "all") return true;
    return post.platforms?.includes(platformFilter);
  });

  // Since usePagination state is internal, we need a way to update its 'totalItems'.
  // But wait, the hook accepts totalItems as prop. It doesn't update it.
  // We should create a new wrapper or just use 'page' state directly if usePagination is too rigid.
  // Let's use the 'page' and 'setPage' from usePagination, but we need to override the 'canNext' logic or update the hook to accept dynamic total.
  // The simple way: Re-instantiate usePagination with the new totalCount? No, that resets page.
  // Alternative: Just use useState for page and useInfiniteScroll separately?
  // User wanted "add new feature in pagination hook". I did that: useInfiniteScroll.

  // Let's use useInfiniteScroll to drive nextPage.
  const hasMore = posts.length < totalCount;

  const lastElementRef = useInfiniteScroll({
    onLoadMore: nextPage,
    hasMore: hasMore,
    isLoading: isFetching, // Use isFetching to allow append updates without blocking UI, but preventing spam
    rootMargin: "200px", // Load earlier
  });

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // State for Edit/Reschedule dialogs
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [reschedulingPost, setReschedulingPost] = useState<any>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(
    undefined
  );
  // State for Post Now confirmation
  const [postNowConfirm, setPostNowConfirm] = useState<any>(null);

  const handleEditDraft = (post: (typeof posts)[0]) => {
    // Clear existing editor posts and add this draft's content
    clearEditorPosts();
    const platforms = (post.platforms || ["twitter"]) as Platform[];
    addEditorPostWithData(post.content, platforms);
    navigate("/dashboard/studio");
  };

  // Removed old client-side filtering logic
  // const drafts = posts.filter((p) => p.status === "draft");
  // const allPosts = posts;

  // const filteredPosts = ...

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-[150px]" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Posts Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Drafts & Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved drafts and all content.
          </p>
        </div>

        {/* Platform Filter */}
        <Select
          value={platformFilter}
          onValueChange={(v: any) => setPlatformFilter(v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v: any) => setActiveTab(v)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="all">All Posts</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              {activeTab === "drafts" ? "No drafts yet" : "No posts found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "drafts"
                ? "Start creating content and save drafts for later."
                : "Create your first post to get started."}
            </p>
            <Button onClick={() => navigate("/dashboard/studio")}>
              Create New Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => {
            const isLast = index === filteredPosts.length - 1;
            return (
              <div key={post.id} ref={isLast ? lastElementRef : null}>
                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Platform Icons */}
                      <div className="flex flex-col gap-1">
                        {post.platforms?.map((platform) => (
                          <div
                            key={platform}
                            className="p-2 rounded-lg bg-muted"
                          >
                            <PlatformIcon platform={platform} />
                          </div>
                        ))}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground whitespace-pre-wrap">
                          {htmlToPlainText(post.content)}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge
                            variant={
                              post.status === "posted"
                                ? "default"
                                : post.status === "scheduled"
                                ? "secondary"
                                : post.status === "failed"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {post.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.status === "posted" && post.posted_at
                              ? `Posted ${format(
                                  new Date(post.posted_at),
                                  "MMM d, h:mm a"
                                )}`
                              : post.status === "scheduled" && post.scheduled_at
                              ? `Scheduled ${format(
                                  new Date(post.scheduled_at),
                                  "MMM d, h:mm a"
                                )}`
                              : `Created ${format(
                                  new Date(post.created_at),
                                  "MMM d, h:mm a"
                                )}`}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {(post.status === "draft" ||
                          post.status === "scheduled") && (
                          <Button
                            variant="secondary"
                            size="icon"
                            title="Post Now"
                            onClick={() => setPostNowConfirm(post)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {post.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditDraft(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {post.status === "scheduled" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Content"
                              onClick={() => {
                                setEditingPost(post);
                                setEditContent(htmlToPlainText(post.content));
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Reschedule"
                              onClick={() => {
                                setReschedulingPost(post);
                                if (post.scheduled_at) {
                                  setNewScheduleDate(
                                    new Date(post.scheduled_at)
                                  );
                                }
                              }}
                            >
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
          {hasMore ? (
            <div className="py-8 text-center flex flex-col items-center gap-4">
              {isFetching ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              ) : (
                <Button variant="secondary" onClick={nextPage}>
                  Load More
                </Button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              You've reached the end of the list.
            </div>
          )}
        </div>
      )}

      {/* Edit Content Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post Content</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (editingPost) {
                  await updatePost(editingPost.id, { content: editContent });
                  setEditingPost(null);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={!!reschedulingPost}
        onOpenChange={() => setReschedulingPost(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Post</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={newScheduleDate}
              onSelect={setNewScheduleDate}
              initialFocus
              className="p-3 pointer-events-auto"
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const maxDate = addDays(today, 365);
                return date < today || date > maxDate;
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedulingPost(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (reschedulingPost && newScheduleDate) {
                  const oldDate = new Date(reschedulingPost.scheduled_at);
                  const newDate = new Date(newScheduleDate);
                  newDate.setHours(oldDate.getHours(), oldDate.getMinutes());

                  await schedulePost(
                    reschedulingPost.id,
                    newDate,
                    reschedulingPost.platforms
                  );
                  setReschedulingPost(null);
                }
              }}
            >
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Now Confirmation Dialog */}
      <AlertDialog
        open={!!postNowConfirm}
        onOpenChange={() => setPostNowConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ready to publish?</AlertDialogTitle>
            <AlertDialogDescription>
              This will post your content immediately to the selected platforms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (postNowConfirm) {
                  postNowConfirm.platforms?.forEach((p: string) =>
                    publishNow(postNowConfirm.id, p)
                  );
                  setPostNowConfirm(null);
                }
              }}
            >
              Publish Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
