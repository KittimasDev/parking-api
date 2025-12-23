import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

export function Authenticated() {
  return applyDecorators(UseGuards(AuthGuard), ApiBearerAuth('bearerAuth'));
}
