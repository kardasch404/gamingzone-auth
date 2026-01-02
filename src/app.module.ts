import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '@common/config/env.validation';
import { PrismaService } from '@core/prisma.service';
import { RedisService } from '@core/redis.service';
import { LoggerService } from '@core/logger.service';
import { HealthController } from '@presentation/health.controller';
import { AuthModule } from '@presentation/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService, RedisService, LoggerService],
  exports: [PrismaService, RedisService, LoggerService],
})
export class AppModule {}
