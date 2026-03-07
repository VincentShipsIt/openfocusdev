'use client';

import { Project, Task } from '@todoist/shared';
import { ChevronDown, ChevronRight, Filter, Hash, Plus, Star, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/use-api';
import { useLabels } from '@/hooks/use-labels';
import { useFilters } from '@/hooks/use-filters';

interface ProjectWithCount extends Project {
  taskCount: number;
}

export default function SidebarProjects() {
  const { projects: projectsApi, tasks: tasksApi } = useApi();
  const { labels } = useLabels();
  const { filters } = useFilters();
  const [isLabelsCollapsed, setIsLabelsCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const pathname = usePathname();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavoritesCollapsed, setIsFavoritesCollapsed] = useState(false);
  const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);
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

  const handleToggleFavorite = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await projectsApi.toggleFavorite(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
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
    return pathname.startsWith(`/projects/${projectId}`);
  };

  const favoriteProjects = projects.filter((p) => p.isFavorite);
  const nonFavoriteProjects = projects.filter((p) => !p.isFavorite);

  const renderProject = (project: ProjectWithCount, showStar = true) => (
    <Link key={project.id} href={`/projects/${project.id}`}>
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors group/item ${
          isProjectActive(project.id)
            ? 'bg-accent text-foreground'
            : 'text-foreground/80 hover:bg-accent'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="h-4 w-4 flex-shrink-0" style={{ color: project.color || '#6b7280' }} />
          <span className="truncate">{project.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {project.taskCount > 0 && (
            <span className="text-xs text-muted-foreground">{project.taskCount}</span>
          )}
          {showStar && (
            <button
              onClick={(e) => handleToggleFavorite(e, project.id)}
              className={`p-0.5 rounded transition-all ${
                project.isFavorite
                  ? 'text-yellow-500'
                  : 'text-muted-foreground opacity-0 group-hover/item:opacity-100 hover:text-yellow-500'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${project.isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-4">
      {/* Favorites Section */}
      {favoriteProjects.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 group">
            <button
              onClick={() => setIsFavoritesCollapsed(!isFavoritesCollapsed)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
            >
              {isFavoritesCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span>Favorites</span>
            </button>
          </div>

          {!isFavoritesCollapsed && (
            <div className="space-y-0.5">
              {favoriteProjects.map((project) => renderProject(project, false))}
            </div>
          )}
        </div>
      )}

      {/* My Projects Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5 group">
          <button
            onClick={() => setIsProjectsCollapsed(!isProjectsCollapsed)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
          >
            {isProjectsCollapsed ? (
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

        {!isProjectsCollapsed && (
          <div className="space-y-0.5">
            {loading ? (
              <div className="px-6 py-2 text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                {nonFavoriteProjects.map((project) => renderProject(project))}

                {nonFavoriteProjects.length === 0 && favoriteProjects.length === 0 && !isAdding && (
                  <div className="px-6 py-2 text-sm text-muted-foreground">No projects yet</div>
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

      {/* Labels Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5 group">
          <button
            onClick={() => setIsLabelsCollapsed(!isLabelsCollapsed)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
          >
            {isLabelsCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            <Tag className="h-3 w-3" />
            <span>Labels</span>
          </button>
          <Link
            href="/labels"
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-all"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
        {!isLabelsCollapsed && (
          <div className="space-y-0.5">
            {labels.length === 0 ? (
              <Link href="/labels" className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground block transition-colors">
                Add a label
              </Link>
            ) : (
              labels.map((label) => (
                <Link key={label.id} href={`/labels/${encodeURIComponent(label.name)}`}>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      pathname === `/labels/${encodeURIComponent(label.name)}`
                        ? 'bg-accent text-foreground'
                        : 'text-foreground/80 hover:bg-accent'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate">{label.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5 group">
          <button
            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
          >
            {isFiltersCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            <Filter className="h-3 w-3" />
            <span>Filters</span>
          </button>
          <Link
            href="/filters"
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-all"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
        {!isFiltersCollapsed && (
          <div className="space-y-0.5">
            {filters.length === 0 ? (
              <Link href="/filters" className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground block transition-colors">
                Add a filter
              </Link>
            ) : (
              filters.map((filter) => (
                <Link key={filter.id} href="/filters">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      pathname === '/filters'
                        ? 'bg-accent text-foreground'
                        : 'text-foreground/80 hover:bg-accent'
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate">{filter.name}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
