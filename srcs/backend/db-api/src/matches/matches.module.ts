import { Module, ValidationPipe, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Match } from './models/match.model';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { APP_PIPE } from '@nestjs/core';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [SequelizeModule.forFeature([Match]), forwardRef(() => UsersModule)],
    controllers: [MatchesController],
    providers: [MatchesService,  { provide: APP_PIPE, useClass: ValidationPipe }],
    exports: [MatchesService]
})
export class MatchesModule {}
