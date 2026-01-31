import { Project, Task, TaskPriority } from '@todoist/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SidebarProjects from '../sidebar-projects';

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Work',
    color: '#ef4444',
    order: 0,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-2',
    name: 'Personal',
    color: '#3b82f6',
    order: 1,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Task 1',
    projectId: 'project-1',
    priority: TaskPriority.MEDIUM,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
  },
  {
    id: 'task-2',
    title: 'Task 2',
    projectId: 'project-1',
    priority: TaskPriority.MEDIUM,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
  },
  {
    id: 'task-3',
    title: 'Task 3',
    projectId: 'project-2',
    priority: TaskPriority.MEDIUM,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
  },
];

describe('SidebarProjects', () => {
  const defaultProps = {
    projects: mockProjects,
    tasks: mockTasks,
    onCreateProject: vi.fn(),
    activeProjectId: undefined,
  };

  it('renders all projects', () => {
    render(<SidebarProjects {...defaultProps} />);

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('shows task count for each project', () => {
    render(<SidebarProjects {...defaultProps} />);

    // Work has 2 tasks, Personal has 1
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders project color indicators', () => {
    render(<SidebarProjects {...defaultProps} />);

    const colorDots = screen.getAllByTestId('project-color-dot');
    expect(colorDots).toHaveLength(2);
  });

  it('toggles collapse state when header is clicked', async () => {
    render(<SidebarProjects {...defaultProps} />);

    const header = screen.getByText('Projects');
    await userEvent.click(header);

    // Projects should be hidden after collapse
    expect(screen.queryByText('Work')).not.toBeVisible();
  });

  it('shows add project button', () => {
    render(<SidebarProjects {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
  });

  it('opens inline create form when add button is clicked', async () => {
    render(<SidebarProjects {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add project/i });
    await userEvent.click(addButton);

    expect(screen.getByPlaceholderText(/project name/i)).toBeInTheDocument();
  });

  it('creates project on Enter in inline form', async () => {
    const onCreateProject = vi.fn();
    render(<SidebarProjects {...defaultProps} onCreateProject={onCreateProject} />);

    const addButton = screen.getByRole('button', { name: /add project/i });
    await userEvent.click(addButton);

    const input = screen.getByPlaceholderText(/project name/i);
    await userEvent.type(input, 'New Project{enter}');

    expect(onCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Project',
      })
    );
  });

  it('cancels inline create on Escape', async () => {
    render(<SidebarProjects {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add project/i });
    await userEvent.click(addButton);

    const input = screen.getByPlaceholderText(/project name/i);
    await userEvent.type(input, 'New Project{escape}');

    expect(screen.queryByPlaceholderText(/project name/i)).not.toBeInTheDocument();
  });

  it('highlights active project', () => {
    render(<SidebarProjects {...defaultProps} activeProjectId="project-1" />);

    const workProject = screen.getByText('Work').closest('a');
    expect(workProject).toHaveClass('bg-accent');
  });

  it('navigates to project on click', async () => {
    render(<SidebarProjects {...defaultProps} />);

    const workProject = screen.getByText('Work');
    expect(workProject.closest('a')).toHaveAttribute('href', '/projects/project-1');
  });

  it('shows empty state when no projects', () => {
    render(<SidebarProjects {...defaultProps} projects={[]} tasks={[]} />);

    expect(screen.getByText(/no projects/i)).toBeInTheDocument();
  });
});
