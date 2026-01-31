'use client';

import { CreateGoalDto, Goal, GoalCategory, UpdateGoalDto } from '@todoist/shared';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApi } from '@/hooks/use-api';

interface GoalFormProps {
  goal?: Goal;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoalForm({ goal, onClose, onSuccess }: GoalFormProps) {
  const { goals: goalsApi } = useApi();
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [category, setCategory] = useState<GoalCategory>(goal?.category || 'business');
  const [targetYear, setTargetYear] = useState(goal?.targetYear || 2026);
  const [milestones, setMilestones] = useState(
    goal?.milestones || [{ id: '1', title: '', completed: false }]
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const milestoneData = milestones
        .filter((m) => m.title.trim())
        .map((m) => ({
          title: m.title,
          targetDate: m.targetDate ? new Date(m.targetDate).toISOString() : undefined,
          completed: m.completed || false,
        }));

      if (goal) {
        const updateData: UpdateGoalDto = {
          title,
          description: description || undefined,
          category,
          targetYear,
          milestones: milestones.map((m) => ({
            id: m.id,
            title: m.title,
            targetDate: m.targetDate ? new Date(m.targetDate).toISOString() : undefined,
            completed: m.completed,
          })),
        };
        await goalsApi.update(goal.id, updateData);
      } else {
        const createData: CreateGoalDto = {
          title,
          description: description || undefined,
          category,
          targetYear,
          milestones: milestoneData,
        };
        await goalsApi.create(createData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now().toString(), title: '', completed: false }]);
  };

  const updateMilestone = (id: string, field: 'title' | 'targetDate', value: string) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as GoalCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetYear">Target Year</Label>
              <Input
                id="targetYear"
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value, 10) || 2026)}
                min="2026"
                max="2036"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Milestones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                + Add Milestone
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-2">
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                    placeholder="Milestone title..."
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={
                      milestone.targetDate
                        ? new Date(milestone.targetDate).toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
                    className="w-40"
                  />
                  {milestones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : goal ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
