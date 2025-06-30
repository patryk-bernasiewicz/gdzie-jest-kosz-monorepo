import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const clerkPublishableKey = configService.get<string>(
    'CLERK_PUBLISHABLE_KEY',
  );
  const clerkSecretKey = configService.get<string>('CLERK_SECRET_KEY');
  if (!clerkPublishableKey || !clerkSecretKey) {
    throw new Error(
      'Clerk environment variables missing: CLERK_PUBLISHABLE_KEY and/or CLERK_SECRET_KEY must be set.',
    );
  }

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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gdzie Jest Kosz - Backend API')
    .setDescription('API for Gdzie Jest Kosz')
    .setVersion('DEV-0.0.2 (API v1)')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3220, '0.0.0.0');
}
void bootstrap();
