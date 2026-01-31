'use client';

import TaskList from '@/components/task-list';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Task } from '@todoist/shared';
import { useEffect, useState, useCallback } from 'react';

export default function HistoryPage() {
  const { history: historyApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const result = await historyApi.getAll({ page, limit: 50 });
      if (page === 1) {
        setTasks(result.tasks);
      } else {
        setTasks(prev => [...prev, ...result.tasks]);
      }
      setHasMore(result.pagination.page < result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, [historyApi, page]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (loading && page === 1) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card p-6">
        <h1 className="text-2xl font-bold">Completed Tasks</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No completed tasks</p>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onUpdate={loadTasks}
              onDelete={loadTasks}
            />
            {hasMore && (
              <div className="mt-4 text-center">
                <Button onClick={() => setPage(prev => prev + 1)} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

