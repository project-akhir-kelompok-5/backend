import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenController } from './absen.controller';
import { AbsenService } from './absen.service';
import { Absen } from './absen.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { User } from '../auth/auth.entity';
import { AbsenGateway } from './absen.gateway';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';
import { Kelas } from '../kelas/kelas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absen, Jadwal, User, JamJadwal, JamDetailJadwal, Kelas])],
  controllers: [AbsenController],
  providers: [AbsenService, AbsenGateway, Number],
  exports:[Number]
})
export class AbsenModule {}
