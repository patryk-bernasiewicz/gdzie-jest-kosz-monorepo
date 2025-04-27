import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) =>
    origin.trim(),
  );
  app.enableCors({
    origin: allowedOrigins || 'http://localhost:3223',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3220, '0.0.0.0');
}
bootstrap();
