import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GoalDocument = Goal & Document;

@Schema({ _id: false })
export class Milestone {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: Date })
  targetDate?: Date;

  @Prop({ required: true, default: false, type: Boolean })
  completed: boolean;

  @Prop({ type: Date })
  completedAt?: Date;
}

const MilestoneSchema = SchemaFactory.createForClass(Milestone);

@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true, enum: ['business', 'personal'], type: String })
  category: string;

  @Prop({ required: true, type: Number })
  targetYear: number;

  @Prop({ type: [MilestoneSchema], default: [] })
  milestones: Milestone[];

  @Prop({ required: true, type: String })
  userId: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
