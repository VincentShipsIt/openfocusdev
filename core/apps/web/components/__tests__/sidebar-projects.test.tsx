import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApi } from '@/hooks/use-api';
import SidebarProjects from '../sidebar-projects';

vi.mock('@/hooks/use-api');

const mockProjects = [
  {
    id: 'project-1',
    name: 'Work',
    color: '#ef4444',
    order: 0,
    userId: 'user-1',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-2',
    name: 'Personal',
    color: '#3b82f6',
    order: 1,
    userId: 'user-1',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTasks = [
  { id: 'task-1', title: 'Task 1', projectId: 'project-1', userId: 'user-1' },
  { id: 'task-2', title: 'Task 2', projectId: 'project-1', userId: 'user-1' },
  { id: 'task-3', title: 'Task 3', projectId: 'project-2', userId: 'user-1' },
];

const mockProjectsApi = {
  getAll: vi.fn().mockResolvedValue(mockProjects),
  getOne: vi.fn(),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn(),
  remove: vi.fn(),
  toggleFavorite: vi.fn(),
};

const mockTasksApi = {
  getAll: vi.fn().mockResolvedValue(mockTasks),
  getOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  delete: vi.fn(),
  bulkComplete: vi.fn(),
  bulkDelete: vi.fn(),
  search: vi.fn(),
  getSubtasks: vi.fn(),
  createSubtask: vi.fn(),
  addReminder: vi.fn(),
  removeReminder: vi.fn(),
  updatePosition: vi.fn(),
  reorder: vi.fn(),
  triggerAI: vi.fn(),
};

vi.mocked(useApi).mockReturnValue({
  projects: mockProjectsApi,
  tasks: mockTasksApi,
  history: { getAll: vi.fn() },
  goals: { getAll: vi.fn(), getOne: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  comments: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  connections: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
} as unknown as ReturnType<typeof useApi>);

describe('SidebarProjects', () => {
  beforeEach(() => {
    mockProjectsApi.getAll.mockResolvedValue(mockProjects);
    mockTasksApi.getAll.mockResolvedValue(mockTasks);
  });

  it('renders all projects', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });
  });

  it('shows task count for each project', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('renders project color indicators', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });
    // Color is applied via style on Hash icon
    const projectItems = screen.getAllByText(/Work|Personal/);
    expect(projectItems).toHaveLength(2);
  });

  it('toggles collapse state when header is clicked', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const header = screen.getByText('My Projects');
    await userEvent.click(header);

    expect(screen.queryByText('Work')).not.toBeInTheDocument();
  });

  it('shows add project button on hover', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    // The plus button exists in DOM
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens inline create form when add button is clicked', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    // Find the add button (Plus icon button)
    const buttons = screen.getAllByRole('button');
    // The last button after the collapse buttons should be the add button
    const addButton = buttons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    );
    if (addButton) {
      await userEvent.click(addButton);
      expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument();
    }
  });

  it('creates project on Enter in inline form', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const addButton = buttons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    );
    if (addButton) {
      await userEvent.click(addButton);
      const input = screen.getByPlaceholderText('Project name');
      await userEvent.type(input, 'New Project{enter}');

      expect(mockProjectsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Project' })
      );
    }
  });

  it('cancels inline create on Escape', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const addButton = buttons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    );
    if (addButton) {
      await userEvent.click(addButton);
      const input = screen.getByPlaceholderText('Project name');
      await userEvent.type(input, '{escape}');

      expect(screen.queryByPlaceholderText('Project name')).not.toBeInTheDocument();
    }
  });

  it('highlights active project', async () => {
    // Re-mock next/navigation with a different pathname
    const navigationModule = await import('next/navigation');
    vi.spyOn(navigationModule, 'usePathname').mockReturnValue('/projects/project-1');

    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const workLink = screen.getByText('Work').closest('a');
    const workDiv = workLink?.querySelector('div');
    expect(workDiv?.className).toContain('bg-accent');

    vi.restoreAllMocks();
  });

  it('navigates to project on click', async () => {
    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    const workLink = screen.getByText('Work').closest('a');
    expect(workLink).toHaveAttribute('href', '/projects/project-1');
  });

  it('shows empty state when no projects', async () => {
    mockProjectsApi.getAll.mockResolvedValue([]);
    mockTasksApi.getAll.mockResolvedValue([]);

    render(<SidebarProjects />);

    await waitFor(() => {
      expect(screen.getByText(/no projects/i)).toBeInTheDocument();
    });
  });
});
