import {
  DeleteBulkUserDto,
  RegisterBulkSiswaDto,
  RegisterSiswaDto,
  UpdateSiswaDto,
} from './siswa.dto';
import { Role } from '../roles.enum';
import { compare, hash } from 'bcrypt'; //import hash
import { User } from '../auth.entity';
import { Siswa } from './siswa.entity';
import { Mapel } from 'src/app/mapel/mapel.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { ResponseSuccess } from 'src/interface/respone';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import BaseResponse from 'src/utils/response/base.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class SiswaService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async updateSiswa(
    id: number,
    updateSiswaDto: UpdateSiswaDto,
  ): Promise<ResponseSuccess> {
    const { avatar, nomor_hp, alamat } = updateSiswaDto;

    // Find the student by ID
    const siswa = await this.siswaRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!siswa) {
      throw new HttpException('Siswa not found', HttpStatus.NOT_FOUND);
    }

    // Update user details
    siswa.user.avatar = avatar ?? siswa.user.avatar;
    siswa.user.nomor_hp = nomor_hp ?? siswa.user.nomor_hp;
    siswa.alamat = alamat ?? siswa.alamat;

    // Save updated student
    const updatedSiswa = await this.siswaRepository.save(siswa);

    return this._success('Student updated successfully', updatedSiswa);
  }

  async DeleteBulkSiswa(payload: DeleteBulkUserDto): Promise<ResponseSuccess> {
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

  async registerSiswa(
    registerSiswaDto: RegisterSiswaDto,
  ): Promise<ResponseSuccess> {
    const { nama, email, password, kelas, NISN, tanggal_lahir, alamat } = registerSiswaDto;
  
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
    const userExixts = this.authRepository.create({
      nama,
      email,
      password: hashedPassword,
      role: Role.Murid,
    });
    const savedUser = await this.authRepository.save(userExixts);
  
    // Check if Kelas exists
    const kelasExixts = await this.kelasRepository.findOne({
      where: { id: kelas },
    });
    if (!kelasExixts) {
      return this._error('Kelas not found', HttpStatus.BAD_REQUEST);
    }
  
    // Create and save student with the same ID as the user
    const siswa = this.siswaRepository.create({
      user: savedUser, // Associate with the saved user
      kelas: kelasExixts,
      NISN,
      tanggal_lahir,
      alamat,
    });
  
    const savedSiswa = await this.siswaRepository.save(siswa);
  
    return this._success('Student registered successfully', savedSiswa);
  }

  async registerBulkSiswa(
    payload: RegisterBulkSiswaDto,
  ): Promise<ResponseSuccess> {
    let berhasil = 0;
    let gagal = 0;

    for (const dto of payload.data) {
      try {
        const result = await this.registerSiswa(dto);
        berhasil += 1;
      } catch (error) {
        gagal += 1;
      }
    }

    return this._success(
      `Berhasil Regiter, berhasil: ${berhasil} dan gagal: ${gagal}`,
    );
  }

  async getSiswaList(): Promise<ResponseSuccess> {
    const siswaList = await this.siswaRepository.find({
      relations: ['user', 'kelas'],
    });

    return this._success('List of students retrieved successfully', siswaList);
  }

  async getSiswaProfile(): Promise<ResponseSuccess> {
    const users = await this.authRepository.findOne({
      where: { id: this.req.user.id },
      relations: ['siswa', 'kelas'],
    });

    const siswa = await this.siswaRepository.findOne({
      where: { id: users.siswa.id },
      relations: ['user', 'kelas'],
    });

    if (!siswa) {
      throw new HttpException('Siswa not found', HttpStatus.NOT_FOUND);
    }

    const { kelas, user } = siswa;

    // Prepare the response
    const studentDetail = {
      id: user.id,
      avatar: user.avatar,
      nama: user.nama,
      nomor_hp: user.nomor_hp,
      email: user.email,
      role: user.role,
      NISN: siswa.NISN,
      tanggal_lahir: siswa.tanggal_lahir,
      alamat: siswa.alamat,
    };

    return this._success(
      'Student details retrieved successfully',
      studentDetail,
    );
  }
}
