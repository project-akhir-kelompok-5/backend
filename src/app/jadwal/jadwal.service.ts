// src/app/jadwal/jadwal.service.ts
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Jadwal } from './jadwal.entity';
import {
  CreateJadwalDto,
  FindAllJadwalDTO,
  UpdateJadwalDto,
} from './jadwal.dto';
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
      mapel,
      kelas,
      hari,
      jam_mulai,
      jam_selesai,
      created_by,
      //   updated_by,
    } = createJadwalDto;

    const mapelExixts = await this.mapelRepository.findOne({
      where: {
        id: mapel,
      },
    });
    if (!mapelExixts) {
      throw new HttpException('Mapel not found', HttpStatus.NOT_FOUND);
    }

    const kelasExixts = await this.kelasRepository.findOne({
      where: {
        id: kelas,
      },
    });
    if (!kelasExixts) {
      throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
    }

    const jadwal = this.jadwalRepository.create({
      mapel: mapelExixts,
      kelas: kelasExixts,
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

  async findAll(query: FindAllJadwalDTO): Promise<ResponseSuccess> {
    const { hari, mapel, kelas, limit } = query;
    const queryBuilder = this.jadwalRepository
      .createQueryBuilder('jadwal')
      .limit(limit)
      .leftJoinAndSelect('jadwal.mapel', 'mapel')
      .leftJoinAndSelect('jadwal.kelas', 'kelas')
      .leftJoinAndSelect('jadwal.created_by', 'created_by')
      .leftJoinAndSelect('jadwal.updated_by', 'updated_by');

    if (hari) {
      queryBuilder.andWhere('jadwal.hari LIKE :hari', { hari: `%${hari}%` });
    }

    if (mapel) {
      queryBuilder.andWhere('jadwal.mapel LIKE :mapel', {
        mapel: `%${mapel}%`,
      });
    }

    if (kelas) {
      queryBuilder.andWhere('jadwal.kelas LIKE :kelas', {
        kelas: `%${kelas}%`,
      });
    }

    const jadwalList = await queryBuilder.getMany();
    return this._success('List of Jadwal', jadwalList);
  }

  async update(
    id: number,
    updateJadwalDto: UpdateJadwalDto,
  ): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({
      where: { id },
      relations: ['mapel', 'kelas'],
    });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    if (updateJadwalDto.mapel) {
      const mapel = await this.mapelRepository.findOne({
        where: {
          id: updateJadwalDto.mapel,
        },
      });
      if (!mapel) {
        throw new HttpException('Mapel not found', HttpStatus.NOT_FOUND);
      }
      jadwal.mapel = mapel;
    }

    if (updateJadwalDto.kelas) {
      const kelas = await this.kelasRepository.findOne({
        where: {
          id: updateJadwalDto.kelas,
        },
      });
      if (!kelas) {
        throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
      }
      jadwal.kelas = kelas;
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

  async deleteBulk(data: number[]): Promise<ResponseSuccess> {
    const jadwals = await this.jadwalRepository.find({ where: { id: In(data) } });

    if (jadwals.length === 0) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    await this.jadwalRepository.remove(jadwals);
    return this._success('Jadwal deleted successfully', jadwals);
  }
}
