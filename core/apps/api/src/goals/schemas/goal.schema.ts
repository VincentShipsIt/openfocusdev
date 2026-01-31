import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GoalDocument = Goal & Document;

@Schema({ _id: false })
export class Milestone {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  targetDate?: Date;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop()
  completedAt?: Date;
}

const MilestoneSchema = SchemaFactory.createForClass(Milestone);

@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['business', 'personal'] })
  category: string;

  @Prop({ required: true })
  targetYear: number;

  @Prop({ type: [MilestoneSchema], default: [] })
  milestones: Milestone[];

  @Prop({ required: true })
  userId: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

