import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthController } from './http/controllers/auth.controller';
import { RegisterUserHandler } from '@application/commands/handlers/register-user.handler';
import { VerifyEmailHandler } from '@application/commands/handlers/verify-email.handler';
import { PrismaUserRepository } from '@infrastructure/persistence/repositories/user.repository';
import { PrismaService } from '@core/prisma.service';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';
import { SendGridEmailService } from '@infrastructure/messaging/email/sendgrid-email.service';
import { UserRegisteredListener } from '@infrastructure/messaging/events/user-registered.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AuthController],
  providers: [
    RegisterUserHandler,
    VerifyEmailHandler,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'EmailService',
      useClass: SendGridEmailService,
    },
    UserRegisteredListener,
    PrismaService,
    RedisService,
    LoggerService,
  ],
})
export class AuthModule {}
