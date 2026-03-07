'use client';

import { Task } from '@todoist/shared';
import { Check, Edit2, Plus, Tag, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useLabels } from '@/hooks/use-labels';
import { useApi } from '@/hooks/use-api';

const PRESET_COLORS = [
  { name: 'red', class: 'bg-red-500', value: '#ef4444' },
  { name: 'orange', class: 'bg-orange-500', value: '#f97316' },
  { name: 'yellow', class: 'bg-yellow-500', value: '#eab308' },
  { name: 'green', class: 'bg-green-500', value: '#22c55e' },
  { name: 'teal', class: 'bg-teal-500', value: '#14b8a6' },
  { name: 'blue', class: 'bg-blue-500', value: '#3b82f6' },
  { name: 'purple', class: 'bg-purple-500', value: '#a855f7' },
  { name: 'pink', class: 'bg-pink-500', value: '#ec4899' },
];

export default function LabelsPage() {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels();
  const { tasks: tasksApi } = useApi();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[5].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const tasks = await tasksApi.getAll({ completed: false });
      setAllTasks(tasks);
    } catch {}
  }, [tasksApi]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const getTaskCount = (labelName: string) =>
    allTasks.filter((t) => t.labels?.includes(labelName)).length;

  const handleCreate = () => {
    if (!newName.trim()) return;
    createLabel(newName.trim(), newColor);
    setNewName('');
    setNewColor(PRESET_COLORS[5].value);
    setIsAdding(false);
  };

  const startEdit = (id: string, name: string, color: string) => {
    setEditingId(id);
    setEditName(name);
    setEditColor(color);
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateLabel(id, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-10 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Labels</h1>
            <p className="text-sm text-muted-foreground mt-1">{labels.length} labels</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New label
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 pb-10">
        {/* New Label Form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    className={`w-6 h-6 rounded-full ${c.class} ${newColor === c.value ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''}`}
                  />
                ))}
              </div>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                placeholder="Label name"
                className="flex-1 bg-transparent border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleCreate}
                className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-md text-white"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Labels List */}
        {labels.length === 0 && !isAdding ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No labels yet</p>
            <p className="text-sm mt-1">Create a label to organize your tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg group"
              >
                {editingId === label.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setEditColor(c.value)}
                          className={`w-5 h-5 rounded-full ${c.class} ${editColor === c.value ? 'ring-2 ring-offset-1 ring-offset-gray-900 ring-white' : ''}`}
                        />
                      ))}
                    </div>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(label.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 bg-transparent border border-gray-700 rounded-md px-3 py-1 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleUpdate(label.id)}
                      className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/labels/${encodeURIComponent(label.name)}`}
                      className="flex items-center gap-3 flex-1 hover:opacity-80"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm font-medium text-gray-100">{label.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getTaskCount(label.name)} tasks
                      </span>
                    </Link>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(label.id, label.name, label.color)}
                        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLabel(label.id)}
                        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
