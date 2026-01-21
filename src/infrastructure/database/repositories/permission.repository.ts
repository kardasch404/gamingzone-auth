import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../../../domain/interfaces/permission-repository.interface';
import { Permission } from '../../../domain/entities/permission.entity';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../../cache/redis/redis.service';
import { PermissionMapper } from './permission.mapper';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    const cacheKey = `permission:${id}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return PermissionMapper.toDomain(cached);

    const record = await this.prisma.permission.findUnique({ where: { id } });
    if (!record) return null;

    const permission = PermissionMapper.toDomain(record);
    await this.redis.set(cacheKey, record, this.CACHE_TTL);
    return permission;
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const cacheKey = `permission:${resource}:${action}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return PermissionMapper.toDomain(cached);

    const record = await this.prisma.permission.findUnique({
      where: { resource_action: { resource, action } },
    });
    if (!record) return null;

    const permission = PermissionMapper.toDomain(record);
    await this.redis.set(cacheKey, record, this.CACHE_TTL);
    return permission;
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    const cacheKey = `permissions:role:${roleId}`;
    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) return cached.map(PermissionMapper.toDomain);

    const records = await this.prisma.permission.findMany({
      where: {
        rolePermissions: {
          some: { roleId },
        },
      },
    });

    await this.redis.set(cacheKey, records, this.CACHE_TTL);
    return records.map(PermissionMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<Permission[]> {
    const cacheKey = `permissions:user:${userId}`;
    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) return cached.map(PermissionMapper.toDomain);

    const records = await this.prisma.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            role: {
              userRoles: {
                some: { userId },
              },
            },
          },
        },
      },
    });

    await this.redis.set(cacheKey, records, this.CACHE_TTL);
    return records.map(PermissionMapper.toDomain);
  }

  async save(permission: Permission): Promise<Permission> {
    const data = PermissionMapper.toPersistence(permission);
    const record = await this.prisma.permission.create({ data });
    await this.invalidateCache(record.id, record.resource, record.action);
    return PermissionMapper.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    await this.prisma.permission.delete({ where: { id } });
    if (permission) {
      await this.invalidateCache(id, permission.resource, permission.action);
    }
  }

  private async invalidateCache(id: string, resource: string, action: string): Promise<void> {
    await this.redis.del(`permission:${id}`);
    await this.redis.del(`permission:${resource}:${action}`);
  }
}
