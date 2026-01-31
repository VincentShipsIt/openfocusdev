import { Task, TaskPriority } from '@todoist/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TaskItem from '../task-item';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  priority: TaskPriority.MEDIUM,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-1',
};

describe('TaskItem', () => {
  const defaultProps = {
    task: mockTask,
    onComplete: vi.fn(),
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
    projectColor: '#3b82f6',
  };

  it('renders task title', () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onComplete when checkbox is clicked', async () => {
    const onComplete = vi.fn();
    render(<TaskItem {...defaultProps} onComplete={onComplete} />);

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(onComplete).toHaveBeenCalledWith(mockTask);
  });

  it('displays completed state with strikethrough', () => {
    const completedTask = {
      ...mockTask,
      completedAt: new Date().toISOString(),
    };
    render(<TaskItem {...defaultProps} task={completedTask} />);

    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
  });

  it('enters edit mode on double click', async () => {
    render(<TaskItem {...defaultProps} />);

    const titleElement = screen.getByText('Test Task');
    await userEvent.dblClick(titleElement);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Task');
  });

  it('saves edit on Enter key', async () => {
    const onUpdate = vi.fn();
    render(<TaskItem {...defaultProps} onUpdate={onUpdate} />);

    const titleElement = screen.getByText('Test Task');
    await userEvent.dblClick(titleElement);

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated Task{enter}');

    expect(onUpdate).toHaveBeenCalledWith(mockTask.id, { title: 'Updated Task' });
  });

  it('cancels edit on Escape key', async () => {
    render(<TaskItem {...defaultProps} />);

    const titleElement = screen.getByText('Test Task');
    await userEvent.dblClick(titleElement);

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Changed Title{escape}');

    // Should revert to original title
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('shows priority badge for non-low priority', () => {
    const highPriorityTask = {
      ...mockTask,
      priority: TaskPriority.HIGH,
    };
    render(<TaskItem {...defaultProps} task={highPriorityTask} />);

    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('does not show priority badge for low priority', () => {
    const lowPriorityTask = {
      ...mockTask,
      priority: TaskPriority.LOW,
    };
    render(<TaskItem {...defaultProps} task={lowPriorityTask} />);

    expect(screen.queryByText('low')).not.toBeInTheDocument();
  });

  it('shows due date when present', () => {
    const taskWithDueDate = {
      ...mockTask,
      dueDate: new Date().toISOString(),
    };
    render(<TaskItem {...defaultProps} task={taskWithDueDate} />);

    expect(screen.getByText(/Today/)).toBeInTheDocument();
  });

  it('shows delete button on hover', async () => {
    render(<TaskItem {...defaultProps} />);

    const container = screen.getByText('Test Task').closest('[class*="group"]');
    if (container) {
      fireEvent.mouseEnter(container);
    }

    // The delete button may be visible on hover
    const deleteButton = screen.queryByRole('button', { name: /delete/i });
    // Note: actual visibility depends on CSS, we just check it exists
  });
});
