import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConnectionDocument = Connection & Document;

@Schema({ timestamps: true })
export class Connection {
  @Prop({ required: true, type: String })
  sourceTaskId: string;

  @Prop({ required: true, type: String })
  targetTaskId: string;

  @Prop({ required: true, enum: ['dependency', 'sequence'], type: String })
  type: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ type: String })
  projectId?: string;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);

ConnectionSchema.index({ sourceTaskId: 1, userId: 1 });
ConnectionSchema.index({ targetTaskId: 1, userId: 1 });
ConnectionSchema.index({ projectId: 1, userId: 1 });
