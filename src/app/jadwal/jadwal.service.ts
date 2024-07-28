// src/app/jadwal/jadwal.service.ts
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Jadwal } from './jadwal.entity';
import {
  CreateJadwalDto,
  // CreateJamDto,
  FindAllJadwalDTO,
  UpdateJadwalDto,
} from './jadwal.dto';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { REQUEST } from '@nestjs/core';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';

@Injectable()
export class JadwalService extends BaseResponse {
  constructor(
    @InjectRepository(Jadwal)
    private readonly jadwalRepository: Repository<Jadwal>,
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(JamJadwal)
    private readonly jamJadwalRepository: Repository<JamJadwal>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(createJadwalDto: CreateJadwalDto): Promise<ResponseSuccess> {
    const { hari, jam_jadwal } = createJadwalDto;

    // Create the Jadwal entity
    const jadwal = this.jadwalRepository.create({
      hari,
      created_by: { id: this.req.user.id },
    });

    const savedJadwal = await this.jadwalRepository.save(jadwal);

    for (const jamJadwalDto of jam_jadwal) {
      // Create JamJadwal entities for each JamJadwalDto
      const jamJadwal = new JamJadwal();
      jamJadwal.jam_mulai = jamJadwalDto.jam_mulai;
      jamJadwal.jam_selesai = jamJadwalDto.jam_selesai;
      jamJadwal.jadwal = savedJadwal;

      const savedJamJadwal = await this.jamJadwalRepository.save(jamJadwal);

      // Create JamDetailJadwal entities for each JamDetailDto
      const jamDetailJadwals = await Promise.all(
        jamJadwalDto.jam_detail.map(async (jdDto) => {
          const jamDetailJadwal = new JamDetailJadwal();
          jamDetailJadwal.jamJadwal = savedJamJadwal;

          const mapel = await this.mapelRepository.findOne({
            where: {
              id: jdDto.mapel,
            },
          });
          const kelas = await this.kelasRepository.findOne({
            where: {
              id: jdDto.kelas,
            },
          });

          if (!mapel || !kelas) {
            throw new HttpException(
              'Mapel or Kelas not found',
              HttpStatus.NOT_FOUND,
            );
          }

          jamDetailJadwal.mapel = mapel;
          jamDetailJadwal.kelas = kelas;

          return jamDetailJadwal;
        }),
      );

      await this.jamDetailJadwalRepository.save(jamDetailJadwals);
    }

    return this._success('Jadwal created successfully', savedJadwal);
  }

  async findAll(): Promise<any> {
    const jadwalList = await this.jadwalRepository.find({
      relations: [
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.mapel',
        'jam_jadwal.jam_detail.kelas',
      ],
    });

    const jamJadwalList = await this.jamJadwalRepository.find({
      relations: ['jam_detail', 'jam_detail.mapel', 'jam_detail.kelas'],
    });

    // Extract JamJadwal IDs
    const jamJadwalIds = jamJadwalList.map((jamJadwal) => jamJadwal.id);

    const jamDetailList = await this.jamDetailJadwalRepository.find({
      relations: ['mapel', 'kelas', 'jamJadwal'], // Ensure the relation to 'jamJadwal' is included
      where: {
        jamJadwal: {
          id: In(jamJadwalIds), // Use IN operator to filter by multiple IDs
        },
      },
    });

    return jadwalList.map((jadwal) => ({
      id: jadwal.id,
      hari: jadwal.hari,
      jam_jadwal: jadwal.jam_jadwal.map((jamJadwal) => ({
        id: jamJadwal.id,
        jam_mulai: jamJadwal.jam_mulai,
        jam_selesai: jamJadwal.jam_selesai,
        jam_detail: jamDetailList
          .filter((detail) => detail.jamJadwal.id === jamJadwal.id) // Filter by current jamJadwal ID
          .map((detail) => ({
            id: detail.id,
            nama_mapel: detail.mapel ? detail.mapel.nama_mapel : null,
            nama_kelas: detail.kelas ? detail.kelas.nama_kelas : null,
          })),
      })),
    }));
  }

  async update(
    id: number,
    updateJadwalDto: UpdateJadwalDto,
  ): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({
      where: { id },
      relations: [
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.mapel',
        'jam_jadwal.jam_detail.kelas',
      ],
    });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    // Update basic jadwal properties
    if (updateJadwalDto.hari) {
      jadwal.hari = updateJadwalDto.hari;
    }

    // Update jam_jadwal and jam_detail
    if (updateJadwalDto.jam_jadwal) {
      // Delete existing jam_jadwal and jam_detail records
      for (const jamJadwal of jadwal.jam_jadwal) {
        await this.jamDetailJadwalRepository.delete({
          jamJadwal: { id: jamJadwal.id },
        });
      }
      await this.jamJadwalRepository.delete({ jadwal: { id: jadwal.id } });

      // Create new jam_jadwal and jam_detail records
      for (const jamJadwalDto of updateJadwalDto.jam_jadwal) {
        const jamJadwal = new JamJadwal();
        jamJadwal.jam_mulai = jamJadwalDto.jam_mulai;
        jamJadwal.jam_selesai = jamJadwalDto.jam_selesai;
        jamJadwal.jadwal = jadwal;

        const savedJamJadwal = await this.jamJadwalRepository.save(jamJadwal);

        const jamDetailJadwals = await Promise.all(
          jamJadwalDto.jam_detail.map(async (jdDto) => {
            const jamDetailJadwal = new JamDetailJadwal();
            jamDetailJadwal.jamJadwal = savedJamJadwal;

            const mapel = await this.mapelRepository.findOne({
              where: {
                id: jdDto.mapel,
              },
            });
            const kelas = await this.kelasRepository.findOne({
              where: {
                id: jdDto.kelas,
              },
            });

            if (!mapel || !kelas) {
              throw new HttpException(
                'Mapel or Kelas not found',
                HttpStatus.NOT_FOUND,
              );
            }

            jamDetailJadwal.mapel = mapel;
            jamDetailJadwal.kelas = kelas;

            return jamDetailJadwal;
          }),
        );

        await this.jamDetailJadwalRepository.save(jamDetailJadwals);
      }
    }

    // jadwal.updated_by = { id: this.req.user.id };
    const updatedJadwal = await this.jadwalRepository.save(jadwal);
    return this._success('Jadwal updated successfully', updatedJadwal);
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
    const jadwals = await this.jadwalRepository.find({
      where: { id: In(data) },
    });

    if (jadwals.length === 0) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    await this.jadwalRepository.remove(jadwals);
    return this._success('Jadwal deleted successfully', jadwals);
  }
}
