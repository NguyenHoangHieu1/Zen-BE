import { IsString } from 'class-validator';

export class DisableOtpDto {
  @IsString()
  email: string;

  @IsString()
  otp: string;
}
