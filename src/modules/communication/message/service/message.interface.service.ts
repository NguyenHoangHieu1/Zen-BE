import {
  ConversationId,
  EndUserId,
  MessageId,
} from 'src/common/types/utilTypes';
import { SendMessageDto } from '../../chat/dto/send-message.dto';
import { DocumentMongodbType } from 'src/common/types/mongodbTypes';
import { Message } from '../entities';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { ChangeMessageDto } from '../../chat/dto/change-message.dto';

export const IMessageServiceString = 'IMessageService';

export interface IMessageService {
  createMessage(
    endUserId: EndUserId,
    sendMessageDto: SendMessageDto,
  ): Promise<DocumentMongodbType<Message>>;

  getMessages(
    conversationId: ConversationId,
    queryLimitSkip: QueryLimitSkip,
  ): Promise<DocumentMongodbType<Message>[]>;

  deleteMessage(
    endUserId: EndUserId,
    messageId: MessageId,
  ): Promise<DocumentMongodbType<Message>>;

  listOfFiles(
    conversationId: ConversationId,
    endUserId: EndUserId,
    limit: number,
    skip: number,
  ): Promise<DocumentMongodbType<Message>[]>;

  deleteMessages(conversationId: ConversationId): Promise<void>;

  changeMessage(
    changeMessageDto: ChangeMessageDto,
  ): Promise<DocumentMongodbType<Message>>;
}
