import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './jwtAccessToken.strategy';
import { JwtRefreshTokenStrategy } from './jwtRefreshToken.strategy';
import { MailModule } from '../mail/mail.module';
import { ResetPassword } from './reset_password.entity';
import { Guru } from './user entity/guru.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { Siswa } from './user entity/siswa.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ResetPassword,
      Guru,
      Mapel,
      Kelas,
      Siswa
    ]),
    JwtModule.register({
      // global: true,
      // signOptions: {
      //   algorithm: 'HS256',
      // },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
})
export class AuthModule {}
