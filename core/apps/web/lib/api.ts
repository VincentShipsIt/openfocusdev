'use client';

import { Task, Project, Goal, Comment, Reminder, CreateTaskDto, UpdateTaskDto, CreateProjectDto, UpdateProjectDto, CreateGoalDto, UpdateGoalDto, CreateCommentDto, UpdateCommentDto, AddReminderDto, TaskConnection, CreateConnectionDto, UpdateNodePositionDto, TriggerAIExecutionDto } from '@todoist/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Deserialize JSON:API response to plain objects
function deserializeJsonApi<T>(response: any): T {
  // Handle null/undefined/empty responses
  if (response === null || response === undefined) {
    return response as T;
  }

  // Check if this is a JSON:API formatted response
  // JSON:API responses have a "data" key at the root level with items containing "type", "id", and "attributes"
  if (typeof response === 'object' && 'data' in response) {
    const data = response.data;

    // Handle null data
    if (data === null || data === undefined) {
      return data as T;
    }

    const deserializeItem = (item: any) => {
      // Only deserialize if it looks like a JSON:API resource object
      if (item && typeof item === 'object' && 'attributes' in item) {
        return {
          id: item.id,
          ...item.attributes,
        };
      }
      return item;
    };

    if (Array.isArray(data)) {
      return data.map(deserializeItem) as T;
    }

    return deserializeItem(data) as T;
  }

  // Not a JSON:API response, return as-is
  return response as T;
}

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

  const json = await response.json();
  return deserializeJsonApi<T>(json);
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

    search: (query: string): Promise<Task[]> => {
      return apiRequest<Task[]>(`/tasks/search?q=${encodeURIComponent(query)}`, {}, getToken);
    },

    getSubtasks: (taskId: string): Promise<Task[]> => {
      return apiRequest<Task[]>(`/tasks/${taskId}/subtasks`, {}, getToken);
    },

    createSubtask: (parentTaskId: string, data: Omit<CreateTaskDto, 'projectId'>): Promise<Task> => {
      return apiRequest<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...data, parentTaskId }),
      }, getToken);
    },

    addReminder: (taskId: string, data: AddReminderDto): Promise<Task> => {
      return apiRequest<Task>(`/tasks/${taskId}/reminders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken);
    },

    removeReminder: (taskId: string, reminderId: string): Promise<Task> => {
      return apiRequest<Task>(`/tasks/${taskId}/reminders/${reminderId}`, {
        method: 'DELETE',
      }, getToken);
    },

    updatePosition: (id: string, position: UpdateNodePositionDto): Promise<Task> => {
      return apiRequest<Task>(`/tasks/${id}/position`, {
        method: 'PATCH',
        body: JSON.stringify(position),
      }, getToken);
    },

    triggerAI: (id: string, data?: TriggerAIExecutionDto): Promise<Task> => {
      return apiRequest<Task>(`/tasks/${id}/ai/execute`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
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

    toggleFavorite: (id: string): Promise<Project> => {
      return apiRequest<Project>(`/projects/${id}/favorite`, {
        method: 'POST',
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

export function createCommentsApi(getToken: () => Promise<string | null>) {
  return {
    getByTask: (taskId: string): Promise<Comment[]> => {
      return apiRequest<Comment[]>(`/tasks/${taskId}/comments`, {}, getToken);
    },

    create: (taskId: string, data: CreateCommentDto): Promise<Comment> => {
      return apiRequest<Comment>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken);
    },

    update: (id: string, data: UpdateCommentDto): Promise<Comment> => {
      return apiRequest<Comment>(`/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }, getToken);
    },

    delete: (id: string): Promise<void> => {
      return apiRequest<void>(`/comments/${id}`, {
        method: 'DELETE',
      }, getToken);
    },
  };
}

export function createConnectionsApi(getToken: () => Promise<string | null>) {
  return {
    getAll: (params?: { projectId?: string; taskId?: string }): Promise<TaskConnection[]> => {
      const query = new URLSearchParams();
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.taskId) query.append('taskId', params.taskId);
      return apiRequest<TaskConnection[]>(`/connections?${query.toString()}`, {}, getToken);
    },

    create: (data: CreateConnectionDto): Promise<TaskConnection> => {
      return apiRequest<TaskConnection>('/connections', {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken);
    },

    delete: (id: string): Promise<void> => {
      return apiRequest<void>(`/connections/${id}`, {
        method: 'DELETE',
      }, getToken);
    },
  };
}

