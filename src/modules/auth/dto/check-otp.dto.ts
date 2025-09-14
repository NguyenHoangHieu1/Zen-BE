import { IsString } from 'class-validator';

export class CheckOtpDto {
  @IsString()
  otp: string;
}
