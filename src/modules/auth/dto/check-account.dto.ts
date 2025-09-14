import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckAccountDto {
  @IsString()
  @ApiProperty({
    description: 'Email',
    example: 'hoanghieufro@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Password',
    example: 'Password@123',
  })
  password: string;
}
