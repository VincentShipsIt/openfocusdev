'use client';

import { useCallback, useEffect, useState } from 'react';
import { SavedFilter, FilterCondition } from '@todoist/shared';

const STORAGE_KEY = 'taskflow-filters';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useFilters() {
  const [filters, setFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFilters(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((updated: SavedFilter[]) => {
    setFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const createFilter = useCallback(
    (name: string, conditions: FilterCondition[]) => {
      const filter: SavedFilter = { id: generateId(), name, conditions, userId: 'local' };
      save([...filters, filter]);
      return filter;
    },
    [filters, save]
  );

  const deleteFilter = useCallback(
    (id: string) => {
      save(filters.filter((f) => f.id !== id));
    },
    [filters, save]
  );

  return { filters, createFilter, deleteFilter };
}
