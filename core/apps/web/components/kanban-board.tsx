'use client';

import { Task } from '@todoist/shared';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useApi } from '@/hooks/use-api';
import TaskCard from './task-card';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: () => void;
  onDelete: () => void;
}

type ColumnId = 'todo' | 'in-progress' | 'done';

const columns: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function KanbanBoard({ tasks, onUpdate, onDelete }: KanbanBoardProps) {
  const { tasks: tasksApi } = useApi();
  const [_isDragging, setIsDragging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle SSR - react-beautiful-dnd requires client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTasksByColumn = (columnId: ColumnId): Task[] => {
    if (columnId === 'done') {
      return tasks.filter((task) => task.completedAt);
    }
    if (columnId === 'in-progress') {
      return tasks.filter((task) => !task.completedAt && task.priority === 'high');
    }
    return tasks.filter((task) => !task.completedAt && task.priority !== 'high');
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    try {
      if (destination.droppableId === 'done') {
        await tasksApi.update(task.id, {
          completedAt: new Date().toISOString(),
        });
      } else if (source.droppableId === 'done') {
        await tasksApi.update(task.id, {
          completedAt: null,
        });
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const onDragEndHandler = async (result: DropResult) => {
    setIsDragging(false);
    await handleDragEnd(result);
  };

  // Show loading state during SSR to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <h3 className="font-semibold mb-2">{column.title}</h3>
            <div className="flex-1 p-2 rounded-lg border-2 border-border">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={onDragEndHandler}>
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map((column) => {
          const columnTasks = getTasksByColumn(column.id);
          return (
            <div key={column.id} className="flex flex-col">
              <h3 className="font-semibold mb-2">
                {column.title} ({columnTasks.length})
              </h3>
              <Droppable droppableId={column.id} isDropDisabled={false}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 rounded-lg border-2 ${
                      snapshot.isDraggingOver ? 'border-primary bg-accent' : 'border-border'
                    }`}
                  >
                    <div className="space-y-2">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-50' : ''}
                            >
                              <TaskCard task={task} onUpdate={onUpdate} onDelete={onDelete} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
