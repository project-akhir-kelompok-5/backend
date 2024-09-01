import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './app/auth/auth.module';
import { MailModule } from './app/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './app/upload/upload.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProfileModule } from './app/profile/profile.module';
import { UniqueValidator } from './utils/validator/unique.validator';
import { QueryBuilderModule } from './query-builder/query-builder.module';
import { KelasModule } from './app/kelas/kelas.module';
import { MapelModule } from './app/mapel/mapel.module';
import { JadwalModule } from './app/jadwal/jadwal.module';
import { AbsenModule } from './app/absen/absen.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './app/auth/roles.guard';
// import { JamJadwalModule } from './app/jam-jadwal/jam-jadwal.module';
import { SubjectCodeModule } from './app/subject_code/subject_code.module';
import { HariModule } from './app/hari/hari.module';
import { DownloadModule } from './app/download/download.module';
import { TestSocketModule } from './app/test-socket/test-socket.module';
import { NotifikasiModule } from './app/notifikasi/notifikasi.module';
import { RekapAbsenModule } from './app/rekap-absen/rekap-absen.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AbsenService } from './app/absen/absen.service';
import { AbsenGuru } from './app/absen/absen-guru/absen-guru.entity';
import { JamDetailJadwal } from './app/jadwal/jam-detail-jadwal.entity';
import { Guru } from './app/auth/guru/guru.entity';
import { Jadwal } from './app/jadwal/jadwal.entity';
import { Murid } from './app/auth/siswa/siswa.entity';
import { AbsenSiswa } from './app/absen/absen-siswa/absen-siswa.entity';
import { GeoLocationModule } from './app/geo-location/geo-location.module';
import { AbsenGateway } from './app/absen/absen.gateway';
import { AuthService } from './app/auth/auth.service';
import { User } from './app/auth/auth.entity';
import { Mapel } from './app/mapel/mapel.entity';
import { Kelas } from './app/kelas/kelas.entity';
import { ResetPassword } from './app/auth/reset_password.entity';
import { Notifikasi } from './app/notifikasi/notifikasi.entity';
import { DownloadService } from './app/download/download.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      AbsenGuru,
      Guru,
      Jadwal,
      Murid,
      AbsenSiswa,
      JamDetailJadwal,
      User,
      ResetPassword,
      Notifikasi
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    MailModule,
    QueryBuilderModule,
    ProfileModule,
    KelasModule,
    MapelModule,
    JadwalModule,
    AbsenModule,
    SubjectCodeModule,
    HariModule,
    DownloadModule,
    TestSocketModule,
    NotifikasiModule,
    RekapAbsenModule,
    GeoLocationModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, AuthService, UniqueValidator, AbsenGateway, DownloadService],
})
export class AppModule {}
