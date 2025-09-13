import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmConfig } from './config/typeOrmConfig';
import { SystemModule } from './domains/system/system.module';
import { TicketModule } from './domains/ticket/ticket.module';
@Module({
    imports: [TypeOrmModule.forRoot(TypeOrmConfig), SystemModule, TicketModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
