import { ApiProperty } from "@nestjs/swagger";

import { IsString } from "class-validator";

export class EnableOtpDto {
  @IsString()
  @ApiProperty({
    description: 'Email',
    example: 'hoanghieufro@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Otp',
    example: '123456',
  })
  otp: string;
}
