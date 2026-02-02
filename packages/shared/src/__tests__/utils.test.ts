import { addDays, subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { formatDateOnly, formatTaskDueDate, isOverdue } from '../utils';

describe('formatTaskDueDate', () => {
  it('should return empty string for undefined input', () => {
    expect(formatTaskDueDate(undefined)).toBe('');
  });

  it('should format today dates correctly', () => {
    const today = new Date();
    today.setHours(14, 30, 0, 0);
    const result = formatTaskDueDate(today.toISOString());
    expect(result).toMatch(/^Today,/);
  });

  it('should format tomorrow dates correctly', () => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(14, 30, 0, 0);
    const result = formatTaskDueDate(tomorrow.toISOString());
    expect(result).toMatch(/^Tomorrow,/);
  });

  it('should format past dates with relative time', () => {
    const pastDate = subDays(new Date(), 5);
    const result = formatTaskDueDate(pastDate.toISOString());
    expect(result).toContain('ago');
  });

  it('should format future dates with full format', () => {
    const futureDate = addDays(new Date(), 10);
    futureDate.setHours(14, 30, 0, 0);
    const result = formatTaskDueDate(futureDate.toISOString());
    expect(result).toMatch(/\w+ \d+, \d{4}/);
  });

  it('should accept Date objects', () => {
    const date = new Date();
    date.setHours(14, 30, 0, 0);
    const result = formatTaskDueDate(date);
    expect(result).toBeTruthy();
  });
});

describe('formatDateOnly', () => {
  it('should return empty string for undefined input', () => {
    expect(formatDateOnly(undefined)).toBe('');
  });

  it('should return "Today" for today', () => {
    const today = new Date();
    expect(formatDateOnly(today)).toBe('Today');
  });

  it('should return "Tomorrow" for tomorrow', () => {
    const tomorrow = addDays(new Date(), 1);
    expect(formatDateOnly(tomorrow)).toBe('Tomorrow');
  });

  it('should format other dates as "MMM d, yyyy"', () => {
    const futureDate = addDays(new Date(), 10);
    const result = formatDateOnly(futureDate);
    expect(result).toMatch(/\w+ \d+, \d{4}/);
  });

  it('should accept string dates', () => {
    const today = new Date().toISOString();
    expect(formatDateOnly(today)).toBe('Today');
  });
});

describe('isOverdue', () => {
  it('should return false for undefined input', () => {
    expect(isOverdue(undefined)).toBe(false);
  });

  it('should return false for today', () => {
    const today = new Date();
    expect(isOverdue(today.toISOString())).toBe(false);
  });

  it('should return true for past dates', () => {
    const pastDate = subDays(new Date(), 2);
    expect(isOverdue(pastDate.toISOString())).toBe(true);
  });

  it('should return false for future dates', () => {
    const futureDate = addDays(new Date(), 2);
    expect(isOverdue(futureDate.toISOString())).toBe(false);
  });

  it('should accept Date objects', () => {
    const pastDate = subDays(new Date(), 2);
    expect(isOverdue(pastDate)).toBe(true);
  });
});
