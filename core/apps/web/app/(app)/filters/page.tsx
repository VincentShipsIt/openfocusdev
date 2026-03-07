'use client';

import { FilterCondition, Project, Task } from '@todoist/shared';
import { Filter, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import TaskList from '@/components/task-list';
import { useFilters } from '@/hooks/use-filters';
import { useLabels } from '@/hooks/use-labels';
import { useApi } from '@/hooks/use-api';

const PRIORITY_OPTIONS = ['P1', 'P2', 'P3', 'P4'];
const DUE_DATE_OPTIONS = ['today', 'this week', 'overdue', 'no date'];

type ConditionField = FilterCondition['field'];

const FIELD_LABELS: Record<ConditionField, string> = {
  project: 'Project',
  priority: 'Priority',
  dueDate: 'Due date',
  label: 'Label',
};

function getOpsForField(field: ConditionField) {
  switch (field) {
    case 'project': return ['is', 'is not'];
    case 'priority': return ['is'];
    case 'dueDate': return ['is'];
    case 'label': return ['has', "doesn't have"];
  }
}

function getValueOptions(field: ConditionField, projects: Project[], labels: string[]) {
  switch (field) {
    case 'project': return projects.map((p) => p.name);
    case 'priority': return PRIORITY_OPTIONS;
    case 'dueDate': return DUE_DATE_OPTIONS;
    case 'label': return labels;
  }
}

function applyFilters(tasks: Task[], conditions: FilterCondition[], projects: Project[]): Task[] {
  return tasks.filter((task) => {
    return conditions.every((cond) => {
      if (cond.field === 'project') {
        const project = projects.find((p) => p.name === cond.value);
        const matches = task.projectId === project?.id;
        return cond.op === 'is' ? matches : !matches;
      }
      if (cond.field === 'priority') {
        const priorityMap: Record<string, string> = { P1: 'urgent', P2: 'high', P3: 'medium', P4: 'low' };
        const matches = task.priority === priorityMap[cond.value];
        return matches;
      }
      if (cond.field === 'dueDate') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (cond.value === 'no date') return !task.dueDate;
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        if (cond.value === 'today') return dueDay.getTime() === today.getTime();
        if (cond.value === 'overdue') return dueDay < today;
        if (cond.value === 'this week') {
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return dueDay >= today && dueDay <= weekEnd;
        }
        return false;
      }
      if (cond.field === 'label') {
        const has = task.labels?.includes(cond.value) ?? false;
        return cond.op === 'has' ? has : !has;
      }
      return true;
    });
  });
}

export default function FiltersPage() {
  const { filters, createFilter, deleteFilter } = useFilters();
  const { labels } = useLabels();
  const { tasks: tasksApi, projects: projectsApi } = useApi();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  // Modal state
  const [filterName, setFilterName] = useState('');
  const [conditions, setConditions] = useState<FilterCondition[]>([
    { field: 'priority', op: 'is', value: 'P1' },
  ]);

  const loadData = useCallback(async () => {
    try {
      const [tasks, projects] = await Promise.all([
        tasksApi.getAll({ completed: false }),
        projectsApi.getAll(),
      ]);
      setAllTasks(tasks);
      setAllProjects(projects);
    } catch {}
  }, [tasksApi, projectsApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = () => {
    if (!filterName.trim()) return;
    createFilter(filterName.trim(), conditions);
    setShowModal(false);
    setFilterName('');
    setConditions([{ field: 'priority', op: 'is', value: 'P1' }]);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: 'priority', op: 'is', value: 'P1' }]);
  };

  const updateCondition = (index: number, patch: Partial<FilterCondition>) => {
    const updated = conditions.map((c, i) => {
      if (i !== index) return c;
      const newCond = { ...c, ...patch };
      // Reset op and value when field changes
      if (patch.field) {
        newCond.op = getOpsForField(patch.field as ConditionField)[0];
        newCond.value = getValueOptions(patch.field as ConditionField, allProjects, labels.map(l => l.name))[0] ?? '';
      }
      return newCond;
    });
    setConditions(updated);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const activeFilter = filters.find((f) => f.id === activeFilterId);
  const filteredTasks = activeFilter
    ? applyFilters(allTasks, activeFilter.conditions, allProjects)
    : [];

  return (
    <div className="flex h-full flex-col">
      <div className="px-10 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Filters</h1>
            <p className="text-sm text-muted-foreground mt-1">{filters.length} saved filters</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 pb-10">
        {filters.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Filter className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No saved filters</p>
            <p className="text-sm mt-1">Create a filter to quickly find tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((f) => (
                <div key={f.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveFilterId(activeFilterId === f.id ? null : f.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      activeFilterId === f.id
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    {f.name}
                    <span className="text-xs opacity-70">
                      ({f.conditions.length} {f.conditions.length === 1 ? 'condition' : 'conditions'})
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (activeFilterId === f.id) setActiveFilterId(null);
                      deleteFilter(f.id);
                    }}
                    className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Filter results */}
            {activeFilter && (
              <div>
                <div className="mb-3 text-sm text-muted-foreground">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} match &quot;{activeFilter.name}&quot;
                </div>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No tasks match this filter
                  </div>
                ) : (
                  <TaskList tasks={filteredTasks} onUpdate={loadData} onDelete={loadData} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Filter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-100">New filter</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-800 rounded text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter name */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                Filter name
              </label>
              <input
                autoFocus
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="My filter"
                className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Conditions */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Conditions (all must match)
              </label>
              <div className="space-y-2">
                {conditions.map((cond, i) => {
                  const ops = getOpsForField(cond.field);
                  const valueOpts = getValueOptions(cond.field, allProjects, labels.map(l => l.name));
                  return (
                    <div key={i} className="flex items-center gap-2">
                      {/* Field */}
                      <select
                        value={cond.field}
                        onChange={(e) => updateCondition(i, { field: e.target.value as ConditionField })}
                        className="bg-gray-950 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                      >
                        {(Object.keys(FIELD_LABELS) as ConditionField[]).map((f) => (
                          <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                        ))}
                      </select>
                      {/* Op */}
                      <select
                        value={cond.op}
                        onChange={(e) => updateCondition(i, { op: e.target.value })}
                        className="bg-gray-950 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                      >
                        {ops.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                      {/* Value */}
                      <select
                        value={cond.value}
                        onChange={(e) => updateCondition(i, { value: e.target.value })}
                        className="flex-1 bg-gray-950 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                      >
                        {valueOpts.length === 0 ? (
                          <option value="">No options</option>
                        ) : (
                          valueOpts.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))
                        )}
                      </select>
                      {conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(i)}
                          className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={addCondition}
                className="mt-2 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add condition
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!filterName.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
              >
                Save filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
