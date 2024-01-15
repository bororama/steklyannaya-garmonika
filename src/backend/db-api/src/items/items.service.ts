import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Item } from './models/item.model';

@Injectable()
export class ItemsService {
  constructor(
        @InjectModel(Item)
        private itemModel: typeof Item
    ) {}

    async create(createItemDto: CreateItemDto): Promise<Item> {
        return this.itemModel.create({
            name: createItemDto.name,
            description: createItemDto.description
        });
    }

    async findAll(): Promise<Item[]> {
        return this.itemModel.findAll();
    }

    async findById(id: number): Promise<Item> {
        return this.itemModel.findOne({
            where: {
                id,
            }
        });
    }

    async findByName(name: string): Promise<Item[]> {
        return this.itemModel.findAll({
            where: {
                name,
            }
        });
    }

    async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
        let item = await this.findById(id);
        item.name = updateItemDto.name ?? item.name;
        item.description = updateItemDto.description ?? item.description;
        return item.save();
    }

    async remove(id: number): Promise<void> {
        const item = await this.findById(id);
        await item.destroy();
    }
}
