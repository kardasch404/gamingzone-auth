import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/check-permission.decorator';
import { PermissionEvaluator } from '../../infrastructure/authorization/permission-evaluator.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionEvaluator: PermissionEvaluator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<{ resource: string; action: string }>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) return false;

    return this.permissionEvaluator.hasPermission(
      userId,
      permission.resource,
      permission.action,
      request.body || {},
    );
  }
}
