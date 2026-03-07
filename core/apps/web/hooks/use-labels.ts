'use client';

import { useCallback, useEffect, useState } from 'react';
import { Label } from '@todoist/shared';

const STORAGE_KEY = 'taskflow-labels';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLabels(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((updated: Label[]) => {
    setLabels(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const createLabel = useCallback(
    (name: string, color: string) => {
      const label: Label = { id: generateId(), name, color, userId: 'local' };
      save([...labels, label]);
      return label;
    },
    [labels, save]
  );

  const updateLabel = useCallback(
    (id: string, patch: Partial<Pick<Label, 'name' | 'color'>>) => {
      save(labels.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    },
    [labels, save]
  );

  const deleteLabel = useCallback(
    (id: string) => {
      save(labels.filter((l) => l.id !== id));
    },
    [labels, save]
  );

  return { labels, createLabel, updateLabel, deleteLabel };
}
