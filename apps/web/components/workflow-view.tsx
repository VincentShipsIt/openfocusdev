'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Task, TaskConnection } from '@todoist/shared';
import { useApi } from '@/hooks/use-api';
import TaskWorkflowNode, { type TaskNodeData } from './task-workflow-node';
import { toast } from 'sonner';

interface WorkflowViewProps {
  tasks: Task[];
  projectId?: string;
  onUpdate: () => void;
  onDelete: () => void;
}

type TaskNode = Node<TaskNodeData>;
type TaskEdge = Edge;

export default function WorkflowView({ tasks, projectId, onUpdate, onDelete }: WorkflowViewProps) {
  const { connections: connectionsApi, tasks: tasksApi } = useApi();
  const [nodes, setNodes, onNodesChange] = useNodesState<TaskNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<TaskEdge>([]);
  const [connectionMode, setConnectionMode] = useState<'dependency' | 'sequence'>('sequence');
  const [isMounted, setIsMounted] = useState(false);

  const nodeTypes = useMemo(() => ({
    task: TaskWorkflowNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }), []) as any;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTriggerAI = useCallback(async (taskId: string) => {
    try {
      await tasksApi.triggerAI(taskId);
      toast.success('AI execution started');
      onUpdate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to trigger AI';
      toast.error(message);
    }
  }, [tasksApi, onUpdate]);

  // Convert tasks to nodes
  useEffect(() => {
    const taskNodes: TaskNode[] = tasks.map((task, index) => ({
      id: task.id,
      type: 'task' as const,
      position: task.nodePosition || { x: (index % 4) * 300 + 50, y: Math.floor(index / 4) * 200 + 50 },
      data: {
        task,
        onUpdate,
        onDelete,
        onTriggerAI: handleTriggerAI,
      },
    }));
    setNodes(taskNodes);
  }, [tasks, onUpdate, onDelete, handleTriggerAI, setNodes]);

  // Load connections and convert to edges
  const loadConnections = useCallback(async () => {
    try {
      const connections = await connectionsApi.getAll({ projectId });
      const edgeList: TaskEdge[] = connections.map((conn: TaskConnection) => ({
        id: conn.id,
        source: conn.sourceTaskId,
        target: conn.targetTaskId,
        type: 'smoothstep' as const,
        animated: conn.type === 'dependency',
        style: {
          stroke: conn.type === 'dependency' ? '#ef4444' : '#6b7280',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: conn.type === 'dependency' ? '#ef4444' : '#6b7280',
        },
        data: { type: conn.type },
      }));
      setEdges(edgeList);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  }, [connectionsApi, projectId, setEdges]);

  useEffect(() => {
    if (isMounted) {
      loadConnections();
    }
  }, [loadConnections, tasks, isMounted]);

  const onConnect = useCallback(async (params: Connection) => {
    if (!params.source || !params.target) return;

    try {
      await connectionsApi.create({
        sourceTaskId: params.source,
        targetTaskId: params.target,
        type: connectionMode,
      });
      loadConnections();
      onUpdate();
      toast.success(`${connectionMode === 'dependency' ? 'Dependency' : 'Sequence'} created`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create connection';
      toast.error(message);
    }
  }, [connectionsApi, connectionMode, loadConnections, onUpdate]);

  const onEdgesDelete = useCallback(async (edgesToDelete: Edge[]) => {
    for (const edge of edgesToDelete) {
      try {
        await connectionsApi.delete(edge.id);
      } catch (error) {
        console.error('Failed to delete connection:', error);
      }
    }
    loadConnections();
    onUpdate();
  }, [connectionsApi, loadConnections, onUpdate]);

  const onNodeDragStop = useCallback(async (_event: React.MouseEvent, node: Node) => {
    try {
      await tasksApi.updatePosition(node.id, {
        x: node.position.x,
        y: node.position.y,
      });
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  }, [tasksApi]);

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading workflow...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ minHeight: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        className="bg-background"
      >
        <Background />
        <Controls />
        <MiniMap />

        <Panel position="top-left" className="bg-card p-3 rounded-lg border border-border shadow-md">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium">Connect as:</span>
            <button
              onClick={() => setConnectionMode('sequence')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                connectionMode === 'sequence'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Sequence
            </button>
            <button
              onClick={() => setConnectionMode('dependency')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                connectionMode === 'dependency'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Dependency
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Drag from one task to another to create a connection
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
}
