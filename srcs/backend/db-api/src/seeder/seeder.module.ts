import { Logger, Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '../users/users.module';
import { DatabaseProviderModule } from '../database-provider/database-provider.module';
import { AdminsModule } from '../admins/admins.module';
import { BansModule } from '../bans/bans.module';

@Module({
  imports: [DatabaseProviderModule, UsersModule, AdminsModule, BansModule],
  providers: [SeederService, Logger],
})
export class SeederModule {}
