import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';

export type TaskDocument = Task & Document;

export class Recurrence {
  @Prop({ required: true, enum: ['daily', 'weekly', 'monthly', 'yearly'], type: String })
  rule: string;

  @Prop({ required: true, default: 1, type: Number })
  interval: number;

  @Prop({ type: [Number], default: [] })
  daysOfWeek?: number[]; // 0-6 for weekly

  @Prop({ type: Date })
  endDate?: Date;
}

export class Reminder {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, enum: ['relative', 'absolute'], type: String })
  type: string;

  @Prop({ type: Date })
  time?: Date; // For absolute reminders

  @Prop({ type: Number })
  offset?: number; // Minutes before due date for relative reminders

  @Prop({ default: false, type: Boolean })
  notified: boolean;
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  projectId?: string;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({
    required: true,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent'],
    type: String,
  })
  priority: string;

  @Prop({ type: [String], default: [] })
  labels?: string[];

  @Prop({ type: String })
  goalId?: string;

  @Prop({ type: String })
  milestoneId?: string;

  @Prop({ type: String })
  parentTaskId?: string;

  @Prop({ type: Object })
  recurrence?: Recurrence;

  @Prop({ type: [Object], default: [] })
  reminders?: Reminder[];

  @Prop({ required: true, default: 0, type: Number })
  order: number;

  @Prop({ required: true, type: String })
  userId: string;

  // Workflow fields
  @Prop({ default: false, type: Boolean })
  aiEnabled?: boolean;

  @Prop({ type: String })
  aiPrompt?: string;

  @Prop({ enum: ['pending', 'running', 'completed', 'failed'], type: String })
  aiExecutionStatus?: string;

  @Prop({ type: String })
  aiExecutionResult?: string;

  @Prop({ type: Object })
  nodePosition?: { x: number; y: number };
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ userId: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ userId: 1, projectId: 1 });
TaskSchema.index({ userId: 1, completedAt: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ parentTaskId: 1, userId: 1 });
TaskSchema.index({ userId: 1, order: 1 });
