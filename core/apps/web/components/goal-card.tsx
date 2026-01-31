'use client';

import { Goal } from '@todoist/shared';
import { ChevronDown, ChevronUp, Edit, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MilestoneItem from './milestone-item';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onMilestoneToggle: (goalId: string, milestoneId: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete, onMilestoneToggle }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = goal.milestones.filter((m) => m.completed).length;
  const totalCount = goal.milestones.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const categoryColors = {
    business: 'bg-blue-500',
    personal: 'bg-green-500',
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this goal?')) {
      onDelete(goal.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${categoryColors[goal.category]} flex items-center justify-center`}
              >
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{goal.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {goal.category}
                  </span>
                  <span className="text-xs text-muted-foreground">Target: {goal.targetYear}</span>
                </div>
              </div>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-2">{goal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">
              {completedCount} / {totalCount} milestones
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${categoryColors[goal.category]} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {goal.milestones.length > 0 && (
          <>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setExpanded(!expanded)}
            >
              <span>
                Milestones ({completedCount}/{totalCount})
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {expanded && (
              <div className="mt-2 space-y-1">
                {goal.milestones.map((milestone) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    onToggle={() => onMilestoneToggle(goal.id, milestone.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
