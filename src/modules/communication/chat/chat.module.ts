import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ConversationModule } from '../conversation';
import { MessageModule } from '../message';
import { EnduserModule } from 'src/modules/users/enduser';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [ConversationModule, MessageModule, EnduserModule],
})
export class ChatModule {}
