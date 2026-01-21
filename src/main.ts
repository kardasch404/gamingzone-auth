import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger } from './shared/utils/logger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createLogger(),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GamingZone Auth Service')
    .setDescription('Authentication and Authorization API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`🚀 Auth Service running on port ${port}`);
  console.log(`📝 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
