'use client';

import { Project, Task, ViewMode } from '@todoist/shared';
import { ArrowLeft, LayoutGrid, List, Plus, Workflow } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
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

export default function ProjectViewPage() {
  const { tasks: tasksApi, projects: projectsApi } = useApi();
  const params = useParams<{ id: string; view: string }>();
  const router = useRouter();
  const projectId = params.id;
  const view = params.view as ViewType;

  if (!validViews.includes(view)) {
    notFound();
  }

  const viewMode = viewToViewMode(view);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        projectsApi.getOne(projectId),
        tasksApi.getAll({ projectId, completed: false }),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectsApi, tasksApi, projectId]);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId, loadData]);

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    loadData();
  };

  const handleTaskUpdated = () => {
    loadData();
  };

  const handleTaskDeleted = () => {
    loadData();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {project.color && (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            )}
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Link href={`/projects/${projectId}/list`}>
            <Button variant={view === 'list' ? 'default' : 'outline'} size="sm">
              <List className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/projects/${projectId}/board`}>
            <Button variant={view === 'board' ? 'default' : 'outline'} size="sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/projects/${projectId}/workflow`}>
            <Button variant={view === 'workflow' ? 'default' : 'outline'} size="sm">
              <Workflow className="h-4 w-4" />
            </Button>
          </Link>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4">
          <QuickAddTask
            projectId={projectId}
            onTaskCreated={loadData}
            placeholder={`Add a task to ${project.name}...`}
          />
        </div>

        {tasks.length === 0 && viewMode !== ViewMode.WORKFLOW ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No tasks in this project</p>
            <p className="text-sm mt-1">Add a task above to get started</p>
          </div>
        ) : viewMode === ViewMode.LIST ? (
          <TaskList tasks={tasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
        ) : viewMode === ViewMode.KANBAN ? (
          <KanbanBoard tasks={tasks} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
        ) : (
          <WorkflowView
            tasks={tasks}
            projectId={projectId}
            onUpdate={handleTaskUpdated}
            onDelete={handleTaskDeleted}
          />
        )}
      </div>

      {showTaskForm && (
        <TaskForm
          projectId={projectId}
          onClose={() => setShowTaskForm(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}
