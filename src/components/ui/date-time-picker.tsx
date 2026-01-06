import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DateTimePickerProps {
  date?: Date;
  time?: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
  triggerLabel?: string;
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  compact?: boolean;
  maxDate?: Date;
}

type Period = "AM" | "PM";

// ... (keep existing helper functions)

export const DateTimePicker = ({
  date,
  time = "12:00",
  onDateChange,
  onTimeChange,
  onConfirm,
  confirmLabel = "Confirm",
  disabled = false,
  disablePastDates = true,
  triggerLabel = "Schedule",
  showTrigger = true,
  open,
  onOpenChange,
  compact = false,
  maxDate,
}: DateTimePickerProps) => {
  // ... (keep existing state)

  const content = (
    <div className="w-auto">
      <div className="p-3 border-b border-border">
        <p className="text-sm font-medium">Pick a date & time</p>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateChange}
        disabled={(d) => {
          const isPast =
            disablePastDates && d < new Date(new Date().setHours(0, 0, 0, 0));
          const isTooFar = maxDate && d > maxDate;
          return isPast || !!isTooFar;
        }}
        initialFocus
        className="pointer-events-auto"
      />
      <div className="p-3 border-t border-border flex items-center gap-2">
        <TimeInput time={time} onTimeChange={onTimeChange} />
        {onConfirm && (
          <Button
            size="sm"
            className="flex-1"
            onClick={handleConfirm}
            disabled={disabled || !date}
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </div>
  );

  if (!showTrigger) {
    return content;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", compact && "h-7 text-xs px-2")}
        >
          <CalendarIcon className={cn("h-4 w-4", compact && "h-3 w-3")} />
          {triggerLabel || "Schedule"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {content}
      </PopoverContent>
    </Popover>
  );
};

export const DateTimePickerContent = ({
  date,
  time = "12:00",
  onDateChange,
  onTimeChange,
  onConfirm,
  confirmLabel = "Confirm",
  disabled = false,
  disablePastDates = true,
}: Omit<
  DateTimePickerProps,
  "showTrigger" | "triggerLabel" | "open" | "onOpenChange"
>) => {
  return (
    <div className="w-auto">
      <div className="p-3 border-b border-border">
        <p className="text-sm font-medium">Pick a date & time</p>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateChange}
        disabled={
          disablePastDates
            ? (d) => d < new Date(new Date().setHours(0, 0, 0, 0))
            : undefined
        }
        initialFocus
        className="pointer-events-auto"
      />
      <div className="p-3 border-t border-border flex items-center gap-2">
        <TimeInput time={time} onTimeChange={onTimeChange} />
        {onConfirm && (
          <Button
            size="sm"
            className="flex-1"
            onClick={onConfirm}
            disabled={disabled || !date}
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
