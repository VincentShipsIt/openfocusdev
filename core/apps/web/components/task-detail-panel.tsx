'use client';

import { useUser } from '@clerk/nextjs';
import {
  formatTaskDueDate,
  isOverdue,
  Project,
  Reminder,
  ReminderType,
  Task,
  TaskPriority,
  UpdateTaskDto,
} from '@todoist/shared';
import { Bot, Calendar, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import CommentList from './comment-list';
import LabelBadge from './label-badge';
import LabelPicker from './label-picker';
import ReminderPicker from './reminder-picker';

interface TaskDetailPanelProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: '#ef4444',
  [TaskPriority.HIGH]: '#f97316',
  [TaskPriority.MEDIUM]: '#3b82f6',
  [TaskPriority.LOW]: '#6b7280',
};

export default function TaskDetailPanel({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TaskDetailPanelProps) {
  const { user } = useUser();
  const { tasks: tasksApi, projects: projectsApi } = useApi();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const allProjects = await projectsApi.getAll();
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, [projectsApi]);

  const loadSubtasks = useCallback(async () => {
    if (!task) return;
    try {
      const data = await tasksApi.getSubtasks(task.id);
      setSubtasks(data);
    } catch (error) {
      console.error('Failed to load subtasks:', error);
    }
  }, [tasksApi, task]);

  useEffect(() => {
    if (open && task) {
      loadProjects();
      loadSubtasks();
      // Reset form with task data
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
      setDueTime(task.dueDate ? new Date(task.dueDate).toISOString().slice(11, 16) : '');
      setPriority(task.priority);
      setLabels(task.labels || []);
      setReminders(task.reminders || []);
      setSelectedProjectId(task.projectId || '');
      setAiEnabled(task.aiEnabled || false);
      setAiPrompt(task.aiPrompt || '');
      setIsEditing(false);
    }
  }, [open, task, loadProjects, loadSubtasks]);

  const handleSave = async () => {
    if (!task) return;

    try {
      setIsSaving(true);
      const dueDateTime =
        dueDate && dueTime
          ? new Date(`${dueDate}T${dueTime}`).toISOString()
          : dueDate
            ? new Date(`${dueDate}T00:00`).toISOString()
            : undefined;

      const updateData: UpdateTaskDto = {
        title,
        description: description || undefined,
        projectId: selectedProjectId || undefined,
        dueDate: dueDateTime,
        priority,
        labels,
        aiEnabled,
        aiPrompt: aiPrompt || undefined,
      };
      await tasksApi.update(task.id, updateData);
      toast.success('Task updated');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setIsDeleting(true);
      await tasksApi.delete(task.id);
      toast.success('Task deleted');
      onOpenChange(false);
      onDelete();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;

    try {
      await tasksApi.update(task.id, {
        completedAt: task.completedAt ? null : new Date().toISOString(),
      });
      toast.success(task.completedAt ? 'Task reopened' : 'Task completed');
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtaskTitle.trim()) return;

    try {
      await tasksApi.createSubtask(task.id, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      loadSubtasks();
      onUpdate();
    } catch (error) {
      console.error('Failed to add subtask:', error);
      toast.error('Failed to add subtask');
    }
  };

  const handleToggleSubtask = async (subtask: Task) => {
    try {
      await tasksApi.update(subtask.id, {
        completedAt: subtask.completedAt ? null : new Date().toISOString(),
      });
      loadSubtasks();
      onUpdate();
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const handleAddReminder = async (type: ReminderType, time?: string, offset?: number) => {
    if (!task) return;

    try {
      const updatedTask = await tasksApi.addReminder(task.id, { type, time, offset });
      setReminders(updatedTask.reminders || []);
      toast.success('Reminder added');
      onUpdate();
    } catch (error) {
      console.error('Failed to add reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  const handleRemoveReminder = async (reminderId: string) => {
    if (!task) return;

    try {
      const updatedTask = await tasksApi.removeReminder(task.id, reminderId);
      setReminders(updatedTask.reminders || []);
      toast.success('Reminder removed');
      onUpdate();
    } catch (error) {
      console.error('Failed to remove reminder:', error);
      toast.error('Failed to remove reminder');
    }
  };

  if (!task) return null;

  const priorityColor = priorityColors[task.priority] || priorityColors[TaskPriority.MEDIUM];
  const taskOverdue = task.dueDate && !task.completedAt && isOverdue(task.dueDate);
  const completedSubtasks = subtasks.filter((s) => s.completedAt).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-start gap-3">
            <button onClick={handleToggleComplete} className="mt-1 flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  task.completedAt ? 'bg-primary border-primary' : 'hover:bg-opacity-20'
                }`}
                style={{
                  borderColor: task.completedAt ? undefined : priorityColor,
                }}
              >
                {task.completedAt && (
                  <svg
                    className="w-4 h-4 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              ) : (
                <SheetTitle
                  className={`cursor-pointer hover:text-foreground/80 ${
                    task.completedAt ? 'line-through text-muted-foreground' : ''
                  }`}
                  onClick={() => setIsEditing(true)}
                >
                  {task.title}
                </SheetTitle>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Description</Label>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="mt-1"
                rows={3}
              />
            ) : (
              <p
                className="mt-1 text-sm cursor-pointer hover:bg-accent p-2 rounded-md -ml-2"
                onClick={() => setIsEditing(true)}
              >
                {task.description || (
                  <span className="text-muted-foreground">Add description...</span>
                )}
              </p>
            )}
          </div>

          <Separator />

          {/* Project */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Project</Label>
            {isEditing ? (
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Inbox</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm">
                {projects.find((p) => p.id === task.projectId)?.name || 'Inbox'}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Due Date</Label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
              </div>
            ) : (
              <div
                className={`mt-1 flex items-center gap-2 text-sm ${taskOverdue ? 'text-destructive' : ''}`}
              >
                <Calendar className="h-4 w-4" />
                {task.dueDate ? (
                  formatTaskDueDate(task.dueDate)
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Priority</Label>
            {isEditing ? (
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                  <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm capitalize">{task.priority}</p>
            )}
          </div>

          {/* Labels */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Labels</Label>
            {isEditing ? (
              <div className="mt-1">
                <LabelPicker selectedLabels={labels} onChange={setLabels} />
              </div>
            ) : (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map((label) => <LabelBadge key={label} label={label} size="md" />)
                ) : (
                  <span className="text-sm text-muted-foreground">No labels</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* AI Execution */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
              <Bot className="h-3 w-3" />
              AI Execution
            </Label>
            {isEditing ? (
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="aiEnabled"
                    checked={aiEnabled}
                    onCheckedChange={(checked) => setAiEnabled(!!checked)}
                  />
                  <label htmlFor="aiEnabled" className="text-sm cursor-pointer">
                    Enable AI auto-completion
                  </label>
                </div>
                {aiEnabled && (
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Optional: Add specific instructions for AI..."
                    className="text-sm"
                    rows={2}
                  />
                )}
              </div>
            ) : (
              <div className="mt-2">
                {task.aiEnabled ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Bot className="h-4 w-4" />
                      <span>AI enabled</span>
                    </div>
                    {task.aiPrompt && (
                      <p className="text-sm text-muted-foreground">{task.aiPrompt}</p>
                    )}
                    {task.aiExecutionStatus && (
                      <p
                        className={`text-xs ${
                          task.aiExecutionStatus === 'completed'
                            ? 'text-green-600'
                            : task.aiExecutionStatus === 'failed'
                              ? 'text-destructive'
                              : task.aiExecutionStatus === 'running'
                                ? 'text-blue-600'
                                : 'text-muted-foreground'
                        }`}
                      >
                        Status: {task.aiExecutionStatus}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">AI not enabled</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Reminders */}
          <ReminderPicker
            reminders={reminders}
            onAdd={handleAddReminder}
            onRemove={handleRemoveReminder}
          />

          <Separator />

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Subtasks {subtasks.length > 0 && `(${completedSubtasks}/${subtasks.length})`}
              </Label>
            </div>

            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 py-1">
                  <button onClick={() => handleToggleSubtask(subtask)}>
                    {subtask.completedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <span
                    className={`text-sm ${subtask.completedAt ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}

              {/* Add subtask */}
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Add subtask..."
                  className="h-8 text-sm border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <CommentList taskId={task.id} currentUserId={user?.id} />

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
