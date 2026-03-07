'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { parseTaskInput } from '@/lib/parse-task-input';

export function GlobalQuickAdd() {
  const { tasks: tasksApi, projects: projectsApi } = useApi();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseTaskInput> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [projectNameToId, setProjectNameToId] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isEditable =
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');

      if (
        key === 'q' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !isEditable
      ) {
        setOpen(true);
        return;
      }

      if (key === 'escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setInput('');
    setParsed(null);

    const focusTimeout = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(focusTimeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadProjects = async () => {
      try {
        const allProjects = await projectsApi.getAll();
        const mapping = allProjects.reduce<Record<string, string>>((acc, project) => {
          acc[project.name.trim().toLowerCase()] = project.id;
          return acc;
        }, {});
        setProjectNameToId(mapping);
      } catch (error) {
        console.error('Failed to load projects for quick add:', error);
      }
    };

    void loadProjects();
  }, [open, projectsApi]);

  useEffect(() => {
    if (input.trim()) {
      setParsed(parseTaskInput(input));
      return;
    }

    setParsed(null);
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || submitting) {
      return;
    }

    const parsedInput = parseTaskInput(input);
    if (!parsedInput.title) {
      return;
    }

    const normalizedProjectName = parsedInput.projectName?.trim().toLowerCase();
    const projectId = normalizedProjectName ? projectNameToId[normalizedProjectName] : undefined;

    setSubmitting(true);

    try {
      await tasksApi.create({
        title: parsedInput.title,
        dueDate: parsedInput.dueDate?.toISOString(),
        priority: parsedInput.priority,
        projectId,
        labels: parsedInput.labels,
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to create task from quick add:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <Zap size={16} className="text-blue-500" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSubmit();
              }
            }}
            placeholder="Add task… 'Buy milk tomorrow p1 #Work @urgent'"
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 outline-none text-sm"
          />
          <button onClick={() => setOpen(false)}>
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        {parsed && parsed.title && (
          <div className="flex flex-wrap gap-2 text-xs">
            {parsed.dueDate && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                📅 {parsed.dueDate.toLocaleDateString()}
              </span>
            )}
            {parsed.priorityLevel && (
              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                P{parsed.priorityLevel}
              </span>
            )}
            {parsed.projectName && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                #{parsed.projectName}
              </span>
            )}
            {parsed.labels?.map((label) => (
              <span key={label} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                @{label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex justify-between items-center text-xs text-gray-600">
          <span>⌘K to toggle · Enter to save · Esc to close</span>
          <button
            onClick={() => void handleSubmit()}
            disabled={!input.trim() || submitting}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </div>
    </div>
  );
}
