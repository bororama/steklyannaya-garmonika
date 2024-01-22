import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              return {
                dialect: 'postgres',
                host: 'db',
                port: 5432,
                username: configService.get('POSTGRES_USER'),
                password: configService.get('POSTGRES_PASSWORD'),
                database: configService.get('POSTGRES_DB'),
                autoLoadModels: true,
                synchronize: true,
              };
            },
            inject: [ConfigService],
          })
    ]
})
export class DatabaseProviderModule {}
