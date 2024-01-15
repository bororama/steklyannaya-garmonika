import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Item } from './models/item.model';

@Module({
  imports: [SequelizeModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
