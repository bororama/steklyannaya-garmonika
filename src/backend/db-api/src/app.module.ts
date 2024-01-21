import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { ChatUserModule } from './chat-user/chat-user.module';
import { MatchesModule } from './matches/matches.module';
import { DatabaseProviderModule } from './database-provider/database-provider.module';
import { AdminsModule } from './admins/admins.module';
import { BansModule } from './bans/bans.module';
import { PongModule } from './pong/pong.module';
import { AuthenticatorModule } from './authenticator/authenticator.module'
import { TiendaModule } from './tienda/tienda.module'
import { MetaverseModule } from './meta/metaverse.module';

@Module({
  imports: [
    DatabaseProviderModule,
    UsersModule,
    ChatModule,
    ChatUserModule,
    MatchesModule,
    DatabaseProviderModule,
    AdminsModule,
    BansModule,
    PongModule,
    AuthenticatorModule,
    TiendaModule,
    MetaverseModule
  ],
})

export class AppModule {}
