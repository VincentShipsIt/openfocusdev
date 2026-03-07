import { TaskPriority } from '@todoist/shared';

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  priority?: TaskPriority;
  priorityLevel?: 1 | 2 | 3 | 4;
  projectName?: string;
  labels?: string[];
}

const priorityMap: Record<1 | 2 | 3 | 4, TaskPriority> = {
  1: TaskPriority.URGENT,
  2: TaskPriority.HIGH,
  3: TaskPriority.MEDIUM,
  4: TaskPriority.LOW,
};

const dayAliasToIndex: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

export function parseTaskInput(input: string): ParsedTask {
  let remaining = input;
  const result: ParsedTask = { title: '' };
  const now = new Date();

  const priorityMatch = remaining.match(/\bp([1-4])\b/i);
  if (priorityMatch) {
    const level = Number.parseInt(priorityMatch[1], 10) as 1 | 2 | 3 | 4;
    result.priorityLevel = level;
    result.priority = priorityMap[level];
    remaining = remaining.replace(priorityMatch[0], ' ').trim();
  }

  const projectMatch = remaining.match(/(?:^|\s)#([a-z0-9][\w-]*)\b/i);
  if (projectMatch) {
    result.projectName = projectMatch[1];
    remaining = remaining.replace(projectMatch[0], ' ').trim();
  }

  const labelMatches = [...remaining.matchAll(/(?:^|\s)@([a-z0-9][\w-]*)\b/gi)];
  if (labelMatches.length > 0) {
    result.labels = [...new Set(labelMatches.map((match) => match[1]))];
    remaining = remaining.replace(/(?:^|\s)@[a-z0-9][\w-]*\b/gi, ' ').trim();
  }

  if (/\btoday\b/i.test(remaining)) {
    result.dueDate = new Date(now);
    remaining = remaining.replace(/\btoday\b/i, ' ').trim();
  } else if (/\btomorrow\b/i.test(remaining)) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    result.dueDate = date;
    remaining = remaining.replace(/\btomorrow\b/i, ' ').trim();
  } else if (/\bnext week\b/i.test(remaining)) {
    const date = new Date(now);
    date.setDate(date.getDate() + 7);
    result.dueDate = date;
    remaining = remaining.replace(/\bnext week\b/i, ' ').trim();
  } else {
    const nextDayMatch = remaining.match(/\bnext\s+(sun|sunday|mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday)\b/i);
    if (nextDayMatch) {
      const targetDay = dayAliasToIndex[nextDayMatch[1].toLowerCase()];
      const date = new Date(now);
      const diff = (targetDay - date.getDay() + 7) % 7 || 7;
      date.setDate(date.getDate() + diff);
      result.dueDate = date;
      remaining = remaining.replace(nextDayMatch[0], ' ').trim();
    } else {
      const inDaysMatch = remaining.match(/\bin\s+(\d+)\s+days?\b/i);
      if (inDaysMatch) {
        const date = new Date(now);
        date.setDate(date.getDate() + Number.parseInt(inDaysMatch[1], 10));
        result.dueDate = date;
        remaining = remaining.replace(inDaysMatch[0], ' ').trim();
      } else {
        const inWeeksMatch = remaining.match(/\bin\s+(\d+)\s+weeks?\b/i);
        if (inWeeksMatch) {
          const date = new Date(now);
          date.setDate(date.getDate() + Number.parseInt(inWeeksMatch[1], 10) * 7);
          result.dueDate = date;
          remaining = remaining.replace(inWeeksMatch[0], ' ').trim();
        }
      }
    }
  }

  result.title = remaining.replace(/\s+/g, ' ').trim();
  return result;
}
