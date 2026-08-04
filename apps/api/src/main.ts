import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    process.env.WEB_URL,
    process.env.ADMIN_URL,
    'https://diegoferreira.coach',
    'https://www.diegoferreira.coach',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
});

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API corriendo en http://localhost:${port}`);
}

bootstrap();
