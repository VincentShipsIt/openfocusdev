'use client';

import { X } from 'lucide-react';

// Predefined label colors
const labelColors: Record<string, string> = {
  'urgent': 'bg-red-500/20 text-red-400 border-red-500/30',
  'important': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'work': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'personal': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'home': 'bg-green-500/20 text-green-400 border-green-500/30',
  'health': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'finance': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'learning': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'default': 'bg-muted text-muted-foreground border-border',
};

interface LabelBadgeProps {
  label: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function LabelBadge({ label, onRemove, size = 'sm' }: LabelBadgeProps) {
  const colorClass = labelColors[label.toLowerCase()] || labelColors['default'];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
