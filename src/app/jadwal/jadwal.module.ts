import { Module } from '@nestjs/common';
import { JadwalController } from './jadwal.controller';
import { JadwalService } from './jadwal.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jadwal } from './jadwal.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Jadwal, Mapel, Kelas])],
  controllers: [JadwalController],
  providers: [JadwalService]
})
export class JadwalModule {}
