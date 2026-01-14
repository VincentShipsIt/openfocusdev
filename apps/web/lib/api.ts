'use client';

import { Task, Project, Goal, CreateTaskDto, UpdateTaskDto, CreateProjectDto, UpdateProjectDto, CreateGoalDto, UpdateGoalDto } from '@todoist/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (getToken) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Create API functions that accept a getToken function from useAuth hook
export function createTasksApi(getToken: () => Promise<string | null>) {
  return {
    getAll: (params?: { projectId?: string; completed?: boolean; dueDate?: string }): Promise<Task[]> => {
      const query = new URLSearchParams();
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.completed !== undefined) query.append('completed', String(params.completed));
      if (params?.dueDate) query.append('dueDate', params.dueDate);
      return apiRequest<Task[]>(`/tasks?${query.toString()}`, {}, getToken);
    },

    getOne: (id: string): Promise<Task> => {
      return apiRequest<Task>(`/tasks/${id}`, {}, getToken);
    },

    create: (data: CreateTaskDto): Promise<Task> => {
      return apiRequest<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken);
    },

    update: (id: string, data: UpdateTaskDto): Promise<Task> => {
      return apiRequest<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, getToken);
    },

    delete: (id: string): Promise<void> => {
      return apiRequest<void>(`/tasks/${id}`, {
        method: 'DELETE',
      }, getToken);
    },

    bulkComplete: (ids: string[]): Promise<void> => {
      return apiRequest<void>('/tasks/bulk/complete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }, getToken);
    },

    bulkDelete: (ids: string[]): Promise<void> => {
      return apiRequest<void>('/tasks/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }, getToken);
    },
  };
}

export function createProjectsApi(getToken: () => Promise<string | null>) {
  return {
    getAll: (): Promise<Project[]> => {
      return apiRequest<Project[]>('/projects', {}, getToken);
    },

    getOne: (id: string): Promise<Project> => {
      return apiRequest<Project>(`/projects/${id}`, {}, getToken);
    },

    create: (data: CreateProjectDto): Promise<Project> => {
      return apiRequest<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken);
    },

    update: (id: string, data: UpdateProjectDto): Promise<Project> => {
      return apiRequest<Project>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, getToken);
    },

    delete: (id: string): Promise<void> => {
      return apiRequest<void>(`/projects/${id}`, {
        method: 'DELETE',
      }, getToken);
    },
  };
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HistoryResult {
  tasks: Task[];
  pagination: PaginationResult;
}

export function createHistoryApi(getToken: () => Promise<string | null>) {
  return {
    getAll: (params?: { projectId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<HistoryResult> => {
      const query = new URLSearchParams();
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      return apiRequest<HistoryResult>(`/history?${query.toString()}`, {}, getToken);
    },
  };
}

export function createGoalsApi(getToken: () => Promise<string | null>) {
  return {
    getAll: (params?: { category?: string; targetYear?: number }): Promise<Goal[]> => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.targetYear) query.append('targetYear', String(params.targetYear));
      return apiRequest<Goal[]>(`/goals?${query.toString()}`, {}, getToken);
    },

    getOne: (id: string): Promise<Goal> => {
      return apiRequest<Goal>(`/goals/${id}`, {}, getToken);
    },

    create: (data: CreateGoalDto): Promise<Goal> => {
      return apiRequest<Goal>('/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken);
    },

    update: (id: string, data: UpdateGoalDto): Promise<Goal> => {
      return apiRequest<Goal>(`/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, getToken);
    },

    delete: (id: string): Promise<void> => {
      return apiRequest<void>(`/goals/${id}`, {
        method: 'DELETE',
      }, getToken);
    },

    toggleMilestone: (goalId: string, milestoneId: string): Promise<Goal> => {
      return apiRequest<Goal>(`/goals/${goalId}/milestones/${milestoneId}/toggle`, {
        method: 'POST',
      }, getToken);
    },
  };
}

