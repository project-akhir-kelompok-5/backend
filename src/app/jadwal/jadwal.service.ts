// src/app/jadwal/jadwal.service.ts
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jadwal } from './jadwal.entity';
import { CreateJadwalDto } from './jadwal.dto';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class JadwalService extends BaseResponse {
  constructor(
    @InjectRepository(Jadwal)
    private readonly jadwalRepository: Repository<Jadwal>,
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(createJadwalDto: CreateJadwalDto): Promise<ResponseSuccess> {
    const {
      mapel_id,
      kelas_id,
      hari,
      jam_mulai,
      jam_selesai,
      created_by,
      //   updated_by,
    } = createJadwalDto;

    const mapel = await this.mapelRepository.findOne({
      where: {
        id: mapel_id,
      },
    });
    if (!mapel) {
      throw new HttpException('Mapel not found', HttpStatus.NOT_FOUND);
    }

    const kelas = await this.kelasRepository.findOne({
      where: {
        id: kelas_id,
      },
    });
    if (!kelas) {
      throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
    }

    const jadwal = this.jadwalRepository.create({
      mapel_id: mapel,
      kelas_id: kelas,
      hari,
      jam_mulai,
      jam_selesai,
      created_by: {
        id: this.req.user.id,
      },
    });
    

    await this.jadwalRepository.save(jadwal);
    return this._success('Jadwal created successfully', jadwal);
  }

  async findAll(): Promise<ResponseSuccess> {
    const jadwalList = await this.jadwalRepository.find({
      relations: ['mapel_id.created_by', 'kelas_id.created_by', 'created_by', 'updated_by', ] ,
    });
    return this._success('List of Jadwal', jadwalList);
  }

  async update(id: number, updateJadwalDto: UpdateJadwalDto): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({
      where: { id },
      relations: ['mapel_id', 'kelas_id'],
    });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    if (updateJadwalDto.mapel_id) {
      const mapel = await this.mapelRepository.findOne({
        where: {
          id: updateJadwalDto.mapel_id,
        },
      });
      if (!mapel) {
        throw new HttpException('Mapel not found', HttpStatus.NOT_FOUND);
      }
      jadwal.mapel_id = mapel;
    }

    if (updateJadwalDto.kelas_id) {
      const kelas = await this.kelasRepository.findOne({
        where: {
          id: updateJadwalDto.kelas_id,
        },
      });
      if (!kelas) {
        throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
      }
      jadwal.kelas_id = kelas;
    }

    if (updateJadwalDto.hari) {
      jadwal.hari = updateJadwalDto.hari;
    }

    if (updateJadwalDto.jam_mulai) {
      jadwal.jam_mulai = updateJadwalDto.jam_mulai;
    }

    if (updateJadwalDto.jam_selesai) {
      jadwal.jam_selesai = updateJadwalDto.jam_selesai;
    }

    jadwal.updated_by = this.req.user.id;
    await this.jadwalRepository.save(jadwal);
    return this._success('Jadwal updated successfully', jadwal);
  }

  async delete(id: number): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({ where: { id } });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    await this.jadwalRepository.remove(jadwal);
    return this._success('Jadwal deleted successfully', jadwal);
  }
}
