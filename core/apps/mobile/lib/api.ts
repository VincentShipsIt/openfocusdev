import { useAuth } from '@clerk/clerk-expo';
import {
  CreateProjectDto,
  CreateTaskDto,
  Project,
  Task,
  UpdateProjectDto,
  UpdateTaskDto,
} from '@todoist/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken) {
      const token = await this.getToken();
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

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text);
  }

  // Tasks API
  tasks = {
    getAll: (params?: {
      projectId?: string;
      completed?: boolean;
      dueDate?: string;
    }): Promise<Task[]> => {
      const query = new URLSearchParams();
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.completed !== undefined)
        query.append('completed', String(params.completed));
      if (params?.dueDate) query.append('dueDate', params.dueDate);
      return this.request<Task[]>(`/tasks?${query.toString()}`);
    },

    getOne: (id: string): Promise<Task> => {
      return this.request<Task>(`/tasks/${id}`);
    },

    create: (data: CreateTaskDto): Promise<Task> => {
      return this.request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: (id: string, data: UpdateTaskDto): Promise<Task> => {
      return this.request<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: (id: string): Promise<void> => {
      return this.request<void>(`/tasks/${id}`, {
        method: 'DELETE',
      });
    },

    bulkComplete: (ids: string[]): Promise<void> => {
      return this.request<void>('/tasks/bulk/complete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },

    bulkDelete: (ids: string[]): Promise<void> => {
      return this.request<void>('/tasks/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
  };

  // Projects API
  projects = {
    getAll: (): Promise<Project[]> => {
      return this.request<Project[]>('/projects');
    },

    getOne: (id: string): Promise<Project> => {
      return this.request<Project>(`/projects/${id}`);
    },

    create: (data: CreateProjectDto): Promise<Project> => {
      return this.request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: (id: string, data: UpdateProjectDto): Promise<Project> => {
      return this.request<Project>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: (id: string): Promise<void> => {
      return this.request<void>(`/projects/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // History API
  history = {
    getAll: (params?: {
      projectId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }): Promise<{ tasks: Task[]; pagination: unknown }> => {
      const query = new URLSearchParams();
      if (params?.projectId) query.append('projectId', params.projectId);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      return this.request<{ tasks: Task[]; pagination: unknown }>(
        `/history?${query.toString()}`
      );
    },
  };
}

export const apiClient = new ApiClient();

// Hook to initialize API client with auth
export function useApiClient() {
  const { getToken } = useAuth();

  apiClient.setTokenGetter(getToken);

  return apiClient;
}
