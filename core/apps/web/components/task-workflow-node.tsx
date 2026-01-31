'use client';

import { Task } from '@todoist/shared';
import { Handle, Position } from '@xyflow/react';
import { AlertCircle, Bot, Check, Clock, Lock, Play } from 'lucide-react';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import TaskDetailPanel from './task-detail-panel';

export interface TaskNodeData extends Record<string, unknown> {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
  onTriggerAI: (taskId: string) => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'border-red-500',
  high: 'border-orange-500',
  medium: 'border-blue-500',
  low: 'border-gray-400',
};

function TaskWorkflowNode({ data }: { data: TaskNodeData }) {
  const { task, onUpdate, onDelete, onTriggerAI } = data;
  const [showDetail, setShowDetail] = useState(false);

  const isCompleted = !!task.completedAt;
  const isBlocked = task.isBlocked;
  const isAIRunning = task.aiExecutionStatus === 'running';

  return (
    <>
      <div
        className={`
          min-w-[200px] max-w-[280px] p-4 rounded-lg border-2 bg-card shadow-md
          cursor-pointer transition-all hover:shadow-lg
          ${priorityColors[task.priority] || 'border-border'}
          ${isCompleted ? 'opacity-60' : ''}
          ${isBlocked ? 'bg-muted' : ''}
        `}
        onClick={() => setShowDetail(true)}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />

        <div className="flex items-center gap-2 mb-2">
          {isCompleted && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              <span>Done</span>
            </div>
          )}
          {isBlocked && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <Lock className="h-3 w-3" />
              <span>Blocked</span>
            </div>
          )}
          {task.aiEnabled && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Bot className="h-3 w-3" />
              <span>AI</span>
            </div>
          )}
        </div>

        <h3 className={`font-medium text-sm ${isCompleted ? 'line-through' : ''}`}>{task.title}</h3>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}

        {task.aiEnabled && !isCompleted && !isBlocked && (
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onTriggerAI(task.id);
            }}
            disabled={isAIRunning}
          >
            {isAIRunning ? (
              <>
                <Clock className="h-3 w-3 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Run AI
              </>
            )}
          </Button>
        )}

        {task.aiExecutionStatus === 'failed' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>AI failed</span>
          </div>
        )}
      </div>

      <TaskDetailPanel
        task={showDetail ? task : null}
        open={showDetail}
        onOpenChange={setShowDetail}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}

export default memo(TaskWorkflowNode);
