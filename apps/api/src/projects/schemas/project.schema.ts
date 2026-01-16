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
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  color?: string;

  @Prop()
  icon?: string;

  @Prop({ required: true, default: 'idea', enum: PROJECT_STATUSES })
  status: string;

  @Prop({ required: true, default: 'side-project', enum: PROJECT_CATEGORIES })
  category: string;

  @Prop({ required: true, default: 0, min: 0, max: 100 })
  progress: number;

  @Prop()
  startDate?: Date;

  @Prop()
  targetLaunchDate?: Date;

  @Prop()
  launchedAt?: Date;

  @Prop({ type: [String], default: [] })
  distributionChannels?: string[];

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ required: true, default: false })
  isFavorite: boolean;

  @Prop({ required: true })
  userId: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
