import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import { PrismaService } from '@core/prisma.service';
import { RedisService } from '@core/redis.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const cacheKey = `user:${user.id}:permissions`;
    let permissions = await this.redis.get<string[]>(cacheKey);

    if (!permissions) {
      const userWithRole = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      permissions = userWithRole?.role.permissions.map(
        (p) => `${p.resource}:${p.action}`,
      ) || [];

      await this.redis.set(cacheKey, permissions, 300);
    }

    const hasPermission = permissions.includes(
      `${requiredPermission.resource}:${requiredPermission.action}`,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
