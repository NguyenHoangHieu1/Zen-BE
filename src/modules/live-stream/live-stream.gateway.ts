import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { LiveStreamService } from './live-stream.service';
import { Server, Socket } from 'socket.io';
import { socketOn } from './path/socket.on';
import { socketEmit } from './path/socket.emit';
import { EndUserId, LiveStreamId } from 'src/common/types/utilTypes';
import mongoose from 'mongoose';
import { EndUser } from '../users/enduser';

@WebSocketGateway({ cors: true, namespace: '/livestream' })
export class LiveStreamGateway {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @WebSocketServer() private socketOfAll: Server;
  private users: { [userId: string]: Socket } = {};

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId = Object.keys(this.users).find(
      (key) => this.users[key] === socket,
    );
    if (userId) {
      delete this.users[userId];
    }
  }

  @SubscribeMessage(socketOn.endUserConnect)
  async mappingSocketWithUserId(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    { endUserId, liveStreamId }: { endUserId: string; liveStreamId: string },
  ) {
    this.users[endUserId] = socketOfUser;
    if (!socketOfUser.rooms.has(liveStreamId)) {
      socketOfUser.rooms.forEach((room) => socketOfUser.leave(room));
      socketOfUser.join(liveStreamId);
    }
    const liveStream = await this.liveStreamService.findOne(
      new mongoose.Types.ObjectId(liveStreamId) as LiveStreamId,
    );
    const isHost = liveStream.endUser._id.toString() === endUserId;
    if (!isHost) {
      this.liveStreamService.addViewer(
        new mongoose.Types.ObjectId(liveStreamId) as LiveStreamId,
        new mongoose.Types.ObjectId(endUserId) as EndUserId,
      );
      this.users[liveStream.endUser._id.toString()].emit(socketEmit.userJoin, {
        liveStreamId,
        fromEndUserId: endUserId,
      });
    }
  }

  @SubscribeMessage(socketOn.sendMessage)
  public async sendMessage(
    @MessageBody()
    body: {
      endUser: EndUser;
      liveStreamId: string;
      message: string;
      createdAt: Date;
    },
  ) {
    this.socketOfAll.to(body.liveStreamId).emit(socketEmit.sendMessage, body);

  }

  @SubscribeMessage(socketOn.memberLeft)
  async handleMemberLeft(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: { fromEndUserId: EndUserId; liveStreamId: string },
  ) {
    const { liveStreamId } = body;
    const liveStream = await this.liveStreamService.findOne(
      new mongoose.Types.ObjectId(liveStreamId) as LiveStreamId,
    );
    if (!liveStream) return;

    this.users[liveStream.endUser._id.toString()].emit(socketEmit.memberLeft, {
      liveStreamId,
    }); //client will remove peerconnection
    delete this.users[body.fromEndUserId.toString()];
    socketOfUser.leave(liveStreamId);

    this.liveStreamService.removeViewer(
      new mongoose.Types.ObjectId(liveStreamId) as LiveStreamId,
      body.fromEndUserId,
    );
  }

  @SubscribeMessage(socketOn.stopLiveStream)
  async handleStopLiveStream(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: { liveStreamId: string; fromEndUserId: string },
  ) {
    const { liveStreamId, fromEndUserId } = this.convertToObjectIds(body);
    socketOfUser
      .to(body.liveStreamId)
      .emit(socketEmit.stopLiveStream, { liveStreamId: body.liveStreamId }); //client will leave the livestream

    // remove socket of viewer
    const liveStream = await this.liveStreamService.findOne(liveStreamId);
    if (liveStream) {
      for (const viewerId of liveStream.viewers) {
        delete this.users[viewerId.toString()];
      }
    }
    // delete live stream
    this.liveStreamService.delete(liveStreamId, fromEndUserId);
    this.destroyRoom(liveStreamId);
  }

  @SubscribeMessage(socketOn.callMessageFromPeer)
  handleCallMessageFromPeer(
    @ConnectedSocket() socketOfUser: Socket,
    @MessageBody()
    body: {
      type: 'offer' | 'candidate' | 'answer';
      fromEndUserId: EndUserId;
      toEndUserId: EndUserId;
      data: any;
    },
  ) {
    const { type, fromEndUserId, toEndUserId, data } = body;

    const targetSocket = this.users[toEndUserId.toString()];
    if (targetSocket) {
      targetSocket.emit(socketEmit.callMessageFromPeer, {
        type,
        fromEndUserId,
        toEndUserId,
        data,
      });
    }
  }

  private destroyRoom(liveStreamId: LiveStreamId) {
    const room = this.socketOfAll.sockets.adapter.rooms.get(
      liveStreamId.toString(),
    );
    if (room) {
      for (const socketId of room) {
        const socket = this.socketOfAll.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(liveStreamId.toString());
        }
      }
    }
  }

  private convertToObjectIds(body: any): any {
    const converted = { ...body };
    if (body.endUserId)
      converted.endUserId = new mongoose.Types.ObjectId(
        body.endUserId as string,
      ) as EndUserId;
    if (body.liveStreamId)
      converted.liveStreamId = new mongoose.Types.ObjectId(
        body.liveStreamId as string,
      ) as LiveStreamId;

    return converted;
  }

  // private emitToConversationMembers(
  //   conversation: Conversation,
  //   event: string,
  //   data: any,
  // ) {
  //   conversation.endUserIds.forEach((endUser: any) => {
  //     const userSocket = this.users[endUser._id.toString()];
  //     if (userSocket) {
  //       userSocket.emit(event, data);
  //     }
  //   });
  // }
}
