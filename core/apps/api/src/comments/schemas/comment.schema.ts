import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, type: String })
  taskId: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: String })
  content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
