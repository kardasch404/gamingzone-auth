import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../../domain/interfaces/permission-repository.interface';
import { RedisService } from '../cache/redis/redis.service';
import { PermissionCondition } from '../../domain/value-objects/permission-condition.vo';

@Injectable()
export class PermissionEvaluator {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly redis: RedisService,
  ) {}

  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    context: Record<string, any> = {},
  ): Promise<boolean> {
    const cacheKey = `permission:${userId}:${resource}:${action}:${JSON.stringify(context)}`;
    const cached = await this.redis.get<boolean>(cacheKey);
    if (cached !== null) return cached;

    const permissions = await this.permissionRepository.findByUserId(userId);
    const permission = permissions.find(
      (p) => p.resource === resource && p.action === action,
    );

    if (!permission) {
      await this.redis.set(cacheKey, false, this.CACHE_TTL);
      return false;
    }

    if (!permission.hasConditions()) {
      await this.redis.set(cacheKey, true, this.CACHE_TTL);
      return true;
    }

    const contextWithUser = { ...context, currentUser: userId };
    const condition = new PermissionCondition(permission.conditions);
    const result = condition.evaluate(contextWithUser);

    await this.redis.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async invalidateCache(userId: string): Promise<void> {
    await this.redis.clear();
  }
}
