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
import { JamJadwalModule } from './app/jam-jadwal/jam-jadwal.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    MailModule,
    QueryBuilderModule,
    ProfileModule,
    KelasModule,
    MapelModule,
    JadwalModule,
    AbsenModule,
    JamJadwalModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, UniqueValidator, ],
})
export class AppModule {}
