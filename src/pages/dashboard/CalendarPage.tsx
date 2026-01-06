import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2,
  Filter,
  Send,
  Edit,
  CalendarClock,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isPast,
  isFuture,
  isToday as isDateToday,
  addDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts } from "@/hooks/usePosts";
import {
  AnimatedTwitterIcon,
  AnimatedLinkedInIcon,
} from "@/components/ui/animated-icon";
import { cn, htmlToPlainText } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "twitter") return <AnimatedTwitterIcon />;
  if (platform === "linkedin") return <AnimatedLinkedInIcon />;
  return <span className="text-xs font-medium uppercase">{platform[0]}</span>;
};

export const CalendarPage = () => {
  const { posts, isLoading, deletePost, publishNow, updatePost, schedulePost } =
    usePosts();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "posted" | "failed"
  >("all");
  const [platformFilter, setPlatformFilter] = useState<
    "all" | "twitter" | "linkedin"
  >("all");

  // Edit/Reschedule State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [reschedulingPost, setReschedulingPost] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>(
    undefined
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the calendar
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...daysInMonth];

  // Filter posts that have a scheduled_at date (includes scheduled, posted, failed)
  const calendarPosts = useMemo(() => {
    return posts.filter((p) => {
      // Must have a scheduled_at or posted_at date
      const hasDate = p.scheduled_at || p.posted_at;
      if (!hasDate) return false;

      // Apply status filter
      if (statusFilter !== "all" && p.status !== statusFilter) return false;

      // Apply platform filter
      if (platformFilter !== "all" && !p.platforms?.includes(platformFilter))
        return false;

      return true;
    });
  }, [posts, statusFilter, platformFilter]);

  const getPostsForDay = (date: Date) => {
    return calendarPosts.filter((post) => {
      const postDate = new Date(post.scheduled_at || post.posted_at!);
      return isSameDay(postDate, date);
    });
  };

  const selectedDayPosts = useMemo(() => {
    return getPostsForDay(selectedDate);
  }, [selectedDate, calendarPosts]);

  const hasPostsOnDay = (date: Date) => getPostsForDay(date).length > 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[130px]" />
            <Skeleton className="h-10 w-[130px]" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Calendar Navigation Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Calendar Grid Skeleton */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center py-2">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts Section Skeleton */}
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View all your posts - past, present, and future.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filters */}
          <Select
            value={statusFilter}
            onValueChange={(v: any) => setStatusFilter(v)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={platformFilter}
            onValueChange={(v: any) => setPlatformFilter(v)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Week
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground min-w-[160px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-24 bg-muted/30 rounded-lg"
                  />
                );
              }

              const dayPosts = getPostsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-24 p-2 rounded-lg border transition-colors text-left flex flex-col",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50",
                    !isSameMonth(day, currentMonth) && "opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday && "text-primary",
                      isSelected && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate",
                          post.status === "posted" &&
                            "bg-green-500/10 text-green-600",
                          post.status === "scheduled" &&
                            "bg-primary/10 text-primary",
                          post.status === "failed" &&
                            "bg-destructive/10 text-destructive"
                        )}
                      >
                        <PlatformIcon
                          platform={post.platforms?.[0] || "twitter"}
                        />
                        <span className="truncate">
                          {htmlToPlainText(post.content).slice(0, 15)}...
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {format(
                            new Date(post.scheduled_at || post.posted_at!),
                            "h:mm a"
                          )}
                        </span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayPosts.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming This Week */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Posts on {format(selectedDate, "MMMM d, yyyy")}
        </h2>
        {selectedDayPosts.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No posts scheduled for this day
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDayPosts.map((post) => (
              <Card key={post.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <PlatformIcon
                        platform={post.platforms?.[0] || "twitter"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            post.status === "posted"
                              ? "default"
                              : post.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">
                        {htmlToPlainText(post.content)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(post.scheduled_at || post.posted_at!),
                            "h:mm a"
                          )}
                        </span>
                      </div>
                    </div>
                    {post.status === "scheduled" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Reschedule"
                          onClick={() => {
                            setReschedulingPost(post);
                            setNewScheduleDate(new Date(post.scheduled_at!));
                          }}
                        >
                          <CalendarClock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit Content"
                          onClick={() => {
                            setEditingPost(post);
                            setEditContent(htmlToPlainText(post.content));
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Post Now"
                          onClick={() => {
                            if (confirm("Post this now?")) {
                              post.platforms?.forEach((p) =>
                                publishNow(post.id, p)
                              );
                            }
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Content Dialog */}
      <Dialog
        open={!!editingPost}
        onOpenChange={(open) => !open && setEditingPost(null)}
      >
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
        onOpenChange={(open) => !open && setReschedulingPost(null)}
      >
        <DialogContent className="w-auto p-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Reschedule Post</h2>
          </div>
          <Calendar
            mode="single"
            selected={newScheduleDate}
            onSelect={setNewScheduleDate}
            initialFocus
            className="p-3 pointer-events-auto"
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const maxDate = addDays(today, 7);
              return date < today || date > maxDate;
            }}
          />
          <div className="p-4 border-t flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReschedulingPost(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (reschedulingPost && newScheduleDate) {
                  // Keep original time, change date? Or just set date at current time?
                  // Ideally user picks time too. For now reset time to 12PM or keep original time components?
                  // Let's keep original hours/minutes if possible, or just use selected date at current time.
                  // Simplest: Schedule for noon on that day if not specified?
                  // Better: Combine new date with old time.
                  const oldDate = new Date(reschedulingPost.scheduled_at);
                  const newDate = new Date(newScheduleDate);
                  newDate.setHours(oldDate.getHours(), oldDate.getMinutes());

                  // If new date-time is in past, maybe warn? But schedulePost handles it.
                  await schedulePost(
                    reschedulingPost.id,
                    newDate,
                    reschedulingPost.platforms
                  );
                  setReschedulingPost(null);
                }
              }}
            >
              Confirm schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
