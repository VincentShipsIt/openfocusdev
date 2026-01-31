import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import QuickAddTask from '../quick-add-task';

describe('QuickAddTask', () => {
  const defaultProps = {
    onAdd: vi.fn(),
    projectId: undefined,
    defaultDueDate: undefined,
  };

  it('renders input field', () => {
    render(<QuickAddTask {...defaultProps} />);
    expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument();
  });

  it('submits task on Enter key', async () => {
    const onAdd = vi.fn();
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
      })
    );
  });

  it('clears input after successful submission', async () => {
    const onAdd = vi.fn();
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(input).toHaveValue('');
  });

  it('does not submit empty task', async () => {
    const onAdd = vi.fn();
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, '{enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only task', async () => {
    const onAdd = vi.fn();
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, '   {enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('includes projectId when provided', async () => {
    const onAdd = vi.fn();
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} projectId="project-1" />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        projectId: 'project-1',
      })
    );
  });

  it('includes dueDate when provided', async () => {
    const onAdd = vi.fn();
    const dueDate = new Date('2025-01-15');
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} defaultDueDate={dueDate} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        dueDate: dueDate.toISOString(),
      })
    );
  });

  it('trims whitespace from task title', async () => {
    const onAdd = vi.fn();
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, '  New task  {enter}');

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
      })
    );
  });

  it('shows loading state while submitting', async () => {
    const onAdd = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<QuickAddTask {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{enter}');

    // Input should be disabled while loading
    expect(input).toBeDisabled();

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });
});
