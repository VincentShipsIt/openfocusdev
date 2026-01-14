'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Task, Project, ViewMode } from '@todoist/shared';
import TaskList from '@/components/task-list';
import KanbanBoard from '@/components/kanban-board';
import TaskForm from '@/components/task-form';
import QuickAddTask from '@/components/quick-add-task';
import { Button } from '@shipshitdev/ui';
import { Plus, List, LayoutGrid, ArrowLeft } from 'lucide-react';

export default function ProjectPage() {
  const { tasks: tasksApi, projects: projectsApi } = useApi();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
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
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color }}
              />
            )}
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={viewMode === ViewMode.LIST ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode(ViewMode.LIST)}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === ViewMode.KANBAN ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode(ViewMode.KANBAN)}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
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

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No tasks in this project</p>
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
          projectId={projectId}
          onClose={() => setShowTaskForm(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}

