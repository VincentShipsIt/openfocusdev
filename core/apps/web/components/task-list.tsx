'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@todoist/shared';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { SortableTaskItem } from './sortable-task-item';
import TaskDetailPanel from './task-detail-panel';

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskList({ tasks, onUpdate, onDelete }: TaskListProps) {
  const { tasks: tasksApi } = useApi();
  const [orderedTasks, setOrderedTasks] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Sync local order when parent tasks change
  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedTasks.findIndex((t) => t.id === active.id);
    const newIndex = orderedTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const reordered = arrayMove(orderedTasks, oldIndex, newIndex);
    setOrderedTasks(reordered);

    // Persist to API
    try {
      await tasksApi.reorder(reordered.map((t) => t.id));
    } catch (err) {
      console.error('Failed to persist task order:', err);
      // Revert on failure
      setOrderedTasks(tasks);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  if (orderedTasks.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No tasks</p>;
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={orderedTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {orderedTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onClick={handleTaskClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <TaskDetailPanel
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={() => {
          onUpdate();
          if (selectedTask) {
            const updated = orderedTasks.find((t) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
          }
        }}
        onDelete={() => {
          onDelete();
          setSelectedTask(null);
        }}
      />
    </>
  );
}
