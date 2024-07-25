// src/app/kelas/kelas.service.ts
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kelas } from './kelas.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { CreateKelasDto } from './kelas.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class KelasService extends BaseResponse {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(createKelasDto: CreateKelasDto): Promise<ResponseSuccess> {
    const { nama_kelas } = createKelasDto;

    // Check if mata pelajaran already exists
    const existingMapel = await this.kelasRepository.findOne({
      where: { nama_kelas },
    });
    if (existingMapel) {
      throw new HttpException(
        'Mata Pelajaran already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hasil = await this.kelasRepository.save({
      ...createKelasDto,
      created_by: {
        id: this.req.user.id,
      },
    });

    return this._success('Ok', hasil);
  }

  async findAll(): Promise<ResponseSuccess> {
    const kelasList = await this.kelasRepository.find({
      relations: ['siswa', 'siswa.user', 'siswa'], // Load related siswa and their associated user
    });

    // Structure the response to include user with nested siswa
    const response = kelasList.map((kelas) => ({
      id: kelas.id,
      nama_kelas: kelas.nama_kelas,
      users: kelas.siswa.map((siswa) => ({
        id: siswa.user.id,
        avatar: siswa.user.avatar,
        nama: siswa.user.nama,
        nomor_hp: siswa.user.nomor_hp,
        email: siswa.user.email,
        role: siswa.user.role,
        siswa: {
          id: siswa.id,
          NISN: siswa.NISN,
          tanggal_lahir: siswa.tanggal_lahir,
          alamat: siswa.alamat,
        },
      })),
    }));

    return this._success('List of Kelas with Students', response);
  }

  async findOneWithStudents(id: number): Promise<ResponseSuccess> {
    const kelas = await this.kelasRepository.findOne({
      where: { id },
      relations: ['siswa'], // Ensure to load the related siswa
    });

    if (!kelas) {
      throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
    }

    // Structure the response to include the students
    const response = {
      id: kelas.id,
      nama_kelas: kelas.nama_kelas,
      siswa: kelas.siswa.map((siswa) => ({
        id: siswa.id,
        NISN: siswa.NISN,
        tanggal_lahir: siswa.tanggal_lahir,
        alamat: siswa.alamat,
      })),
    };

    return this._success('Detail of Kelas with Students', response);
  }

  async update(
    id: number,
    updateKelasDto: CreateKelasDto,
  ): Promise<ResponseSuccess> {
    const { nama_kelas } = updateKelasDto;

    const kelas = await this.kelasRepository.findOne({
      where: { id },
    });

    if (!kelas) {
      throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
    }

    // Update class
    kelas.nama_kelas = nama_kelas;
    const hasil = await this.kelasRepository.save(kelas);

    return this._success('Update successful', hasil);
  }

  async delete(id: number): Promise<ResponseSuccess> {
    const result = await this.kelasRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
    }

    return this._success('Kelas deleted successfully');
  }

  async deleteBulk(ids: number[]): Promise<ResponseSuccess> {
    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await this.kelasRepository.delete(id);
          if (result.affected === 1) {
            berhasil += 1;
          } else {
            gagal += 1;
          }
        } catch {
          gagal += 1;
        }
      }),
    );

    return this._success(
      `Bulk delete completed. Berhasil: ${berhasil}, Gagal: ${gagal}`,
    );
  }
}
