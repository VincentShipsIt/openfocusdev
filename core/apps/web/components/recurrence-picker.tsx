'use client';

import { Recurrence, RecurrenceRule } from '@todoist/shared';
import { Repeat, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RecurrencePickerProps {
  value?: Recurrence | null;
  onChange: (recurrence: Recurrence | null) => void;
  disabled?: boolean;
}

const ruleLabels: Record<RecurrenceRule, string> = {
  daily: 'Day',
  weekly: 'Week',
  monthly: 'Month',
  yearly: 'Year',
};

const ruleOptions: { value: RecurrenceRule; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function formatRecurrence(recurrence: Recurrence): string {
  const interval = recurrence.interval || 1;
  const rule = ruleLabels[recurrence.rule];

  if (interval === 1) {
    return `Every ${rule.toLowerCase()}`;
  }
  return `Every ${interval} ${rule.toLowerCase()}s`;
}

export default function RecurrencePicker({ value, onChange, disabled }: RecurrencePickerProps) {
  const [open, setOpen] = useState(false);
  const [rule, setRule] = useState<RecurrenceRule>(value?.rule || 'daily');
  const [interval, setInterval] = useState(value?.interval || 1);

  const handleSave = () => {
    onChange({
      rule,
      interval,
    });
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-auto min-h-[36px] w-full justify-start font-normal"
        >
          <Repeat className="mr-2 h-4 w-4 text-muted-foreground" />
          {value ? (
            <span className="flex items-center gap-2">
              {formatRecurrence(value)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">Set repeat</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Repeat</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ruleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRule(option.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    rule === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-input'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Every {interval === 1 ? '' : `${interval} `}
              {ruleLabels[rule].toLowerCase()}
              {interval === 1 ? '' : 's'}
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                {ruleLabels[rule].toLowerCase()}
                {interval === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
