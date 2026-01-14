'use client';

import { useApi } from '@/hooks/use-api';
import { Input } from '@shipshitdev/ui';
import { Project, Task } from '@todoist/shared';
import { ChevronDown, ChevronRight, Hash, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProjectWithCount extends Project {
  taskCount: number;
}

export default function SidebarProjects() {
  const { projects: projectsApi, tasks: tasksApi } = useApi();
  const pathname = usePathname();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll({ completed: false }),
      ]);

      const projectsWithCounts = projectsData.map((project) => ({
        ...project,
        taskCount: tasksData.filter((task: Task) => task.projectId === project.id).length,
      }));

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [projectsApi, tasksApi]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddProject = async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await projectsApi.create({ name: trimmedName });
      setNewProjectName('');
      setIsAdding(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProject();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsAdding(false);
      setNewProjectName('');
    }
  };

  const isProjectActive = (projectId: string) => {
    return pathname === `/projects/${projectId}`;
  };

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 py-1.5 group">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          <span>My Projects</span>
        </button>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-all"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-0.5">
          {loading ? (
            <div className="px-6 py-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div
                    className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isProjectActive(project.id)
                        ? 'bg-accent text-foreground'
                        : 'text-foreground/80 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: project.color || '#6b7280' }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                    {project.taskCount > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {project.taskCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {projects.length === 0 && !isAdding && (
                <div className="px-6 py-2 text-sm text-muted-foreground">
                  No projects yet
                </div>
              )}

              {isAdding && (
                <div className="px-3 py-1">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      ref={inputRef}
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        if (!newProjectName.trim()) {
                          setIsAdding(false);
                        }
                      }}
                      disabled={isSubmitting}
                      placeholder="Project name"
                      className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
