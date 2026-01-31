import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConnectionDocument = Connection & Document;

@Schema({ timestamps: true })
export class Connection {
  @Prop({ required: true })
  sourceTaskId: string;

  @Prop({ required: true })
  targetTaskId: string;

  @Prop({ required: true, enum: ['dependency', 'sequence'] })
  type: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  projectId?: string;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);

ConnectionSchema.index({ sourceTaskId: 1, userId: 1 });
ConnectionSchema.index({ targetTaskId: 1, userId: 1 });
ConnectionSchema.index({ projectId: 1, userId: 1 });
