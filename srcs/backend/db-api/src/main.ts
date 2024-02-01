import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence DB API Doc')
    .setDescription('API Specification for the Database API for the ft_transcendence project')
    .setVersion('0.1.1')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    'origin': ['http://' + process.env.HOST + ':5173', 'http://localhost:5173'],
    'methods': 'GET,POST,DELETE',
    'preflightContinue': false,
    'credentials': true,
  });

  app.use('/src/profile_pics', express.static('/app/src/profile_pics'))

  await app.listen(3000);
}

dotenv.config();
bootstrap();
