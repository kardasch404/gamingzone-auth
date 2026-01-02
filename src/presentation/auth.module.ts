import { Module } from '@nestjs/common';
import { AuthController } from './http/controllers/auth.controller';
import { RegisterUserHandler } from '@application/commands/handlers/register-user.handler';
import { PrismaUserRepository } from '@infrastructure/persistence/repositories/user.repository';
import { PrismaService } from '@core/prisma.service';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';

const USER_REPOSITORY = 'UserRepository';

@Module({
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: 'UserRepository',
      useExisting: USER_REPOSITORY,
    },
    PrismaService,
    RedisService,
    LoggerService,
  ],
})
export class AuthModule {}
