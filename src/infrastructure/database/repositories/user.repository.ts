import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../../cache/redis/redis.service';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return UserMapper.toDomain(cached);

    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;

    const user = UserMapper.toDomain(record);
    await this.redis.set(cacheKey, record, this.CACHE_TTL);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return UserMapper.toDomain(cached);

    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;

    const user = UserMapper.toDomain(record);
    await this.redis.set(cacheKey, record, this.CACHE_TTL);
    return user;
  }

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const record = await this.prisma.user.create({ data });
    await this.invalidateCache(record.id, record.email);
    return UserMapper.toDomain(record);
  }

  async update(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    await this.invalidateCache(record.id, record.email);
    return UserMapper.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    await this.prisma.user.delete({ where: { id } });
    if (user) await this.invalidateCache(id, user.email);
  }

  private async invalidateCache(id: string, email: string): Promise<void> {
    await this.redis.del(`user:${id}`);
    await this.redis.del(`user:email:${email}`);
  }
}
