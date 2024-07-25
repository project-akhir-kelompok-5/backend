import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenController } from './absen.controller';
import { AbsenService } from './absen.service';
import { Absen } from './absen.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { User } from '../auth/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absen, Jadwal, User])],
  controllers: [AbsenController],
  providers: [AbsenService],
})
export class AbsenModule {}
