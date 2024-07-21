// src/app/mapel/mapel.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mapel } from './mapel.entity';
import { MapelService } from './mapel.service';
import { MapelController } from './mapel.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mapel])],
  providers: [MapelService],
  controllers: [MapelController],
})
export class MapelModule {}
