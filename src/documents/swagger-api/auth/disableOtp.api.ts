import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { apiResponseInternalServerError } from 'src/common/constants';
import { DisableOtpDto } from 'src/modules/auth/dto/disable-otp.dto';

export function DisableOtpSwaggerAPIDecorators(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: DisableOtpDto }),
    ApiResponse({
      status: 200,
      description: 'Disable OTP successfully',
    }),
    ApiResponse({ status: 400, description: 'Invalid inputs' }),
    ApiResponse({
      status: 401,
      description: 'Account does not exist or invalid OTP',
    }),
    apiResponseInternalServerError,
  );
}
