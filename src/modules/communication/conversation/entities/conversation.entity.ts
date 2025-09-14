import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { object } from 'joi';
import { Types } from 'mongoose';
import { ConversationId } from 'src/common/types/utilTypes';

@Schema({ timestamps: true })
export class Conversation {
  _id: ConversationId;

  @Prop({
    required: true,
    type: [Types.ObjectId],
    ref: 'EndUser',
  })
  endUserIds: Types.ObjectId[];

  @Prop({
    required: true,
    type: String,
    // Conversations without a name will use this default to see usernames
    default: '__username__',
  })
  name: string;

  @Prop({
    type: {},
    required: true,
    default: {},
  })
  encryptionKeys: Record<string, string>; // Key is endUserId, value is encryptionKey

  createdAt: Date;

  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
