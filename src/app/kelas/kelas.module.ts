// src/app/kelas/kelas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from './kelas.entity';
import { KelasService } from './kelas.service';
import { KelasController } from './kelas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kelas])],
  providers: [KelasService],
  controllers: [KelasController],
})
export class KelasModule {}
