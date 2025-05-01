import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

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
  await app.listen(process.env.PORT ?? 3220, '0.0.0.0');
}
bootstrap();
