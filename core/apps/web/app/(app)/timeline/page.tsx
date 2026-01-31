'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Project, ProjectStatus, Task } from '@todoist/shared';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Rocket, Pause, Archive, Lightbulb, ClipboardList, Play, TestTube, Send } from 'lucide-react';
import ProjectForm from '@/components/project-form';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  'idea': { label: 'Idea', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: Lightbulb },
  'planning': { label: 'Planning', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: ClipboardList },
  'in-progress': { label: 'In Progress', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Play },
  'testing': { label: 'Testing', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: TestTube },
  'launched': { label: 'Launched', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: Rocket },
  'distributed': { label: 'Distributed', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: Send },
  'paused': { label: 'Paused', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: Pause },
  'abandoned': { label: 'Abandoned', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: Archive },
};

const CATEGORY_COLORS: Record<string, string> = {
  'side-project': '#8b5cf6',
  'money-maker': '#22c55e',
  'tool': '#3b82f6',
  'oss': '#f97316',
  'family': '#ec4899',
  'experiment': '#eab308',
  'other': '#6b7280',
};

interface ProjectWithTasks extends Project {
  taskCount: number;
  completedTaskCount: number;
}

export default function TimelinePage() {
  const { projects: projectsApi, tasks: tasksApi } = useApi();
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [timelineOffset, setTimelineOffset] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll({}),
      ]);

      const projectsWithTasks = projectsData.map((project) => ({
        ...project,
        taskCount: tasksData.filter((task: Task) => task.projectId === project.id).length,
        completedTaskCount: tasksData.filter((task: Task) => task.projectId === project.id && task.completedAt).length,
      }));

      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectsApi, tasksApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProjectCreated = () => {
    setShowProjectForm(false);
    loadData();
  };

  // Calculate timeline dates (show 6 months)
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() + timelineOffset, 1);
  const months: Date[] = [];
  for (let i = 0; i < 6; i++) {
    months.push(new Date(startDate.getFullYear(), startDate.getMonth() + i, 1));
  }

  const getBarPosition = (project: ProjectWithTasks) => {
    const projectStart = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
    const projectEnd = project.targetLaunchDate ? new Date(project.targetLaunchDate) : null;

    const timelineStart = months[0].getTime();
    const timelineEnd = new Date(months[5].getFullYear(), months[5].getMonth() + 1, 0).getTime();
    const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);

    const startOffset = Math.max(0, (projectStart.getTime() - timelineStart) / (1000 * 60 * 60 * 24));
    const startPercent = (startOffset / totalDays) * 100;

    let widthPercent: number;
    if (projectEnd) {
      const endOffset = Math.min(totalDays, (projectEnd.getTime() - timelineStart) / (1000 * 60 * 60 * 24));
      widthPercent = ((endOffset - startOffset) / totalDays) * 100;
    } else {
      widthPercent = ((totalDays - startOffset) / totalDays) * 100 * 0.3; // Default 30% of remaining
    }

    return {
      left: `${Math.max(0, Math.min(100, startPercent))}%`,
      width: `${Math.max(2, Math.min(100 - startPercent, widthPercent))}%`,
    };
  };

  // Group projects by status
  const statusOrder: ProjectStatus[] = [
    ProjectStatus.IDEA,
    ProjectStatus.PLANNING,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.TESTING,
    ProjectStatus.LAUNCHED,
    ProjectStatus.DISTRIBUTED,
  ];

  const activeProjects = projects.filter(p => !['paused', 'abandoned'].includes(p.status));
  const pausedProjects = projects.filter(p => ['paused', 'abandoned'].includes(p.status));

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timeline</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {projects.length} projects • {activeProjects.length} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTimelineOffset(o => o - 3)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTimelineOffset(0)}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTimelineOffset(o => o + 3)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowProjectForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Status Pipeline */}
        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Status Pipeline</h2>
          <div className="flex gap-2">
            {statusOrder.map((status) => {
              const config = STATUS_CONFIG[status];
              const count = projects.filter(p => p.status === status).length;
              const Icon = config.icon;
              return (
                <div
                  key={status}
                  className={`flex-1 rounded-lg p-3 ${config.bgColor} border border-border/50`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Project Timeline</h2>

          {/* Timeline Header */}
          <div className="flex border-b border-border pb-2 mb-4">
            <div className="w-64 flex-shrink-0 font-medium text-sm">Project</div>
            <div className="flex-1 flex">
              {months.map((month) => (
                <div key={month.toISOString()} className="flex-1 text-center text-sm text-muted-foreground">
                  {month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </div>
              ))}
            </div>
          </div>

          {/* Today Indicator */}
          <div className="relative">
            {activeProjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active projects. Create one to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((project) => {
                  const barPos = getBarPosition(project);
                  const statusConfig = STATUS_CONFIG[project.status];
                  const StatusIcon = statusConfig.icon;
                  const projectColor = project.color || CATEGORY_COLORS[project.category] || '#6b7280';

                  return (
                    <div key={project.id} className="flex items-center group">
                      <Link href={`/projects/${project.id}`} className="w-64 flex-shrink-0 pr-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: projectColor }}
                          />
                          <span className="font-medium truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </span>
                          <StatusIcon className={`h-3 w-3 flex-shrink-0 ${statusConfig.color}`} />
                        </div>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate ml-5">
                            {project.description}
                          </p>
                        )}
                      </Link>
                      <div className="flex-1 relative h-8 bg-muted/30 rounded overflow-hidden">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {months.map((_, i) => (
                            <div key={i} className="flex-1 border-r border-border/30 last:border-r-0" />
                          ))}
                        </div>
                        {/* Project bar */}
                        <div
                          className="absolute top-1 bottom-1 rounded flex items-center px-2 text-xs font-medium text-white transition-all hover:opacity-90"
                          style={{
                            left: barPos.left,
                            width: barPos.width,
                            backgroundColor: projectColor,
                          }}
                        >
                          <span className="truncate">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Paused/Abandoned Section */}
          {pausedProjects.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Paused & Archived</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pausedProjects.map((project) => {
                  const statusConfig = STATUS_CONFIG[project.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                        <span className="font-medium truncate">{project.name}</span>
                      </div>
                      <span className={`text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
}
