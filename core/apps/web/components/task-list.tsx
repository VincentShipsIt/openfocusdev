'use client';

import { Task } from '@todoist/shared';
import { useState } from 'react';
import TaskDetailPanel from './task-detail-panel';
import TaskItem from './task-item';

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskList({ tasks, onUpdate, onDelete }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  if (tasks.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No tasks</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClick={handleTaskClick}
          />
        ))}
      </div>

      <TaskDetailPanel
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={() => {
          onUpdate();
          // Refresh the selected task if it exists
          if (selectedTask) {
            const updated = tasks.find((t) => t.id === selectedTask.id);
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
