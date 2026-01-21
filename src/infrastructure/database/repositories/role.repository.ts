import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { Role } from '../../../domain/entities/role.entity';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../../cache/redis/redis.service';
import { RoleMapper } from './role.mapper';

@Injectable()
export class RoleRepository implements IRoleRepository {
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const cacheKey = `role:${id}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return RoleMapper.toDomain(cached);

    const record = await this.prisma.role.findUnique({ where: { id } });
    if (!record) return null;

    const role = RoleMapper.toDomain(record);
    await this.redis.set(cacheKey, record, this.CACHE_TTL);
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    const cacheKey = `role:name:${name}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return RoleMapper.toDomain(cached);

    const record = await this.prisma.role.findUnique({ where: { name } });
    if (!record) return null;

    const role = RoleMapper.toDomain(record);
    await this.redis.set(cacheKey, record, this.CACHE_TTL);
    return role;
  }

  async findAll(): Promise<Role[]> {
    const cacheKey = 'roles:all';
    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) return cached.map(RoleMapper.toDomain);

    const records = await this.prisma.role.findMany();
    await this.redis.set(cacheKey, records, this.CACHE_TTL);
    return records.map(RoleMapper.toDomain);
  }

  async save(role: Role): Promise<Role> {
    const data = RoleMapper.toPersistence(role);
    const record = await this.prisma.role.create({ data });
    await this.invalidateCache(record.id, record.name);
    return RoleMapper.toDomain(record);
  }

  async update(role: Role): Promise<Role> {
    const data = RoleMapper.toPersistence(role);
    const record = await this.prisma.role.update({
      where: { id: role.id },
      data,
    });
    await this.invalidateCache(record.id, record.name);
    return RoleMapper.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    await this.prisma.role.delete({ where: { id } });
    if (role) await this.invalidateCache(id, role.name);
  }

  private async invalidateCache(id: string, name: string): Promise<void> {
    await this.redis.del(`role:${id}`);
    await this.redis.del(`role:name:${name}`);
    await this.redis.del('roles:all');
  }
}
