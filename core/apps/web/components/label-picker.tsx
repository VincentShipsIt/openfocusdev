'use client';

import { Check, Plus, Tag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LabelBadge from './label-badge';

// Common label suggestions
const suggestedLabels = [
  'urgent',
  'important',
  'work',
  'personal',
  'home',
  'health',
  'finance',
  'learning',
];

interface LabelPickerProps {
  selectedLabels: string[];
  onChange: (labels: string[]) => void;
  disabled?: boolean;
}

export default function LabelPicker({ selectedLabels, onChange, disabled }: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      onChange(selectedLabels.filter((l) => l !== label));
    } else {
      onChange([...selectedLabels, label]);
    }
  };

  const addCustomLabel = () => {
    const trimmed = newLabel.trim().toLowerCase();
    if (trimmed && !selectedLabels.includes(trimmed)) {
      onChange([...selectedLabels, trimmed]);
      setNewLabel('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomLabel();
    }
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
          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
          {selectedLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label) => (
                <LabelBadge key={label} label={label} onRemove={() => toggleLabel(label)} />
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Add labels</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* New label input */}
          <div className="flex gap-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Create label..."
              className="h-8 text-sm"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addCustomLabel}
              disabled={!newLabel.trim()}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggested labels */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-1">
              {suggestedLabels.map((label) => {
                const isSelected = selectedLabels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
