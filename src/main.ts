import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { createLogger } from './shared/utils/logger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createLogger(),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  await app.listen(port);
  console.log(`🚀 Auth Service running on port ${port}`);
}
bootstrap();
