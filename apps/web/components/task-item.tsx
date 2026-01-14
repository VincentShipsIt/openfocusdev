'use client';

import { useApi } from '@/hooks/use-api';
import { formatTaskDueDate, isOverdue, Task, TaskPriority } from '@todoist/shared';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TaskForm from './task-form';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: '#ef4444',
  [TaskPriority.HIGH]: '#f97316',
  [TaskPriority.MEDIUM]: '#3b82f6',
  [TaskPriority.LOW]: '#6b7280',
};

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const { tasks: tasksApi } = useApi();
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInlineEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isInlineEditing]);

  const handleToggleComplete = async () => {
    try {
      setIsCompleting(true);
      await tasksApi.update(task.id, {
        completedAt: task.completedAt ? null : new Date().toISOString(),
      });
      setTimeout(() => {
        onUpdate();
      }, 300);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        setIsDeleting(true);
        await tasksApi.delete(task.id);
        onDelete();
      } catch (error) {
        console.error('Failed to delete task:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleInlineEditStart = () => {
    if (task.completedAt) return;
    setEditTitle(task.title);
    setIsInlineEditing(true);
  };

  const handleInlineEditSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || trimmedTitle === task.title) {
      setIsInlineEditing(false);
      setEditTitle(task.title);
      return;
    }

    try {
      setIsSaving(true);
      await tasksApi.update(task.id, { title: trimmedTitle });
      setIsInlineEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
      setEditTitle(task.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineEditCancel = () => {
    setIsInlineEditing(false);
    setEditTitle(task.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInlineEditSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleInlineEditCancel();
    }
  };

  const isTaskOverdue = task.dueDate && !task.completedAt && isOverdue(task.dueDate);
  const priorityColor = priorityColors[task.priority] || priorityColors[TaskPriority.MEDIUM];

  return (
    <>
      <div
        className={`flex items-start gap-3 py-3 border-b border-border/50 transition-all duration-200 ${
          isCompleting ? 'opacity-50 scale-98' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Custom Circle Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={isCompleting}
          className="mt-0.5 flex-shrink-0 group"
        >
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              task.completedAt
                ? 'bg-primary border-primary'
                : 'hover:bg-opacity-20'
            }`}
            style={{
              borderColor: task.completedAt ? undefined : priorityColor,
              backgroundColor: task.completedAt ? undefined : 'transparent',
            }}
          >
            {task.completedAt && (
              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isInlineEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleInlineEditSave}
              disabled={isSaving}
              className="w-full bg-transparent text-base outline-none"
              placeholder="Task title..."
            />
          ) : (
            <div
              className={`cursor-pointer transition-colors ${
                task.completedAt
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground hover:text-foreground/80'
              }`}
              onClick={handleInlineEditStart}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleInlineEditStart()}
            >
              {task.title}
            </div>
          )}

          {/* Description */}
          {task.description && !isInlineEditing && (
            <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {task.description}
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && !isInlineEditing && (
            <div className={`flex items-center gap-1 text-xs mt-1.5 ${
              isTaskOverdue ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>{formatTaskDueDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isInlineEditing && (
          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setShowEditForm(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-accent rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
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
