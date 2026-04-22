// backend/src/main.ts
import 'dotenv/config'; // Load env vars before anything else
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Globalne rury walidacyjne
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Usuwa z body pola, których nie ma w DTO (security)
    forbidNonWhitelisted: true, // Rzuca błąd jak ktoś wyśle pole spoza DTO
    transform: true, // Automatycznie konwertuje typy
  }));

  // Włączamy komunikację z frontendem
  app.enableCors({
    origin: true, // Allow all origins for simplicity in dev
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
  console.log(`Backend kanban działa na: ${await app.getUrl()}`);
}
bootstrap();