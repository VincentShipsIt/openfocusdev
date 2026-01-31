'use client';

import KanbanBoard from '@/components/kanban-board';
import QuickAddTask from '@/components/quick-add-task';
import TaskForm from '@/components/task-form';
import TaskList from '@/components/task-list';
import WorkflowView from '@/components/workflow-view';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Task, ViewMode } from '@todoist/shared';
import { startOfDay, isBefore, isEqual, parseISO } from 'date-fns';
import { AlertCircle, ChevronDown, ChevronUp, Circle, LayoutGrid, List, Workflow } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

export default function TodayViewPage() {
  const params = useParams<{ view: string }>();
  const view = params.view as ViewType;

  if (!validViews.includes(view)) {
    notFound();
  }

  const viewMode = viewToViewMode(view);
  const { tasks: tasksApi } = useApi();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showOverdue, setShowOverdue] = useState(true);

  const today = startOfDay(new Date());

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await tasksApi.getAll({ completed: false });
      setAllTasks(tasks.filter((t: Task) => t.dueDate));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [tasksApi]);

  const { overdueTasks, todayTasks } = useMemo(() => {
    const overdue: Task[] = [];
    const todayList: Task[] = [];

    for (const task of allTasks) {
      if (!task.dueDate) continue;
      const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
      const taskDate = startOfDay(dueDate);
      if (isBefore(taskDate, today)) {
        overdue.push(task);
      } else if (isEqual(taskDate, today)) {
        todayList.push(task);
      }
    }

    return { overdueTasks: overdue, todayTasks: todayList };
  }, [allTasks, today]);

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

  const handleRescheduleAll = async () => {
    try {
      const todayIso = new Date().toISOString();
      await Promise.all(
        overdueTasks.map((task) => tasksApi.update(task.id, { dueDate: todayIso }))
      );
      toast.success(`Rescheduled ${overdueTasks.length} tasks to today`);
      loadTasks();
    } catch (error) {
      console.error('Failed to reschedule tasks:', error);
      toast.error('Failed to reschedule tasks');
    }
  };

  const totalTasks = overdueTasks.length + todayTasks.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-10 pt-10 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Circle className="h-3.5 w-3.5" />
              <span>
                {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
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
                    href="/today/list"
                    onClick={() => setShowViewMenu(false)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      view === 'list' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    <span>List</span>
                  </Link>
                  <Link
                    href="/today/board"
                    onClick={() => setShowViewMenu(false)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${
                      view === 'board' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Board</span>
                  </Link>
                  <Link
                    href="/today/workflow"
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
          <QuickAddTask
            defaultDueDate={new Date().toISOString()}
            onTaskCreated={loadTasks}
            placeholder="Add a task for today..."
          />
        </div>

        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setShowOverdue(!showOverdue)}
                className="flex items-center gap-2 text-destructive font-medium"
              >
                {showOverdue ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                <AlertCircle className="h-4 w-4" />
                <span>Overdue ({overdueTasks.length})</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRescheduleAll}
                className="text-destructive hover:text-destructive"
              >
                Reschedule
              </Button>
            </div>
            {showOverdue && (
              <div className="border-l-2 border-destructive pl-4">
                <TaskList tasks={overdueTasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
              </div>
            )}
          </div>
        )}

        {/* Workflow View - shows all tasks */}
        {viewMode === ViewMode.WORKFLOW ? (
          <WorkflowView
            tasks={[...overdueTasks, ...todayTasks]}
            onUpdate={handleTaskUpdated}
            onDelete={handleTaskDeleted}
          />
        ) : (
          <>
            {/* Today Section */}
            {todayTasks.length === 0 && overdueTasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No tasks for today</p>
                <p className="text-sm mt-1">Add a task above to get started</p>
              </div>
            ) : todayTasks.length > 0 ? (
              <>
                {overdueTasks.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase">Today</h3>
                )}
                {viewMode === ViewMode.LIST ? (
                  <TaskList tasks={todayTasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
                ) : (
                  <KanbanBoard tasks={todayTasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
                )}
              </>
            ) : null}
          </>
        )}
      </div>

      {showTaskForm && <TaskForm onClose={() => setShowTaskForm(false)} onSuccess={handleTaskCreated} />}
    </div>
  );
}
