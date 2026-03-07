'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@todoist/shared';
import { GripVertical } from 'lucide-react';
import TaskItem from './task-item';

interface SortableTaskItemProps {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
  onClick?: (task: Task) => void;
}

export function SortableTaskItem({ task, ...props }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group">
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400 transition-opacity flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <TaskItem task={task} {...props} />
      </div>
    </div>
  );
}
