import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";
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

interface TimeInputProps {
  time: string;
  onTimeChange: (time: string) => void;
}

const TimeInput = ({ time, onTimeChange }: TimeInputProps) => {
  const [hours, minutes] = time.split(":");
  const hour24 = parseInt(hours);
  const hour12 = hour24 % 12 || 12;
  const period: Period = hour24 >= 12 ? "PM" : "AM";

  // Local state for typing - allows free text input without immediate clamping
  const [localHour, setLocalHour] = useState(hour12.toString());
  const [localMinute, setLocalMinute] = useState(minutes);

  // Sync local state when external time changes
  useEffect(() => {
    const [h, m] = time.split(":");
    const h24 = parseInt(h);
    const h12 = h24 % 12 || 12;
    setLocalHour(h12.toString());
    setLocalMinute(m);
  }, [time]);

  const commitHour = () => {
    const newHour = parseInt(localHour) || 12;
    const clampedHour = Math.min(Math.max(newHour, 1), 12);
    const currentPeriod = parseInt(hours) >= 12 ? "PM" : "AM";
    const hour24New =
      currentPeriod === "PM" ? (clampedHour % 12) + 12 : clampedHour % 12;
    setLocalHour(clampedHour.toString());
    onTimeChange(`${hour24New.toString().padStart(2, "0")}:${minutes}`);
  };

  const commitMinute = () => {
    const newMinute = parseInt(localMinute) || 0;
    const clampedMinute = Math.min(Math.max(newMinute, 0), 59);
    setLocalMinute(clampedMinute.toString().padStart(2, "0"));
    onTimeChange(`${hours}:${clampedMinute.toString().padStart(2, "0")}`);
  };

  const handlePeriodChange = (newPeriod: string) => {
    if (newPeriod && (newPeriod === "AM" || newPeriod === "PM")) {
      const currentHour = parseInt(hours);
      let newHour: number;
      if (newPeriod === "PM" && currentHour < 12) {
        newHour = currentHour + 12;
      } else if (newPeriod === "AM" && currentHour >= 12) {
        newHour = currentHour - 12;
      } else {
        newHour = currentHour;
      }
      onTimeChange(`${newHour.toString().padStart(2, "0")}:${minutes}`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localHour}
        onChange={(e) =>
          setLocalHour(e.target.value.replace(/\D/g, "").slice(0, 2))
        }
        onBlur={commitHour}
        onKeyDown={(e) => e.key === "Enter" && commitHour()}
        className="w-12 h-8 text-center text-sm p-1"
      />
      <span>:</span>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localMinute}
        onChange={(e) =>
          setLocalMinute(e.target.value.replace(/\D/g, "").slice(0, 2))
        }
        onBlur={commitMinute}
        onKeyDown={(e) => e.key === "Enter" && commitMinute()}
        className="w-12 h-8 text-center text-sm p-1"
      />
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={handlePeriodChange}
        className="ml-1"
      >
        <ToggleGroupItem value="AM" className="h-8 px-2 text-xs">
          AM
        </ToggleGroupItem>
        <ToggleGroupItem value="PM" className="h-8 px-2 text-xs">
          PM
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

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
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;

  const setIsOpen = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    setIsOpen(false);
  };

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
          className={cn("gap-1.5", compact && "!h-5 text-xs px-2 ")}
        >
          <CalendarIcon className={cn("h-3 w-3", compact && "h-2 w-2 ")} />
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
