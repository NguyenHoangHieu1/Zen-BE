import {
  Controller,
  UseGuards,
  Inject,
  Req,
  Body,
  Post,
  Get,
  Query,
  Param,
  Patch,
  BadRequestException,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/modules/auth';
import {
  IConversationService,
  IConversationServiceString,
} from './service/conversation.interface.service';
import { CreateConversationDto } from './dto';
import { EndUserId, RequestUser } from 'src/common/types/utilTypes';
import { QueryLimitSkip } from 'src/cores/global-dtos';
import { FindConversationDto } from './dto/find-conversation.dto';
import mongoose from 'mongoose';
import AddMembersToConversationDto from './dto/add-members-to-conversation.dto';
import { CreateEncryptionKeyDto } from './dto/CreateEncryptionKey.dto';
import * as bcrypt from 'bcryptjs';
import { GetEncryptionKeyDto } from './dto/get-encryption-key.dto';
import { IMessageService } from '../message/service/message.interface.service';
import { GetMessagesDto } from '../message/dto/get-messages.dto';
import { IMessageServiceString } from '../message/service/message.interface.service';

@ApiTags('Conversations')
@UseGuards(LoggedInGuard)
@Controller('conversation')
export class ConversationController {
  constructor(
    @Inject(IConversationServiceString)
    private readonly conversationService: IConversationService,
    @Inject(forwardRef(() => IMessageServiceString))
    private readonly messageService: IMessageService,
  ) {}

  @Get(':conversationId/list-of-files')
  public async listOfFiles(
    @Req() req: RequestUser,
    @Param() param: FindConversationDto,
    @Query() query: GetMessagesDto,
  ) {
    const files = await this.messageService.listOfFiles(
      param.conversationId,
      req.user._id,
      query.limit,
      query.skip,
    );
    return files;
  }

  @Patch(':conversationId/set-to-local')
  public async setIsLocal(
    @Param() param: FindConversationDto,
    @Req() req: RequestUser,
    @Body() body: { isLocal: boolean },
  ) {
    const conversation = await this.conversationService.getConversation(
      req.user._id,
      param.conversationId,
    );
    if (conversation === null) {
      throw new NotFoundException('Conversation not found');
    }
    if (conversation.endUserIds.length === 1) {
      throw new BadRequestException(
        'Cannot set isLocal to true for a single user conversation',
      );
    }
    const updatedConversation = await this.conversationService.setIsLocal(
      param.conversationId,
      body.isLocal,
    );
    return updatedConversation;
  }

  @Post()
  public async createConversation(
    @Req() req: RequestUser,
    @Body() body: CreateConversationDto,
  ) {
    body.userIds = body.userIds.map(
      (userId) => new mongoose.Types.ObjectId(userId) as EndUserId,
    );
    const conversation = await this.conversationService.createConversation(
      req.user._id,
      body.userIds,
    );
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
    return conversation;
  }

  @Get()
  public async getConversations(
    @Req() req: RequestUser,
    @Query() query: QueryLimitSkip,
  ) {
    const conversations = await this.conversationService.getConversations(
      req.user._id,
      query,
    );
    return conversations;
  }

  @Get(':conversationId')
  public async getConversation(
    @Req() req: RequestUser,
    @Param() param: FindConversationDto,
    @Query() query: GetEncryptionKeyDto,
  ) {
    const { encryptionKey } = query;
    const conversation = await this.conversationService.getConversation(
      req.user._id,
      param.conversationId,
    );
    if (
      conversation.encryptionKeys &&
      !conversation.encryptionKeys[req.user._id.toString()]
    ) {
      return conversation;
    }
    if (!encryptionKey) {
      throw new BadRequestException('Encryption key is required');
    }
    const doMatch = await bcrypt.compare(
      encryptionKey,
      conversation.encryptionKeys[req.user._id.toString()],
    );
    if (doMatch) {
      return conversation;
    } else {
      throw new BadRequestException('Invalid encryption key');
    }
  }

  @Patch(':conversationId/create-encryption-key')
  public async createEncryptionKey(
    @Param() param: FindConversationDto,
    @Req() req: RequestUser,
    @Body() body: CreateEncryptionKeyDto,
  ) {
    const { encryptionKey } = body;
    const encryptedEncryptionKey = await bcrypt.hash(
      encryptionKey,
      +process.env.bcrypt_hash,
    );
    const conversation = await this.conversationService.createEncryptionKey(
      req.user._id,
      param.conversationId,
      encryptedEncryptionKey,
    );
    return conversation;
  }

  @Patch(':conversationId/add-members')
  public async addMembersToConversation(
    @Param() param: FindConversationDto,
    @Req() req: RequestUser,
    @Body() body: AddMembersToConversationDto,
  ) {
    const conversation =
      await this.conversationService.addMembersToConversation(
        req.user._id,
        param.conversationId,
        body.userIds,
      );
    return conversation;
  }

  @Patch(':conversationId/leave')
  public async leaveConversation(
    @Param() param: FindConversationDto,
    @Req() req: RequestUser,
  ) {
    const conversation = await this.conversationService.leaveConversation(
      req.user._id,
      param.conversationId,
    );
    return conversation;
  }
}
