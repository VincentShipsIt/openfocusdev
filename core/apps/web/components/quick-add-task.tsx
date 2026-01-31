'use client';

import { CreateTaskDto, TaskPriority } from '@todoist/shared';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useApi } from '@/hooks/use-api';

interface QuickAddTaskProps {
  projectId?: string;
  defaultDueDate?: string;
  onTaskCreated: () => void;
  placeholder?: string;
}

export default function QuickAddTask({
  projectId,
  defaultDueDate,
  onTaskCreated,
  placeholder = 'Add a task...',
}: QuickAddTaskProps) {
  const { tasks: tasksApi } = useApi();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const taskData: CreateTaskDto = {
        title: trimmedTitle,
        priority: TaskPriority.MEDIUM,
      };

      if (projectId) {
        taskData.projectId = projectId;
      }

      if (defaultDueDate) {
        taskData.dueDate = defaultDueDate;
      }

      await tasksApi.create(taskData);
      setTitle('');
      onTaskCreated();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTitle('');
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 py-2 transition-all duration-200 cursor-text ${
        isFocused ? 'opacity-100' : 'opacity-70 hover:opacity-100'
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      <Plus
        className={`h-5 w-5 flex-shrink-0 transition-colors ${
          isFocused ? 'text-primary' : 'text-muted-foreground'
        }`}
      />
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={isSubmitting}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />
      {title.trim() && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">Press Enter</span>
      )}
    </div>
  );
}
