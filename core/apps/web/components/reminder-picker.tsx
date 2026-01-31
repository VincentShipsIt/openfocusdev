'use client';

import { Reminder, ReminderType } from '@todoist/shared';
import { Bell, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReminderPickerProps {
  reminders: Reminder[];
  onAdd: (type: ReminderType, time?: string, offset?: number) => void;
  onRemove: (reminderId: string) => void;
}

const RELATIVE_OPTIONS = [
  { value: 0, label: 'At time of due date' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
];

export default function ReminderPicker({ reminders, onAdd, onRemove }: ReminderPickerProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReminderType>('relative');
  const [offset, setOffset] = useState(30);
  const [absoluteTime, setAbsoluteTime] = useState('');

  const handleAdd = () => {
    if (type === 'relative') {
      onAdd('relative', undefined, offset);
    } else if (absoluteTime) {
      onAdd('absolute', absoluteTime);
    }
    setOpen(false);
  };

  const formatReminder = (reminder: Reminder) => {
    if (reminder.type === 'relative') {
      const option = RELATIVE_OPTIONS.find((o) => o.value === reminder.offset);
      return option?.label || `${reminder.offset} minutes before`;
    }
    if (reminder.time) {
      return new Date(reminder.time).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase font-medium">
          Reminders {reminders.length > 0 && `(${reminders.length})`}
        </span>
      </div>

      {/* Existing reminders */}
      {reminders.length > 0 ? (
        <div className="space-y-1">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between gap-2 text-sm py-1 px-2 bg-accent/50 rounded"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{formatReminder(reminder)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRemove(reminder.id)}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No reminders set</p>
      )}

      {/* Add reminder */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-3 w-3 mr-1" />
            Add reminder
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reminder type</Label>
              <Select value={type} onValueChange={(value) => setType(value as ReminderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relative">Relative to due date</SelectItem>
                  <SelectItem value="absolute">Specific time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'relative' ? (
              <div className="space-y-2">
                <Label>When</Label>
                <Select value={String(offset)} onValueChange={(value) => setOffset(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIVE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={absoluteTime}
                  onChange={(e) => setAbsoluteTime(e.target.value)}
                />
              </div>
            )}

            <Button onClick={handleAdd} className="w-full">
              Add reminder
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
