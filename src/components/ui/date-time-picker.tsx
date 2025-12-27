import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
}

type Period = 'AM' | 'PM';

const pad2 = (n: number) => n.toString().padStart(2, '0');

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parseTime24h = (time: string): { hour12: number; minute: number; period: Period } => {
  const [hhRaw = '12', mmRaw = '00'] = (time || '').split(':');
  const hh = clampInt(parseInt(hhRaw, 10) || 0, 0, 23);
  const minute = clampInt(parseInt(mmRaw, 10) || 0, 0, 59);

  const period: Period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = ((hh + 11) % 12) + 1; // 0->12, 13->1

  return { hour12, minute, period };
};

const toTime24h = (hour12: number, minute: number, period: Period) => {
  const h12 = clampInt(hour12, 1, 12);
  const m = clampInt(minute, 0, 59);

  let hh = h12 % 12; // 12 -> 0
  if (period === 'PM') hh += 12;

  return `${pad2(hh)}:${pad2(m)}`;
};

const TimeInput = ({
  time,
  onTimeChange,
}: {
  time: string;
  onTimeChange: (time: string) => void;
}) => {
  const parsed = useMemo(() => parseTime24h(time), [time]);

  const [hourText, setHourText] = useState<string>(String(parsed.hour12));
  const [minuteText, setMinuteText] = useState<string>(pad2(parsed.minute));
  const [period, setPeriod] = useState<Period>(parsed.period);

  useEffect(() => {
    setHourText(String(parsed.hour12));
    setMinuteText(pad2(parsed.minute));
    setPeriod(parsed.period);
  }, [parsed.hour12, parsed.minute, parsed.period]);

  const commit = (nextHourText: string, nextMinuteText: string, nextPeriod: Period) => {
    const h = clampInt(parseInt(nextHourText, 10) || 12, 1, 12);
    const m = clampInt(parseInt(nextMinuteText, 10) || 0, 0, 59);
    onTimeChange(toTime24h(h, m, nextPeriod));
  };

  const handleHourChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    setHourText(cleaned);
  };

  const handleMinuteChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    setMinuteText(cleaned);
  };

  const handleHourFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleMinuteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleHourBlur = () => {
    const h = clampInt(parseInt(hourText, 10) || 12, 1, 12);
    setHourText(String(h));
    commit(String(h), minuteText, period);
  };

  const handleMinuteBlur = () => {
    const m = clampInt(parseInt(minuteText, 10) || 0, 0, 59);
    setMinuteText(pad2(m));
    commit(hourText, pad2(m), period);
  };


  const handleHourWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1; // scroll up => increment

    const current = clampInt(parseInt(hourText, 10) || parsed.hour12, 1, 12);
    const next = ((current - 1 + dir + 12) % 12) + 1;

    setHourText(String(next));
    commit(String(next), minuteText, period);
  };

  const handleMinuteWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1; // scroll up => increment

    const current = clampInt(parseInt(minuteText, 10) || parsed.minute, 0, 59);
    const next = (current + dir + 60) % 60;

    setMinuteText(pad2(next));
    commit(hourText, pad2(next), period);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Input
          type="text"
          inputMode="numeric"
          value={hourText}
          onChange={(e) => handleHourChange(e.target.value)}
          onFocus={handleHourFocus}
          onBlur={handleHourBlur}
          onWheel={handleHourWheel}
          className="w-14 text-center px-2 tabular-nums"
          placeholder="HH"
          aria-label="Hour"
        />
        <span className="text-muted-foreground font-medium">:</span>
        <Input
          type="text"
          inputMode="numeric"
          value={minuteText}
          onChange={(e) => handleMinuteChange(e.target.value)}
          onFocus={handleMinuteFocus}
          onBlur={handleMinuteBlur}
          onWheel={handleMinuteWheel}
          className="w-14 text-center px-2 tabular-nums"
          placeholder="MM"
          aria-label="Minute"
        />
      </div>

      <ToggleGroup
        type="single"
        value={period}
        onValueChange={(next) => {
          const nextPeriod = (next || period) as Period;
          setPeriod(nextPeriod);
          commit(hourText, minuteText, nextPeriod);
        }}
        className="rounded-md border border-input bg-background"
      >
        <ToggleGroupItem value="AM" className="h-9 px-3 text-xs">AM</ToggleGroupItem>
        <ToggleGroupItem value="PM" className="h-9 px-3 text-xs">PM</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export const DateTimePicker = ({
  date,
  time = '12:00',
  onDateChange,
  onTimeChange,
  onConfirm,
  confirmLabel = 'Confirm',
  disabled = false,
  disablePastDates = true,
  triggerLabel = 'Schedule',
  showTrigger = true,
  open,
  onOpenChange,
}: DateTimePickerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

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
        disabled={disablePastDates ? (d) => d < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
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
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {triggerLabel}
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
  time = '12:00',
  onDateChange,
  onTimeChange,
  onConfirm,
  confirmLabel = 'Confirm',
  disabled = false,
  disablePastDates = true,
}: Omit<DateTimePickerProps, 'showTrigger' | 'triggerLabel' | 'open' | 'onOpenChange'>) => {
  return (
    <div className="w-auto">
      <div className="p-3 border-b border-border">
        <p className="text-sm font-medium">Pick a date & time</p>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateChange}
        disabled={disablePastDates ? (d) => d < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
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