'use client';

import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateProjectDto, ProjectCategory, ProjectStatus } from '@todoist/shared';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: ProjectStatus.IDEA, label: 'Idea' },
  { value: ProjectStatus.PLANNING, label: 'Planning' },
  { value: ProjectStatus.IN_PROGRESS, label: 'In Progress' },
  { value: ProjectStatus.TESTING, label: 'Testing' },
  { value: ProjectStatus.LAUNCHED, label: 'Launched' },
  { value: ProjectStatus.DISTRIBUTED, label: 'Distributed' },
  { value: ProjectStatus.PAUSED, label: 'Paused' },
  { value: ProjectStatus.ABANDONED, label: 'Abandoned' },
];

const CATEGORY_OPTIONS = [
  { value: ProjectCategory.SIDE_PROJECT, label: 'Side Project' },
  { value: ProjectCategory.MONEY_MAKER, label: 'Money Maker' },
  { value: ProjectCategory.TOOL, label: 'Tool' },
  { value: ProjectCategory.OSS, label: 'Open Source' },
  { value: ProjectCategory.FAMILY, label: 'Family' },
  { value: ProjectCategory.EXPERIMENT, label: 'Experiment' },
  { value: ProjectCategory.OTHER, label: 'Other' },
];

export default function ProjectForm({ onClose, onSuccess }: ProjectFormProps) {
  const { projects: projectsApi } = useApi();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.IDEA);
  const [category, setCategory] = useState<ProjectCategory>(ProjectCategory.SIDE_PROJECT);
  const [startDate, setStartDate] = useState('');
  const [targetLaunchDate, setTargetLaunchDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const createData: CreateProjectDto = {
        name,
        description: description || undefined,
        color,
        status,
        category,
        startDate: startDate || undefined,
        targetLaunchDate: targetLaunchDate || undefined,
      };
      await projectsApi.create(createData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="targetLaunchDate">Target Launch</Label>
              <Input
                id="targetLaunchDate"
                type="date"
                value={targetLaunchDate}
                onChange={(e) => setTargetLaunchDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
