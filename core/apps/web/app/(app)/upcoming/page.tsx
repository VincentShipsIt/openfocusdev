'use client';

import { useApi } from '@/hooks/use-api';
import TaskList from '@/components/task-list';
import { Task } from '@todoist/shared';
import { addDays, format, isSameDay } from 'date-fns';
import { Circle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function UpcomingPage() {
  const { tasks: tasksApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const allTasks = await tasksApi.getAll({ completed: false });
      const upcomingTasks = allTasks.filter((task) => task.dueDate);
      setTasks(upcomingTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [tasksApi]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const groupTasksByDate = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const date = typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate;
        const dateKey = format(date, 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, tomorrow)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Object.keys(groupedTasks).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-10 pt-10 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Upcoming</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Circle className="h-3.5 w-3.5" />
            <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-10 pb-10 space-y-8">
        {sortedDates.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No upcoming tasks</p>
            <p className="text-sm mt-1">Tasks with due dates will appear here</p>
          </div>
        ) : (
          sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {getDateLabel(dateKey)}
              </h3>
              <TaskList
                tasks={groupedTasks[dateKey]}
                onUpdate={loadTasks}
                onDelete={loadTasks}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
