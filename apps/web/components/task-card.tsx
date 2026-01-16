'use client';

import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { formatTaskDueDate, Task } from '@todoist/shared';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TaskForm from './task-form';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const { tasks: tasksApi } = useApi();
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksApi.delete(task.id);
        onDelete();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <>
      <div className="p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
        <div className="font-medium">{task.title}</div>
        {task.description && (
          <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
        )}
        {task.dueDate && (
          <div className="text-xs text-muted-foreground mt-1">
            {formatTaskDueDate(task.dueDate)}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded ${
              task.priority === 'urgent' ? 'bg-destructive text-destructive-foreground' :
              task.priority === 'high' ? 'bg-orange-500 text-white' :
              task.priority === 'medium' ? 'bg-yellow-500 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {task.priority}
            </span>
          )}
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowEditForm(true)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {showEditForm && (
        <TaskForm
          task={task}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

