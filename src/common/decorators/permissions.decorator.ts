import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (resource: string, action: string) =>
  SetMetadata(PERMISSIONS_KEY, { resource, action });
