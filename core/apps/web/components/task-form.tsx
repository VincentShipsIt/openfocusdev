'use client';

import {
  CreateTaskDto,
  Project,
  Recurrence,
  Task,
  TaskPriority,
  UpdateTaskDto,
} from '@todoist/shared';
import { useCallback, useEffect, useState } from 'react';
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
import LabelPicker from './label-picker';
import RecurrencePicker from './recurrence-picker';

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  parentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const INBOX_PROJECT_VALUE = 'none';

export default function TaskForm({ task, projectId, parentId, onClose, onSuccess }: TaskFormProps) {
  const { tasks: tasksApi, projects: projectsApi } = useApi();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [selectedProjectId, setSelectedProjectId] = useState(task?.projectId || projectId || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
  );
  const [dueTime, setDueTime] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(11, 16) : ''
  );
  const [priority, setPriority] = useState<TaskPriority>(
    (task?.priority as TaskPriority) || TaskPriority.MEDIUM
  );
  const [labels, setLabels] = useState<string[]>(task?.labels || []);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(task?.recurrence || null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const allProjects = await projectsApi.getAll();
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, [projectsApi]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const dueDateTime =
        dueDate && dueTime
          ? new Date(`${dueDate}T${dueTime}`).toISOString()
          : dueDate
            ? new Date(`${dueDate}T00:00`).toISOString()
            : undefined;

      if (task) {
        const updateData: UpdateTaskDto = {
          title,
          description: description || undefined,
          projectId: selectedProjectId || undefined,
          dueDate: dueDateTime,
          priority,
          labels,
          recurrence: recurrence || null,
        };
        await tasksApi.update(task.id, updateData);
      } else {
        const createData: CreateTaskDto = {
          title,
          description: description || undefined,
          projectId: selectedProjectId || undefined,
          dueDate: dueDateTime,
          priority,
          labels,
          recurrence: recurrence || undefined,
          parentTaskId: parentId || undefined,
        };
        await tasksApi.create(createData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : parentId ? 'New Subtask' : 'New Task'}</DialogTitle>
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

          <div>
            <Label htmlFor="project">Project</Label>
            <Select
              value={selectedProjectId || INBOX_PROJECT_VALUE}
              onValueChange={(value) =>
                setSelectedProjectId(value === INBOX_PROJECT_VALUE ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={INBOX_PROJECT_VALUE}>None (Inbox)</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueTime">Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Labels</Label>
            <LabelPicker selectedLabels={labels} onChange={setLabels} disabled={loading} />
          </div>

          <div>
            <Label>Repeat</Label>
            <RecurrencePicker value={recurrence} onChange={setRecurrence} disabled={loading} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
