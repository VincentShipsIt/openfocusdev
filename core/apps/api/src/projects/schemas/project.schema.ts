import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

export const PROJECT_STATUSES = [
  'idea',
  'planning',
  'in-progress',
  'testing',
  'launched',
  'distributed',
  'paused',
  'abandoned',
] as const;

export const PROJECT_CATEGORIES = [
  'side-project',
  'money-maker',
  'tool',
  'oss',
  'family',
  'experiment',
  'other',
] as const;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: String })
  icon?: string;

  @Prop({ required: true, default: 'idea', enum: PROJECT_STATUSES, type: String })
  status: string;

  @Prop({ required: true, default: 'side-project', enum: PROJECT_CATEGORIES, type: String })
  category: string;

  @Prop({ required: true, default: 0, min: 0, max: 100, type: Number })
  progress: number;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  targetLaunchDate?: Date;

  @Prop({ type: Date })
  launchedAt?: Date;

  @Prop({ type: [String], default: [] })
  distributionChannels?: string[];

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ required: true, default: 0, type: Number })
  order: number;

  @Prop({ required: true, default: false, type: Boolean })
  isFavorite: boolean;

  @Prop({ required: true, type: String })
  userId: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ userId: 1 });
ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, category: 1 });
ProjectSchema.index({ userId: 1, isFavorite: 1 });
ProjectSchema.index({ userId: 1, order: 1 });
