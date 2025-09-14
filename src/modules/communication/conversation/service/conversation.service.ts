import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConversationRepository } from '../repository/conversation.repository';
import { BaseRepositoryName } from 'src/cores/base-repository/Base.Repository.interface';
import { IConversationService } from './conversation.interface.service';
import { DocumentMongodbType } from 'src/common/types/mongodbTypes';
import { ConversationId, EndUserId } from 'src/common/types/utilTypes';
import { Conversation } from '../entities';
import { ConversationDefaultName } from 'src/common/constants/constants';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { checkToConvertToMongoIdOrThrowError, noObj } from 'src/common/utils';
import mongoose from 'mongoose';
import { EndUser } from 'src/modules/users/enduser';

@Injectable()
export class ConversationService implements IConversationService {
  constructor(
    @Inject(BaseRepositoryName)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  public async createConversation(
    leaderId: EndUserId,
    endUserIds: EndUserId[],
  ): Promise<DocumentMongodbType<Conversation>> {
    let conversation;
    conversation = await this.conversationRepository.findOne({
      endUserIds: { $eq: endUserIds },
    });
    if (conversation) {
      return conversation;
    }
    conversation = await this.conversationRepository.create({
      name: ConversationDefaultName,
      endUserIds,
      encryptionKeys: {},
    });
    return conversation;
  }

  public async createEncryptionKey(
    endUserId: EndUserId,
    conversationId: ConversationId,
    encryptionKey: string,
  ): Promise<DocumentMongodbType<Conversation>> {
    const conversation = await this.conversationRepository.findOne({
      _id: conversationId,
      endUserIds: endUserId,
    });
    const temp = conversation.encryptionKeys;
    temp[endUserId.toString()] = encryptionKey;
    conversation.encryptionKeys = temp;
    await this.conversationRepository.updateOne(
      { _id: conversationId, endUserIds: endUserId },
      conversation,
    );
    return conversation;
  }

  public async getConversation(
    endUserId: EndUserId,
    conversationId: ConversationId,
  ): Promise<DocumentMongodbType<Conversation>> {
    const conversation = await this.conversationRepository.findOne({
      endUserIds: checkToConvertToMongoIdOrThrowError<EndUserId>({
        id: endUserId,
        returnError: false,
      }),
      _id: checkToConvertToMongoIdOrThrowError<ConversationId>({
        id: conversationId,
        returnError: false,
      }),
    });
    console.log(endUserId, conversationId);
    await conversation.populate('endUserIds');
    return conversation;
  }

  public async getConversations(
    endUserId: EndUserId,
    query: QueryLimitSkip,
  ): Promise<DocumentMongodbType<Conversation>[]> {
    const conversations = await this.conversationRepository.find(
      {
        endUserIds: endUserId,
      },
      noObj,
      { limit: query.limit, skip: query.skip },
    );

    for (let i = 0; i < conversations.length; i++) {
      await conversations[i].populate('endUserIds');
    }

    return conversations;
  }

  public async updateConversation(
    endUserId: EndUserId,
    conversationId: ConversationId,
    opts: Partial<Conversation>,
  ): Promise<DocumentMongodbType<Conversation>> {
    const conversation = await this.conversationRepository.findOne({
      _id: conversationId,
      endUserIds: endUserId,
    });

    Object.assign(conversation, opts);
    return conversation.save();
  }

  public async addMembersToConversation(
    endUserId: EndUserId,
    conversationId: ConversationId,
    endUserIds: EndUserId[],
  ): Promise<DocumentMongodbType<Conversation>> {
    const conversation = await this.conversationRepository.findOne({
      _id: conversationId,
      endUserIds: endUserId,
    });
    endUserIds = endUserIds.map(
      (userId) => new mongoose.Types.ObjectId(userId) as EndUserId,
    );
    conversation.endUserIds.push(...endUserIds);
    return conversation.save();
  }

  public async setIsLocal(
    conversationId: ConversationId,
    isLocal: boolean,
  ): Promise<DocumentMongodbType<Conversation>> {
    return this.conversationRepository.updateOne(
      { _id: conversationId },
      { isLocal },
    );
  }

  public async leaveConversation(
    endUserId: EndUserId,
    conversationId: ConversationId,
  ): Promise<DocumentMongodbType<Conversation>> {
    return this.conversationRepository.updateOne(
      { _id: conversationId },
      { $pull: { endUserIds: endUserId } },
    );
  }
}
