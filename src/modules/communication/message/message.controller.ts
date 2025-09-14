import {
  Controller,
  Get,
  Inject,
  UseGuards,
  Query,
  Req,
  forwardRef,
} from '@nestjs/common';
import {
  IMessageService,
  IMessageServiceString,
} from './service/message.interface.service';
import {
  IConversationService,
  IConversationServiceString,
} from '../conversation/service/conversation.interface.service';
import { ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/modules/auth';
import { RequestUser } from 'src/common/types/utilTypes';
import { GetMessagesDto } from './dto/get-messages.dto';

@Controller('message')
@ApiTags('Message')
@UseGuards(LoggedInGuard)
export class MessageController {
  constructor(
    @Inject(IMessageServiceString)
    private readonly messageService: IMessageService,
    @Inject(forwardRef(() => IConversationServiceString))
    private readonly conversationService: IConversationService,
  ) {}

  @Get()
  public async getMessages(
    @Req() req: RequestUser,
    @Query() query: GetMessagesDto,
  ) {
    const conversation = await this.conversationService.getConversation(
      req.user._id,
      query.conversationId,
    );

    const messages = await this.messageService.getMessages(
      conversation._id,
      query,
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
    return messages;
  }
}
