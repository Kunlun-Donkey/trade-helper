import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Static files for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // CORS - allow Vercel frontend, Railway, and localhost
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.FRONTEND_URL || '',
    /vercel\.app$/,
    /railway\.app$/,
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/health'],
  });

  // Health check
  app.use('/health', (_req, res) => {
    res.json({ status: 'ok', service: '外贸轻助手 API' });
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();
