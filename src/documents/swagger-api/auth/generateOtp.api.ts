import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { apiResponseInternalServerError } from 'src/common/constants';

export function GenerateOtpSwaggerAPIDecorators(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Generate OTP QR code successfully',
      schema: {
        properties: {
          qrUrl: {
            type: 'string',
            description: 'QR code URL for OTP setup'
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Invalid request' }),
    apiResponseInternalServerError,
  );
}
