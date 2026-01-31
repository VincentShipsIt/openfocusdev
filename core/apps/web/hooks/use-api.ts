'use client';

import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import {
  createCommentsApi,
  createConnectionsApi,
  createGoalsApi,
  createHistoryApi,
  createProjectsApi,
  createTasksApi,
} from '@/lib/api';

export function useApi() {
  const { getToken } = useAuth();

  const api = useMemo(
    () => ({
      tasks: createTasksApi(getToken),
      projects: createProjectsApi(getToken),
      history: createHistoryApi(getToken),
      goals: createGoalsApi(getToken),
      comments: createCommentsApi(getToken),
      connections: createConnectionsApi(getToken),
    }),
    [getToken]
  );

  return api;
}
