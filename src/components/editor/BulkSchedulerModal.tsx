import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addDays,
  setHours,
  setMinutes,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  CalendarDays,
  Repeat,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore, EditorPost, ScheduleMode } from "@/stores/appStore";
import { usePosts, ScheduleRule } from "@/hooks/usePosts";
import {
  useScheduleRules,
  ScheduleRule as SavedScheduleRule,
} from "@/hooks/useScheduleRules";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BulkSchedulerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPosts: EditorPost[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// Generate time slots from 00:00 to 23:30 in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

// Helper to strip HTML and get plain text
const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const BulkSchedulerModal = ({
  open,
  onOpenChange,
  selectedPosts,
}: BulkSchedulerModalProps) => {
  const { removeEditorPosts, deselectAllEditorPosts } = useAppStore();
  const { createPost, bulkSchedule } = usePosts();
  const { activeRules, isLoading: rulesLoading } = useScheduleRules();

  const [scheduleTab, setScheduleTab] = useState<"saved" | "custom">(
    activeRules.length > 0 ? "saved" : "custom"
  );
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [mode, setMode] = useState<ScheduleMode>("daily");
  const [time, setTime] = useState("09:00");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [showPreview, setShowPreview] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Get effective schedule settings (from saved rule or custom)
  const effectiveSchedule = useMemo(() => {
    if (scheduleTab === "saved" && selectedRuleId) {
      const rule = activeRules.find((r) => r.id === selectedRuleId);
      if (rule) {
        let effectiveMode: ScheduleMode = rule.type as ScheduleMode;
        let effectiveDays: number[] = [];

        if (rule.type === "custom" && rule.days) {
          effectiveDays = rule.days.map((d) => DAY_MAP[d.toLowerCase()] ?? 0);
        } else if (rule.type === "weekdays") {
          effectiveDays = [1, 2, 3, 4, 5];
        } else if (rule.type === "weekends") {
          effectiveDays = [0, 6];
        } else {
          effectiveDays = [0, 1, 2, 3, 4, 5, 6];
        }

        return {
          mode: effectiveMode,
          time: rule.time.slice(0, 5),
          days: effectiveDays,
        };
      }
    }
    return { mode, time, days: customDays };
  }, [scheduleTab, selectedRuleId, activeRules, mode, time, customDays]);

  // Calculate schedule assignments based on mode and time
  const scheduleAssignments = useMemo(() => {
    const now = new Date();
    const {
      mode: effectiveMode,
      time: effectiveTime,
      days: effectiveDays,
    } = effectiveSchedule;
    const [hours, minutes] = effectiveTime.split(":").map(Number);
    const assignments: { post: EditorPost; scheduledAt: Date }[] = [];

    let currentRefDate = startOfDay(startDate);
    let postsToSchedule = [...selectedPosts];

    // Get allowed days based on mode
    const getAllowedDays = (): number[] => {
      switch (effectiveMode) {
        case "daily":
          return [0, 1, 2, 3, 4, 5, 6];
        case "weekdays":
          return [1, 2, 3, 4, 5];
        case "weekends":
          return [0, 6];
        case "custom":
          return effectiveDays;
        default:
          return [0, 1, 2, 3, 4, 5, 6];
      }
    };

    const allowedDays = getAllowedDays();

    // Find next available slot
    const findNextSlot = (fromDate: Date): Date => {
      let date = new Date(fromDate);
      let attempts = 0;
      const maxAttempts = 365;

      while (attempts < maxAttempts) {
        const dayOfWeek = date.getDay();
        if (allowedDays.includes(dayOfWeek)) {
          const scheduled = setMinutes(setHours(date, hours), minutes);
          // If the slot is in the past, move to next day
          if (!isBefore(scheduled, now)) {
            return scheduled;
          }
        }
        date = addDays(date, 1);
        attempts++;
      }
      return date;
    };

    // Calculate assignments
    let nextSlot = findNextSlot(currentRefDate);

    for (const post of postsToSchedule) {
      assignments.push({ post, scheduledAt: nextSlot });
      nextSlot = findNextSlot(addDays(nextSlot, 1));
    }

    return assignments;
  }, [selectedPosts, effectiveSchedule, startDate]);

  const handleConfirmSchedule = async () => {
    // Check for 365-day limit
    const oneYearFromNow = addDays(new Date(), 365);
    const hasLatePosts = scheduleAssignments.some((a) =>
      isBefore(oneYearFromNow, a.scheduledAt)
    );

    if (hasLatePosts) {
      toast({
        title: "Scheduling Limit Exceeded",
        description:
          "Currently, scheduling is only supported up to 1 year in advance.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      // First, create all posts in the database
      const postIds: string[] = [];

      for (const { post } of scheduleAssignments) {
        const platforms = post.platforms || ["twitter"];
        const newPost = await createPost(post.content, platforms as any);
        if (newPost) {
          postIds.push(newPost.id);
        }
      }

      if (postIds.length === 0) {
        throw new Error("Failed to create posts");
      }

      // Then bulk schedule them using effective schedule
      const {
        mode: effectiveMode,
        time: effectiveTime,
        days: effectiveDays,
      } = effectiveSchedule;
      const rule: ScheduleRule = {
        type: effectiveMode,
        time: effectiveTime,
        days:
          effectiveMode === "custom"
            ? effectiveDays.map((d) => DAYS[d])
            : undefined,
        startDate: startDate, // Pass selected start date if needed by backend
      };

      await bulkSchedule(postIds, rule);

      // Remove from editor
      removeEditorPosts(selectedPosts.map((p) => p.id));
      deselectAllEditorPosts();

      onOpenChange(false);
      setShowPreview(false);
    } catch (error) {
      console.error("Bulk schedule error:", error);
      toast({
        title: "Scheduling failed",
        description: "Failed to schedule posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const getModeDescription = (): string => {
    const { mode: m, days } = effectiveSchedule;
    switch (m) {
      case "daily":
        return "Every day";
      case "weekdays":
        return "Monday to Friday";
      case "weekends":
        return "Saturday and Sunday";
      case "custom":
        return days.length > 0
          ? days.map((d) => DAYS[d]).join(", ")
          : "No days selected";
      default:
        return "";
    }
  };

  const formatRuleName = (rule: SavedScheduleRule) => {
    const timeFormatted = format(
      setMinutes(
        setHours(new Date(), parseInt(rule.time.slice(0, 2))),
        parseInt(rule.time.slice(3, 5))
      ),
      "h:mm a"
    );
    if (rule.name) return `${rule.name} (${timeFormatted})`;
    return `${
      rule.type.charAt(0).toUpperCase() + rule.type.slice(1)
    } at ${timeFormatted}`;
  };

  const hasValidContent = selectedPosts.every(
    (post) => stripHtml(post.content).trim().length > 0
  );
  const canProceed =
    hasValidContent &&
    ((scheduleTab === "saved" && selectedRuleId) ||
      (scheduleTab === "custom" &&
        (mode !== "custom" || customDays.length > 0)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Smart Bulk Scheduler
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showPreview ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-hidden"
            >
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6 py-4">
                  {/* Selected posts count */}
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {selectedPosts.length} post
                      {selectedPosts.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>

                  {/* Saved Rules vs Custom Toggle */}
                  <Tabs
                    value={scheduleTab}
                    onValueChange={(v) =>
                      setScheduleTab(v as "saved" | "custom")
                    }
                  >
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="saved" className="gap-2">
                        <Zap className="h-3 w-3" />
                        Saved Schedules
                      </TabsTrigger>
                      <TabsTrigger value="custom" className="gap-2">
                        <Clock className="h-3 w-3" />
                        Custom
                      </TabsTrigger>
                    </TabsList>

                    {/* Saved Schedules Tab */}
                    <TabsContent value="saved" className="mt-4 space-y-3">
                      {rulesLoading ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Loading...
                        </div>
                      ) : activeRules.length === 0 ? (
                        <div className="text-center py-4 space-y-2">
                          <p className="text-sm text-muted-foreground">
                            No saved schedules yet
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Create schedules in Profile → Posting Schedule
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScheduleTab("custom")}
                          >
                            Use Custom Schedule
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeRules.map((rule) => (
                            <motion.button
                              key={rule.id}
                              onClick={() => setSelectedRuleId(rule.id)}
                              className={cn(
                                "w-full p-3 rounded-lg border text-left transition-colors",
                                selectedRuleId === rule.id
                                  ? "bg-primary/10 border-primary"
                                  : "bg-muted/50 border-border hover:border-primary/50"
                              )}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <p className="font-medium text-sm">
                                {formatRuleName(rule)}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {rule.type}
                              </p>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Custom Schedule Tab */}
                    <TabsContent value="custom" className="mt-4 space-y-6">
                      {/* Start Date Picker (Optimization) */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          Start Sequence From
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? (
                                format(startDate, "PPP")
                              ) : (
                                <span>Pick a start date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => date && setStartDate(date)}
                              disabled={(date) =>
                                isBefore(date, startOfDay(new Date()))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Schedule Frequency */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Frequency</Label>
                        <Tabs
                          value={mode}
                          onValueChange={(v) => setMode(v as ScheduleMode)}
                        >
                          <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="daily" className="text-xs">
                              Daily
                            </TabsTrigger>
                            <TabsTrigger value="weekdays" className="text-xs">
                              Weekdays
                            </TabsTrigger>
                            <TabsTrigger value="weekends" className="text-xs">
                              Weekends
                            </TabsTrigger>
                            <TabsTrigger value="custom" className="text-xs">
                              Custom
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="custom" className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              {DAYS.map((day, index) => (
                                <motion.button
                                  key={day}
                                  onClick={() => toggleCustomDay(index)}
                                  className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                                    customDays.includes(index)
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-muted border-border hover:border-primary/50"
                                  )}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {day}
                                </motion.button>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Time Picker */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Posting Time
                        </Label>
                        <Select value={time} onValueChange={setTime}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {format(
                                  setMinutes(
                                    setHours(
                                      new Date(),
                                      parseInt(slot.split(":")[0])
                                    ),
                                    parseInt(slot.split(":")[1])
                                  ),
                                  "h:mm a"
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Summary */}
                  <div className="p-3 bg-muted/50 border border-border/50 rounded-lg space-y-1">
                    <p className="text-sm font-medium">Schedule Summary</p>
                    <p className="text-xs text-muted-foreground">
                      Starting {format(startDate, "MMM d, yyyy")}, posting{" "}
                      {getModeDescription()} at{" "}
                      {format(
                        setMinutes(
                          setHours(
                            new Date(),
                            parseInt(effectiveSchedule.time.split(":")[0])
                          ),
                          parseInt(effectiveSchedule.time.split(":")[1])
                        ),
                        "h:mm a"
                      )}
                    </p>
                  </div>

                  {/* Warning if no valid content */}
                  {!hasValidContent && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Some posts have no content
                      </span>
                    </div>
                  )}

                  {/* Saved schedule not selected warning */}
                  {scheduleTab === "saved" &&
                    !selectedRuleId &&
                    activeRules.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Please select a schedule
                        </span>
                      </div>
                    )}

                  {/* Custom days warning */}
                  {scheduleTab === "custom" &&
                    mode === "custom" &&
                    customDays.length === 0 && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Please select at least one day
                        </span>
                      </div>
                    )}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-hidden"
            >
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Schedule Preview</span>
                </div>

                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-2">
                    {scheduleAssignments.map(({ post, scheduledAt }, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {stripHtml(post.content).slice(0, 40)}
                            {stripHtml(post.content).length > 40 ? "..." : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(scheduledAt, "EEE, MMM d")} —{" "}
                            {format(scheduledAt, "h:mm a")}
                          </p>
                        </div>
                        <Check className="h-4 w-4 text-green-500" />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="flex gap-2 pt-4 border-t">
          {!showPreview ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setShowPreview(true)}
                disabled={!canProceed}
              >
                Preview Schedule
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={isScheduling}
                className="gap-2"
              >
                {isScheduling ? (
                  <>Scheduling...</>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm & Schedule
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
