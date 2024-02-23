import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express'
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence DB API Doc')
    .setDescription('API Specification for the Database API for the ft_transcendence project')
    .setVersion('0.1.1')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get<ConfigService>(ConfigService);
  const host = configService.get('HOST').toLowerCase();
  const port = configService.get('FRONTEND_PORT');

  app.enableCors({
    'origin': ['http://' + host + (+port != 80 ? ':' + port : '')],
    'methods': 'GET,POST,DELETE',
    'preflightContinue': false,
    'credentials': true,
  });

  console.log('Serving for: http://' + host + (+port != 80 ? ':' + port : ''));

  app.use('/src/profile_pics', express.static('/app/src/profile_pics'))

  await app.listen(3000);
}

dotenv.config();
bootstrap();
