import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApi } from '@/hooks/use-api';
import QuickAddTask from '../quick-add-task';

vi.mock('@/hooks/use-api');

const mockCreate = vi.fn().mockResolvedValue({});
vi.mocked(useApi).mockReturnValue({
  tasks: {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: mockCreate,
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
  },
  projects: { getAll: vi.fn(), getOne: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
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

describe('QuickAddTask', () => {
  const defaultProps = {
    onTaskCreated: vi.fn(),
    projectId: undefined as string | undefined,
    defaultDueDate: undefined as string | undefined,
  };

  beforeEach(() => {
    mockCreate.mockClear();
    defaultProps.onTaskCreated = vi.fn();
  });

  it('renders input field', () => {
    render(<QuickAddTask {...defaultProps} />);
    expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument();
  });

  it('submits task on Enter key', async () => {
    render(<QuickAddTask {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
      })
    );
  });

  it('clears input after successful submission', async () => {
    render(<QuickAddTask {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('does not submit empty task', async () => {
    render(<QuickAddTask {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, '{enter}');

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only task', async () => {
    render(<QuickAddTask {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, '   {enter}');

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('includes projectId when provided', async () => {
    render(<QuickAddTask {...defaultProps} projectId="project-1" />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        projectId: 'project-1',
      })
    );
  });

  it('includes dueDate when provided', async () => {
    const dueDate = '2025-01-15T00:00:00.000Z';
    render(<QuickAddTask {...defaultProps} defaultDueDate={dueDate} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        dueDate,
      })
    );
  });

  it('trims whitespace from task title', async () => {
    render(<QuickAddTask {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, '  New task  {enter}');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
      })
    );
  });

  it('shows loading state while submitting', async () => {
    mockCreate.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(<QuickAddTask {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(input).toBeDisabled();

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });
});
