import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { EndUserId, MessageId } from 'src/common/types/utilTypes';
import { checkToConvertToMongoIdOrThrowError } from 'src/common/utils';

export class ChangeMessageDto {
  @Transform((opts) =>
    checkToConvertToMongoIdOrThrowError({ id: opts.value, returnError: true }),
  )
  messageId: MessageId;

  @Transform((opts) =>
    checkToConvertToMongoIdOrThrowError({ id: opts.value, returnError: true }),
  )
  endUserId: EndUserId;

  @IsString()
  content: string;
}
