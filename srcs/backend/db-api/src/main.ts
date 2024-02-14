import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence DB API Doc')
    .setDescription('API Specification for the Database API for the ft_transcendence project')
    .setVersion('0.1.2')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const corsOptions: CorsOptions = {
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  };

  app.enableCors(corsOptions);
  app.use(express.json({limit: '50mb'}))

  app.use('/src/profile_pics', express.static('/app/src/profile_pics'))

  await app.listen(3000);
}

dotenv.config();
bootstrap();
