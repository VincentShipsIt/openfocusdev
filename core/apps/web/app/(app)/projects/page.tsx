'use client';

import { Project } from '@todoist/shared';
import {
  Archive,
  ClipboardList,
  Lightbulb,
  Pause,
  Play,
  Plus,
  Rocket,
  Send,
  TestTube,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ProjectForm from '@/components/project-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  idea: { label: 'Idea', color: 'text-purple-400', icon: Lightbulb },
  planning: { label: 'Planning', color: 'text-blue-400', icon: ClipboardList },
  'in-progress': { label: 'In Progress', color: 'text-yellow-400', icon: Play },
  testing: { label: 'Testing', color: 'text-orange-400', icon: TestTube },
  launched: { label: 'Launched', color: 'text-green-400', icon: Rocket },
  distributed: { label: 'Distributed', color: 'text-emerald-400', icon: Send },
  paused: { label: 'Paused', color: 'text-gray-400', icon: Pause },
  abandoned: { label: 'Abandoned', color: 'text-red-400', icon: Archive },
};

export default function ProjectsPage() {
  const { projects: projectsApi } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const allProjects = await projectsApi.getAll();
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [projectsApi]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectCreated = () => {
    setShowProjectForm(false);
    loadProjects();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground text-sm mt-1">{projects.length} projects</p>
          </div>
          <Button onClick={() => setShowProjectForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.idea;
            const StatusIcon = statusConfig.icon;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold truncate">{project.name}</h3>
                      <StatusIcon className={`h-4 w-4 flex-shrink-0 ${statusConfig.color}`} />
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${project.progress}%`,
                              backgroundColor: project.color || '#3b82f6',
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {project.progress}%
                        </span>
                      </div>
                      {/* Status badge */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        {project.targetLaunchDate && (
                          <span className="text-xs text-muted-foreground">
                            Target:{' '}
                            {new Date(project.targetLaunchDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No projects yet. Create one to get started!
          </div>
        )}
      </div>

      {showProjectForm && (
        <ProjectForm onClose={() => setShowProjectForm(false)} onSuccess={handleProjectCreated} />
      )}
    </div>
  );
}
