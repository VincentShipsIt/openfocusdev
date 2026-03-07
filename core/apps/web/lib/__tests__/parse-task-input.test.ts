import { TaskPriority } from '@todoist/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseTaskInput } from '../parse-task-input';

describe('parseTaskInput', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('parses priority, project, labels, and tomorrow due date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-07T10:00:00.000Z'));

    const parsed = parseTaskInput('Buy milk tomorrow p1 #Work @urgent');

    expect(parsed.title).toBe('Buy milk');
    expect(parsed.priority).toBe(TaskPriority.URGENT);
    expect(parsed.priorityLevel).toBe(1);
    expect(parsed.projectName).toBe('Work');
    expect(parsed.labels).toEqual(['urgent']);
    expect(parsed.dueDate?.toISOString()).toBe('2026-03-08T10:00:00.000Z');
  });

  it('parses next weekday aliases', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-07T10:00:00.000Z')); // Saturday

    const parsed = parseTaskInput('Plan sprint next mon');

    expect(parsed.title).toBe('Plan sprint');
    expect(parsed.dueDate?.toISOString()).toBe('2026-03-09T10:00:00.000Z');
  });

  it('parses relative day and week ranges', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-07T10:00:00.000Z'));

    expect(parseTaskInput('Call client in 3 days').dueDate?.toISOString()).toBe(
      '2026-03-10T10:00:00.000Z'
    );
    expect(parseTaskInput('Review roadmap in 2 weeks').dueDate?.toISOString()).toBe(
      '2026-03-21T10:00:00.000Z'
    );
  });

  it('deduplicates repeated labels', () => {
    const parsed = parseTaskInput('Ship release @ops @ops @backend');
    expect(parsed.title).toBe('Ship release');
    expect(parsed.labels).toEqual(['ops', 'backend']);
  });
});
