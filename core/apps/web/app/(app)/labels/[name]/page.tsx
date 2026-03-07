'use client';

import { Task } from '@todoist/shared';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import TaskList from '@/components/task-list';
import { useLabels } from '@/hooks/use-labels';
import { useApi } from '@/hooks/use-api';

export default function LabelDetailPage() {
  const params = useParams<{ name: string }>();
  const labelName = decodeURIComponent(params.name);
  const { labels } = useLabels();
  const { tasks: tasksApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const label = labels.find((l) => l.name === labelName);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const all = await tasksApi.getAll({ completed: false });
      setTasks(all.filter((t: Task) => t.labels?.includes(labelName)));
    } catch {} finally {
      setLoading(false);
    }
  }, [tasksApi, labelName]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-10 pt-10 pb-4">
        <Link
          href="/labels"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All labels
        </Link>
        <div className="flex items-center gap-3">
          {label && (
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: label.color }}
            />
          )}
          <h1 className="text-2xl font-bold">{labelName}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-7">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-10 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No tasks with this label</p>
            <p className="text-sm mt-1">Assign the &quot;{labelName}&quot; label to tasks to see them here</p>
          </div>
        ) : (
          <TaskList tasks={tasks} onUpdate={loadTasks} onDelete={loadTasks} />
        )}
      </div>
    </div>
  );
}
