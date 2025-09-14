import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { apiResponseInternalServerError } from 'src/common/constants';
import { EnableOtpDto } from 'src/modules/auth/dto/enable-otp.dto';

export function EnableOtpSwaggerAPIDecorators(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: EnableOtpDto }),
    ApiResponse({
      status: 200,
      description: 'Enable OTP successfully',
    }),
    ApiResponse({ status: 400, description: 'Invalid inputs' }),
    ApiResponse({
      status: 401,
      description: 'Account does not exist or invalid OTP',
    }),
    apiResponseInternalServerError,
  );
}
