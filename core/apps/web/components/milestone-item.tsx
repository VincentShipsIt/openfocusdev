'use client';

import { Milestone } from '@todoist/shared';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: () => void;
}

export default function MilestoneItem({ milestone, onToggle }: MilestoneItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
      <button
        onClick={onToggle}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={milestone.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {milestone.completed ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
          {milestone.title}
        </p>
        {milestone.targetDate && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(milestone.targetDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

