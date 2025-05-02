import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) =>
    origin.trim(),
  );
  app.enableCors({
    origin: allowedOrigins || 'http://localhost:3223',
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gdzie Jest Kosz - Backend API')
    .setDescription('API for Gdzie Jest Kosz')
    .setVersion('DEV-0.0.1 (API v1)')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3220, '0.0.0.0');
}
bootstrap();
