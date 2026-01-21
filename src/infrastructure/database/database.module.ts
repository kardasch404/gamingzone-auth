import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from '../cache/redis/redis.service';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  providers: [
    PrismaService,
    RedisService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
  ],
})
export class DatabaseModule {}
