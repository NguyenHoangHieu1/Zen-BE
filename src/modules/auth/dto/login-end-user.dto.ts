import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginEndUserDto {
  @ApiProperty({
    title: "End user's Email",
    type: String,
    required: true,
    example: 'hoanghieufro@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    title: "End user's Password",
    type: String,
    required: true,
    example: 'AVeryStr@ngPassword123',
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    title: 'End user OTP',
    type: String,
    required: false,
  })
  @IsOptional()
  otp?: string;
}
