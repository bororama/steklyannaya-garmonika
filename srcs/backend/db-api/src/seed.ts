import { NestFactory } from "@nestjs/core";
import { SeederModule } from "./seeder/seeder.module";
import { Logger } from "@nestjs/common";
import { SeederService } from "./seeder/seeder.service";
import * as dotenv from 'dotenv';

async function bootstrap() {
    NestFactory.createApplicationContext(SeederModule)
    .then(appContext => {
        const logger = appContext.get(Logger);
        const seeder = appContext.get(SeederService);

        seeder
            .seed()
            .then(() => {
                logger.debug('Data seeded successfully')
            })
            .catch(error => {
                logger.error('Data seeding has failed!')
            })
            .finally(() => appContext.close());
    });
}

dotenv.config();
bootstrap();