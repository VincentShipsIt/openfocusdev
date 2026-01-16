import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

export class Recurrence {
  @Prop({ required: true, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  rule: string;

  @Prop({ required: true, default: 1 })
  interval: number;

  @Prop({ type: [Number], default: [] })
  daysOfWeek?: number[]; // 0-6 for weekly

  @Prop()
  endDate?: Date;
}

export class Reminder {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: ['relative', 'absolute'] })
  type: string;

  @Prop()
  time?: Date; // For absolute reminders

  @Prop()
  offset?: number; // Minutes before due date for relative reminders

  @Prop({ default: false })
  notified: boolean;
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  projectId?: string;

  @Prop()
  dueDate?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ required: true, default: 'medium', enum: ['low', 'medium', 'high', 'urgent'] })
  priority: string;

  @Prop({ type: [String], default: [] })
  labels?: string[];

  @Prop()
  goalId?: string;

  @Prop()
  milestoneId?: string;

  @Prop()
  parentTaskId?: string;

  @Prop({ type: Object })
  recurrence?: Recurrence;

  @Prop({ type: [Object], default: [] })
  reminders?: Reminder[];

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ required: true })
  userId: string;

  // Workflow fields
  @Prop({ default: false })
  aiEnabled?: boolean;

  @Prop()
  aiPrompt?: string;

  @Prop({ enum: ['pending', 'running', 'completed', 'failed'] })
  aiExecutionStatus?: string;

  @Prop()
  aiExecutionResult?: string;

  @Prop({ type: Object })
  nodePosition?: { x: number; y: number };
}

export const TaskSchema = SchemaFactory.createForClass(Task);

