import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export const CheckPermission = (resource: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { resource, action });

export const RequirePermission = CheckPermission;
