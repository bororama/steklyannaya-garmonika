import { Module, ValidationPipe, forwardRef, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Match } from './models/match.model';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { APP_PIPE } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthMiddleware } from 'src/middleware/auth-middleware';
import { AuthenticMiddleware } from 'src/middleware/authenticity-middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [SequelizeModule.forFeature([Match]), forwardRef(() => UsersModule), ConfigModule],
    controllers: [MatchesController],
    providers: [MatchesService,  { provide: APP_PIPE, useClass: ValidationPipe }],
    exports: [MatchesService]
})
export class MatchesModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware, AuthenticMiddleware)
                .forRoutes(MatchesController);
    }
}
