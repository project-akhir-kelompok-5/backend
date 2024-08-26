import { Module } from '@nestjs/common';
import { JadwalController } from './jadwal.controller';
import { JadwalService } from './jadwal.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jadwal } from './jadwal.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { JamJadwal } from './jam-jadwal.entity';
import { JamDetailJadwal } from './jam-detail-jadwal.entity';
import { SubjectCodeEntity } from '../subject_code/subject_code.entity';
import { User } from '../auth/auth.entity';
import { Murid } from '../auth/siswa/siswa.entity';
import { Guru } from '../auth/guru/guru.entity';
import { AbsenGuru } from '../absen/absen-guru/absen-guru.entity';
import { AbsenSiswa } from '../absen/absen-siswa/absen-siswa.entity';
import { AbsenKelas } from '../absen/absen-kelas/absen-kelas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jadwal,
      Mapel,
      Kelas,
      AbsenSiswa,
      JamJadwal,
      JamDetailJadwal,
      User,
      Murid,
      Guru,
      SubjectCodeEntity,
      AbsenKelas,
      AbsenGuru
    ]),
  ],
  controllers: [JadwalController],
  providers: [JadwalService],
})
export class JadwalModule {}
