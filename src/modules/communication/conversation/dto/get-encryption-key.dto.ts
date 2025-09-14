import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class GetEncryptionKeyDto {
  @ApiProperty({
    title: 'encryption key',
    name: 'encryptionKey',
    required: true,
  })
  @IsString()
  @IsOptional()
  encryptionKey: string;
}
