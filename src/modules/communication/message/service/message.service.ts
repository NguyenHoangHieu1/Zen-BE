import { Inject, Injectable } from '@nestjs/common';
import { BaseRepositoryName } from 'src/cores/base-repository/Base.Repository.interface';
import { MessageRepository } from '../repository/message.repository';
import { IMessageService } from './message.interface.service';
import { DocumentMongodbType } from 'src/common/types/mongodbTypes';
import {
  ConversationId,
  EndUserId,
  MessageId,
} from 'src/common/types/utilTypes';
import { SendMessageDto } from '../../chat/dto/send-message.dto';
import { Message } from '../entities';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { emptyObj } from 'src/common/utils';
import { EndUser } from 'src/modules/users/enduser/entities';
import * as CryptoJS from 'crypto-js';
import { ChangeMessageDto } from '../../chat/dto/change-message.dto';
@Injectable()
export class MessageService implements IMessageService {
  private encryptionKey = 'mySecretKey123'; // Đặt khoá bí mật

  constructor(
    @Inject(BaseRepositoryName)
    private readonly messageRepository: MessageRepository,
  ) {}

  public async createMessage(
    endUserId: EndUserId,
    sendMessageDto: SendMessageDto,
  ): Promise<DocumentMongodbType<Message>> {
    const message = await this.messageRepository.create({
      endUserId,
      content: sendMessageDto.content,
      conversationId: sendMessageDto.conversationId,
      type: sendMessageDto.type ?? 'text',
    });
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    console.log('Message CREATED', message, 'at', formattedDate);
    return message;
  }

  public async changeMessage(changeMessageDto: ChangeMessageDto) {
    const result = await this.messageRepository.updateOne(
      { _id: changeMessageDto.messageId },
      { content: changeMessageDto.content },
    );
    return result;
  }

  public async getMessages(
    conversationId: ConversationId,
    queryLimitSkip: QueryLimitSkip,
  ): Promise<any> {
    const messages = await this.messageRepository.find(
      { conversationId },
      emptyObj,
      {
        limit: queryLimitSkip.limit,
        skip: queryLimitSkip.skip,
        sort: { createdAt: -1 },
      },
    );
    for (let i = 0; i < messages.length; i++) {
      await messages[i].populate({ path: 'endUserId', model: EndUser.name });
    }
    const decryptedMessages = messages.map((message) => {
      if (message.type === 'text') {
        const decryptedContent = CryptoJS.AES.decrypt(
          message.content,
          this.encryptionKey,
        ).toString(CryptoJS.enc.Utf8);
        return { ...message.toObject(), content: decryptedContent };
      } else {
        return message;
      }
    });
    return decryptedMessages.reverse();
  }

  public async seenMessages(
    messageId: MessageId,
  ): Promise<DocumentMongodbType<Message>> {
    const message = await this.messageRepository.findById(messageId);
    if (message) {
      message.read = true;
      await message.save();
    }
    return message;
  }

  public async deleteMessage(
    endUserId: EndUserId,
    messageId: MessageId,
  ): Promise<DocumentMongodbType<Message>> {
    const message = await this.messageRepository.delete(messageId);
    return message;
  }

  public async listOfFiles(
    conversationId: ConversationId,
    endUserId: EndUserId,
    limit: number,
    skip: number,
  ): Promise<any[]> {
    const messages = await this.messageRepository.find(
      {
        conversationId: conversationId,
      },
      emptyObj,
      {
        limit: limit,
        skip: skip,
      },
    );
    const files = messages.filter((message) => message.type === 'file');
    return files;
  }

  public async deleteMessages(conversationId: ConversationId): Promise<void> {
    await this.messageRepository.delete({ conversationId });
  }
}
