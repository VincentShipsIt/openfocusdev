'use client';

import KanbanBoard from '@/components/kanban-board';
import QuickAddTask from '@/components/quick-add-task';
import TaskForm from '@/components/task-form';
import TaskList from '@/components/task-list';
import { useApi } from '@/hooks/use-api';
import { Button } from '@shipshitdev/ui';
import { Task, ViewMode } from '@todoist/shared';
import { format } from 'date-fns';
import { ChevronDown, Circle, LayoutGrid, List } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function TodayPage() {
  const { tasks: tasksApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const allTasks = await tasksApi.getAll({ dueDate: today, completed: false });
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [tasksApi, today]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    loadTasks();
  };

  const handleTaskUpdated = () => {
    loadTasks();
  };

  const handleTaskDeleted = () => {
    loadTasks();
  };

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Circle className="h-3.5 w-3.5" />
              <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>
          </div>

          {/* View Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="text-muted-foreground hover:text-foreground"
            >
              {viewMode === ViewMode.LIST ? (
                <List className="h-4 w-4 mr-2" />
              ) : (
                <LayoutGrid className="h-4 w-4 mr-2" />
              )}
              <span>View</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>

            {showViewMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowViewMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      setViewMode(ViewMode.LIST);
                      setShowViewMenu(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      viewMode === ViewMode.LIST ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode(ViewMode.KANBAN);
                      setShowViewMenu(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      viewMode === ViewMode.KANBAN ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Board</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-10 pb-10">
        <div className="mb-6">
          <QuickAddTask
            defaultDueDate={new Date().toISOString()}
            onTaskCreated={loadTasks}
            placeholder="Add a task for today..."
          />
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No tasks for today</p>
            <p className="text-sm mt-1">Add a task above to get started</p>
          </div>
        ) : viewMode === ViewMode.LIST ? (
          <TaskList
            tasks={tasks}
            onUpdate={handleTaskUpdated}
            onDelete={handleTaskDeleted}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            onUpdate={handleTaskUpdated}
            onDelete={handleTaskDeleted}
          />
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}
