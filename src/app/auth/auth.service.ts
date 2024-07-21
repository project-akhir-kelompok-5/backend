import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './auth.entity';
import { Repository } from 'typeorm';
import { ResponseSuccess } from 'src/interface/respone/response.interface';
import {
  DeleteBulkUserDto,
  LoginDto,
  queryUSerDTO,
  RegisterDto,
  ResetPasswordDto,
} from './auth.dto';
import { compare, hash } from 'bcrypt'; //import hash
import BaseResponse from 'src/utils/response/base.response';
import { JwtService } from '@nestjs/jwt';
import { jwt_config } from 'src/config/jwt.config';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { ResetPassword } from './reset_password.entity';
import { promises } from 'dns';
import { Guru } from './user entity/guru.entity';
import { RegisterGuruDto } from './user dto/guru.dto';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { CreateStudentDto } from './user dto/siswa.dto';
import { Siswa } from './user entity/siswa.entity';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    @InjectRepository(Guru) private readonly guruRepository: Repository<Guru>,
    @InjectRepository(Siswa) private readonly siswaRepository: Repository<Siswa>,
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    super();
  }

  async resetPassword(
    user_id: number,
    token: string,
    payload: ResetPasswordDto,
  ): Promise<ResponseSuccess> {
    const userToken = await this.resetPasswordRepository.findOne({
      //cek apakah user_id dan token yang sah pada tabel reset password
      where: {
        token: token,
        user: {
          id: user_id,
        },
      },
    });

    if (payload.confirm_password !== payload.new_password) {
      throw new HttpException(
        'password tidak sama',
        HttpStatus.UNPROCESSABLE_ENTITY, // jika tidak sah , berikan pesan token tidak valid
      );
    }

    if (!userToken) {
      throw new HttpException(
        'Token tidak valid',
        HttpStatus.UNPROCESSABLE_ENTITY, // jika tidak sah , berikan pesan token tidak valid
      );
    }

    payload.new_password = await hash(payload.new_password, 12); //hash password
    await this.authRepository.save({
      // ubah password lama dengan password baru
      password: payload.new_password,
      id: user_id,
    });
    await this.resetPasswordRepository.delete({
      // hapus semua token pada tabel reset password yang mempunyai user_id yang dikirim, agar tidak bisa digunakan kembali
      user: {
        id: user_id,
      },
    });

    return this._success('Reset Password Berhasil, Silahkan login ulang');
  }

  async DeleteBulkUser(payload: DeleteBulkUserDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;
      await Promise.all(
        payload.data.map(async (data) => {
          try {
            const result = await this.authRepository.delete(data);

            if (result.affected === 1) {
              berhasil += 1;
            } else {
              gagal += 1;
            }
          } catch {}
        }),
      );

      return this._success(`Berhasil menghapus ${berhasil} dan gagal ${gagal}`);
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  async forgotPassword(email: string): Promise<ResponseSuccess> {
    const user = await this.authRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new HttpException(
        'Email tidak ditemukan',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const token = randomBytes(32).toString('hex'); // membuat token
    const link = `http://localhost:2009/auth/reset-password/${user.id}/${token}`; //membuat link untuk reset password
    await this.mailService.sendForgotPassword({
      email: email,
      name: user.nama,
      link: link,
    });

    const payload = {
      user: {
        id: user.id,
      },
      token: token,
    };

    await this.resetPasswordRepository.save(payload); // menyimpan token dan id ke tabel reset password

    return this._success('Silahkan Cek Email');
  }

  private generateJWT(
    payload: jwtPayload,
    expiresIn: string | number,
    secret_key: string,
  ) {
    return this.jwtService.sign(payload, {
      secret: secret_key,
      expiresIn: expiresIn,
    });
  } //membuat method untuk generate jwt

  async registerGuru(createGuruDto: RegisterGuruDto): Promise<ResponseSuccess> {
    const { nama, email, password, jurnal_kegiatan, kelas_id, mapel_id } =
      createGuruDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return this._error(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create and save user
    const hashedPassword = await hash(password, 12);
    const user = this.authRepository.create({
      nama,
      email,
      password: hashedPassword,
      role: UserRole.GURU,
    });
    await this.authRepository.save(user);

    // Check if Kelas and Mapel exist
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelas_id },
    });
    if (!kelas) {
      return this._error('Kelas not found', HttpStatus.BAD_REQUEST);
    }

    const mapel = await this.mapelRepository.findOne({
      where: { id: mapel_id },
    });
    if (!mapel) {
      return this._error('Mapel not found', HttpStatus.BAD_REQUEST);
    }

    // Create and save guru
    const guru = this.guruRepository.create({
      user_id: user, // Correctly assign the user relation
      jurnal_kegiatan,
      kelas_id: kelas, // Use the actual object
      mapel_id: mapel, // Use the actual object
    });

    const savedGuru = await this.guruRepository.save(guru);
    return this._success('Guru registered successfully', savedGuru);
  }

  async registerStudent(
    createStudentDto: CreateStudentDto,
  ): Promise<ResponseSuccess> {
    const { nama, email, password, kelas_id, NISN, tanggal_lahir, alamat } =
      createStudentDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return this._error(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create and save user
    const hashedPassword = await hash(password, 12);
    const user = this.authRepository.create({
      nama,
      email,
      password: hashedPassword,
      role: UserRole.SISWA,
    });
    await this.authRepository.save(user);

    // Check if Kelas exists
    const kelas = await this.kelasRepository.findOne({
      where: { id: kelas_id },
    });
    if (!kelas) {
      return this._error('Kelas not found', HttpStatus.BAD_REQUEST);
    }

    // Create and save student
    const siswa = this.siswaRepository.create({
      user_id: user,
      kelas_id: kelas,
      NISN,
      tanggal_lahir,
      alamat,
      
    });

    const savedSiswa = await this.siswaRepository.save(siswa);
    return this._success('Student registered successfully', savedSiswa);
  }

  async registerBulk(payloads: RegisterDto[]): Promise<ResponseSuccess> {
    const createdUsers = [];
    for (const payload of payloads) {
      const checkUserExists = await this.authRepository.findOne({
        where: {
          email: payload.email,
        },
      });

      if (checkUserExists) {
        throw new HttpException(
          `User with email ${payload.email} already registered`,
          HttpStatus.FOUND,
        );
      }

      payload.password = await hash(payload.password, 12); // hash password
      // const user = this.authRepository.create({ ...payload });
      // await this.authRepository.save({
      //   ...user,
      //   avatar: 'http://localhost:2009/uploads/1721363949798.svg',
      // });
      // createdUsers.push(user);
    }

    return this._success('Bulk Register Berhasil', {
      ...createdUsers,
    });
  }

  async register(payload: RegisterDto): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        email: payload.email,
      },
    });
    if (checkUserExists) {
      throw new HttpException('User already registered', HttpStatus.FOUND);
    }

    payload.password = await hash(payload.password, 12); // hash password

    await this.authRepository.save({
      ...payload,
      avatar: 'http://localhost:2009/uploads/1721363949798.svg',
    });

    return this._success('Register Berhasil');
  }

  async profile(id: number): Promise<ResponseSuccess> {
    const user = await this.authRepository.findOne({
      where: {
        id: id,
      },
    });

    return this._success('OK', user);
  }

  async login(payload: LoginDto): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        refresh_token: true,
        role: true,
        avatar: true,
      },
    });
    if (!checkUserExists) {
      throw new HttpException(
        'User tidak ditemukan',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    // if (checkUserExists.role != payload.role) {
    //   throw new HttpException(
    //     'role tidak sesuai',
    //     HttpStatus.UNPROCESSABLE_ENTITY,
    //   );
    // }
    const checkPassword = await compare(
      payload.password,
      checkUserExists.password,
    );
    if (checkPassword) {
      const jwtPayload: jwtPayload = {
        id: checkUserExists.id,
        nama: checkUserExists.nama,
        email: checkUserExists.email,
        // role: checkUserExists.role,
      };

      const access_token = await this.generateJWT(
        jwtPayload,
        '1d',
        jwt_config.access_token_secret,
      );
      const refresh_token = await this.generateJWT(
        jwtPayload,
        '1d',
        jwt_config.refresh_token_secret,
      );
      await this.authRepository.save({
        refresh_token: refresh_token,
        id: checkUserExists.id,
      });
      return this._success('Login Berhasil', {
        ...checkUserExists,
        access_token: access_token,
        refresh_token: refresh_token,
      });
    } else {
      throw new HttpException(
        'Email, Password, atau Role Tidak sesuai',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
  async refreshToken(id: number, token: string): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        id: id,
        refresh_token: token,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        refresh_token: true,
        role: true,
      },
    });

    console.log('user', checkUserExists);
    if (checkUserExists === null) {
      throw new UnauthorizedException();
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      nama: checkUserExists.nama,
      email: checkUserExists.email,
      // role: checkUserExists.role,
    };

    const access_token = await this.generateJWT(
      jwtPayload,
      '1d',
      jwt_config.access_token_secret,
    );

    const refresh_token = await this.generateJWT(
      jwtPayload,
      '1d',
      jwt_config.refresh_token_secret,
    );

    await this.authRepository.save({
      refresh_token: refresh_token,
      id: checkUserExists.id,
    });

    return this._success('Success Update Token', {
      ...checkUserExists,
      access_token: access_token,
      refresh_token: refresh_token,
    });
  }

  async getUsers(query: queryUSerDTO): Promise<ResponseSuccess> {
    const queryBuilder = this.authRepository.createQueryBuilder('user');
    const { role, page, pageSize, limit, nama } = query;

    if (role) {
      queryBuilder.andWhere('user.role LIKE :role', { role: `%${role}%` });
    }

    if (nama) {
      queryBuilder.andWhere('user.nama LIKE :nama', { nama: `%${nama}%` });
    }

    const users = await queryBuilder.getMany();

    return this._success(
      `Daftar Pengguna, Jumlah User: ${await queryBuilder.getCount()}`,
      users,
    );
  }
}
