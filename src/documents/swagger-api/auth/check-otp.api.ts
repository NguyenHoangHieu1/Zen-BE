import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { apiResponseInternalServerError } from 'src/common/constants';
import { CheckOtpDto } from 'src/modules/auth/dto/check-otp.dto';

export function CheckOtpSwaggerAPIDecorators(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: CheckOtpDto }),
    ApiResponse({
      status: 200,
      description: 'Otp is verified',
    }),
    ApiResponse({
      status: 400,
      description: 'Otp is not verified',
    }),
    apiResponseInternalServerError,
  );
}
