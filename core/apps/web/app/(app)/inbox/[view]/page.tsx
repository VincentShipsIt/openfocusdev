'use client';

import { Task, ViewMode } from '@todoist/shared';
import { ChevronDown, Circle, LayoutGrid, List, Workflow } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import KanbanBoard from '@/components/kanban-board';
import QuickAddTask from '@/components/quick-add-task';
import TaskForm from '@/components/task-form';
import TaskList from '@/components/task-list';
import { Button } from '@/components/ui/button';
import WorkflowView from '@/components/workflow-view';
import { useApi } from '@/hooks/use-api';

const validViews = ['list', 'board', 'workflow'] as const;
type ViewType = (typeof validViews)[number];

function viewToViewMode(view: ViewType): ViewMode {
  switch (view) {
    case 'list':
      return ViewMode.LIST;
    case 'board':
      return ViewMode.KANBAN;
    case 'workflow':
      return ViewMode.WORKFLOW;
  }
}

export default function InboxViewPage() {
  const params = useParams<{ view: string }>();
  const view = params.view as ViewType;

  if (!validViews.includes(view)) {
    notFound();
  }

  const viewMode = viewToViewMode(view);
  const { tasks: tasksApi } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const allTasks = await tasksApi.getAll({ completed: false });
      const inboxTasks = allTasks.filter((task: Task) => !task.projectId);
      setTasks(inboxTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [tasksApi]);

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
            <h1 className="text-2xl font-bold">Inbox</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Circle className="h-3.5 w-3.5" />
              <span>
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
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
              ) : viewMode === ViewMode.KANBAN ? (
                <LayoutGrid className="h-4 w-4 mr-2" />
              ) : (
                <Workflow className="h-4 w-4 mr-2" />
              )}
              <span>View</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>

            {showViewMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowViewMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]">
                  <Link
                    href="/inbox/list"
                    onClick={() => setShowViewMenu(false)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      view === 'list' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </Link>
                  <Link
                    href="/inbox/board"
                    onClick={() => setShowViewMenu(false)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      view === 'board' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Board</span>
                  </Link>
                  <Link
                    href="/inbox/workflow"
                    onClick={() => setShowViewMenu(false)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      view === 'workflow' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <Workflow className="h-4 w-4" />
                    <span>Workflow</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-10 pb-10">
        <div className="mb-6">
          <QuickAddTask onTaskCreated={loadTasks} placeholder="Add a task to inbox..." />
        </div>

        {tasks.length === 0 && viewMode !== ViewMode.WORKFLOW ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Inbox is empty</p>
            <p className="text-sm mt-1">Add a task above or move tasks here from projects</p>
          </div>
        ) : viewMode === ViewMode.LIST ? (
          <TaskList tasks={tasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
        ) : viewMode === ViewMode.KANBAN ? (
          <KanbanBoard tasks={tasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
        ) : (
          <WorkflowView tasks={tasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
        )}
      </div>

      {showTaskForm && (
        <TaskForm onClose={() => setShowTaskForm(false)} onSuccess={handleTaskCreated} />
      )}
    </div>
  );
}
