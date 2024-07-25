// src/app/mapel/mapel.service.ts
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapel } from './mapel.entity';
import { CreateMapelDto } from './mapel.dto';
import { ResponseSuccess } from 'src/interface/respone';
import BaseResponse from 'src/utils/response/base.response';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class MapelService extends BaseResponse {
  constructor(
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(createMapelDto: CreateMapelDto): Promise<ResponseSuccess> {
    const { nama_mapel } = createMapelDto;

    // Check if mata pelajaran already exists
    const existingMapel = await this.mapelRepository.findOne({
      where: { nama_mapel },
    });
    if (existingMapel) {
      throw new HttpException(
        'Mata Pelajaran already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create and save new mata pelajaran
    const mapel = this.mapelRepository.create({
        ...createMapelDto,
    
        created_by: {
            id: this.req.user.id,
            nama: this.req.user.nama
        }
    });
    const hasil = await this.mapelRepository.save(mapel);

    return this._success('Ok', hasil);
  }

  async findAll(): Promise<ResponseSuccess> {
    const mapels = await this.mapelRepository.find();
    return this._success('List of Mata Pelajaran', mapels);
  }

  async update(id: number, updateMapelDto: CreateMapelDto): Promise<ResponseSuccess> {
    const { nama_mapel } = updateMapelDto;

    const mapel = await this.mapelRepository.findOne({
      where: { id },
    });

    if (!mapel) {
      throw new HttpException('Mata Pelajaran not found', HttpStatus.NOT_FOUND);
    }

    // Update mata pelajaran
    mapel.nama_mapel = nama_mapel;
    const hasil = await this.mapelRepository.save(mapel);

    return this._success('Update successful', hasil);
  }

  async delete(id: number): Promise<ResponseSuccess> {
    const result = await this.mapelRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException('Mata Pelajaran not found', HttpStatus.NOT_FOUND);
    }

    return this._success('Mata Pelajaran deleted successfully');
  }

  async deleteBulk(ids: number[]): Promise<ResponseSuccess> {
    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await this.mapelRepository.delete(id);
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

    return this._success(`Bulk delete completed. Berhasil: ${berhasil}, Gagal: ${gagal}`);
  }
}
