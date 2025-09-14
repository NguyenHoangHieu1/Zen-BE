import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { apiResponseInternalServerError } from 'src/common/constants';
import { CheckAccountDto } from 'src/modules/auth/dto/check-account.dto';

export function CheckAccountSwaggerAPIDecorators(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: CheckAccountDto }),
    ApiResponse({
      status: 200,
      description: 'Check account successfully',
    }),
    ApiResponse({ status: 400, description: 'Invalid inputs' }),
    ApiResponse({
      status: 404,
      description: 'Account not found',
    }),
    apiResponseInternalServerError,
  );
}
