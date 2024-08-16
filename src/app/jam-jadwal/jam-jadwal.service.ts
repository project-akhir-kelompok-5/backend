// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { In, Repository } from 'typeorm';
// import { JamJadwal } from './jam-jadwal.entity';
// import {
//   CreateJamJadwalDto,
//   UpdateJamJadwalDto,
//   FindAllJamJadwalDto,
// } from './jam-jadwal.dto';
// import { Mapel } from '../mapel/mapel.entity';
// import { Kelas } from '../kelas/kelas.entity';
// import BaseResponse from 'src/utils/response/base.response';
// import { ResponseSuccess } from 'src/interface/respone';
// import { JamDetailJadwal } from './jam-detail-jadwal.entity';

// @Injectable()
// export class JamJadwalService extends BaseResponse {
//   constructor(
//     @InjectRepository(JamJadwal)
//     private readonly jamJadwalRepository: Repository<JamJadwal>,
//     @InjectRepository(Mapel)
//     private readonly mapelRepository: Repository<Mapel>,
//     @InjectRepository(Kelas)
//     private readonly kelasRepository: Repository<Kelas>,
//     @InjectRepository(JamDetailJadwal)
//     private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
//   ) {
//     super();
//   }

//   async create(createJamJadwalDto: CreateJamJadwalDto): Promise<ResponseSuccess> {
//     // Save JamJadwal first
//     const jamJadwal = new JamJadwal();
//     jamJadwal.jam_mulai = createJamJadwalDto.jam_mulai;
//     jamJadwal.jam_selesai = createJamJadwalDto.jam_selesai;
//     const savedJamJadwal = await this.jamJadwalRepository.save(jamJadwal);
  
//     // Save JamDetailJadwal
//     const jamDetailJadwals = createJamJadwalDto.jam_jadwal.map(async (dto) => {
//       const mapel = await this.mapelRepository.findOneBy({ id: dto.mapel });
//       const kelas = await this.kelasRepository.findOneBy({ id: dto.kelas });
      
//       if (!mapel || !kelas) {
//         throw new HttpException('Mapel or Kelas not found', HttpStatus.NOT_FOUND);
//       }
  
//       const detail = new JamDetailJadwal();
//       detail.jamJadwal = savedJamJadwal;
//       detail.mapel = mapel; // Directly assign the full entity
//       detail.kelas = kelas; // Directly assign the full entity
      
//       return detail;
//     });
  
//     // Wait for all JamDetailJadwal entities to be created
//     const savedJamDetailJadwals = await Promise.all(jamDetailJadwals);
    
//     // Save all JamDetailJadwals
//     await this.jamDetailJadwalRepository.save(savedJamDetailJadwals);
  
//     return this._success('JamJadwal created successfully', savedJamJadwal);
//   }
  

//   async findAll(): Promise<ResponseSuccess> {
//     // Fetch all JamJadwal records
//     const jamJadwalList = await this.jamJadwalRepository.find({
//       relations: ['jam_detail', 'jam_detail.mapel', 'jam_detail.kelas'],
//     });
  
//     // Extract JamJadwal IDs
//     const jamJadwalIds = jamJadwalList.map(jamJadwal => jamJadwal.id);
  
//     // Fetch all JamDetailJadwal records related to the JamJadwal IDs
//     const jamDetailList = await this.jamDetailJadwalRepository.find({
//       relations: ['mapel', 'kelas', 'jamJadwal'], // Ensure the relation to 'jamJadwal' is included
//       where: {
//         jamJadwal: {
//           id: In(jamJadwalIds), // Use IN operator to filter by multiple IDs
//         },
//       },
//     });
  
//     // Map JamJadwal with its details
//     const formattedList = jamJadwalList.map(jamJadwal => ({
//       id: jamJadwal.id,
//       jam_mulai: jamJadwal.jam_mulai,
//       jam_selesai: jamJadwal.jam_selesai,
//       jam_detail: jamDetailList
//         .filter(detail => detail.jamJadwal.id === jamJadwal.id) // Filter by current jamJadwal ID
//         .map(detail => ({
//           id: detail.id,
//           nama_mapel: detail.mapel ? detail.mapel.nama_mapel : null,
//           nama_kelas: detail.kelas ? detail.kelas.nama_kelas : null,
//         })),
//     }));
  
//     return this._success('List of JamJadwal', formattedList);
//   }
  

//   //   async update(
//   //     id: number,
//   //     payload: UpdateJamJadwalDto,
//   //   ): Promise<ResponseSuccess> {
//   //     const jamJadwal = await this.jamJadwalRepository.findOne({
//   //       where: {
//   //         id: id,
//   //       },
//   //     });

//   //     if (!jamJadwal) {
//   //       throw new HttpException('Jam Jadwal not found', HttpStatus.NOT_FOUND);
//   //     }

//   //     if (payload.mapel) {
//   //       const mapel = await this.mapelRepository.findOne({
//   //         where: {
//   //           id: payload.mapel,
//   //         },
//   //       });
//   //       if (!mapel) {
//   //         throw new HttpException('Mapel not found', HttpStatus.NOT_FOUND);
//   //       }
//   //       jamJadwal.mapel = mapel;
//   //     }

//   //     if (payload.kelas) {
//   //       const kelas = await this.kelasRepository.findOne({
//   //         where: {
//   //           id: payload.kelas,
//   //         },
//   //       });
//   //       if (!kelas) {
//   //         throw new HttpException('Kelas not found', HttpStatus.NOT_FOUND);
//   //       }
//   //       jamJadwal.kelas = kelas;
//   //     }

//   //     if (payload.jam_mulai) {
//   //       jamJadwal.jam_mulai = payload.jam_mulai;
//   //     }

//   //     if (payload.jam_selesai) {
//   //       jamJadwal.jam_selesai = payload.jam_selesai;
//   //     }

//   //     await this.jamJadwalRepository.save(jamJadwal);
//   //     return this._success('Jam Jadwal updated successfully', jamJadwal);
//   //   }

//   async delete(id: number): Promise<ResponseSuccess> {
//     const jamJadwal = await this.jamJadwalRepository.findOne({
//       where: {
//         id: id,
//       },
//     });

//     if (!jamJadwal) {
//       throw new HttpException('Jam Jadwal not found', HttpStatus.NOT_FOUND);
//     }

//     await this.jamJadwalRepository.remove(jamJadwal);
//     return this._success('Jam Jadwal deleted successfully', jamJadwal);
//   }

//   async deleteBulk(data: number[]): Promise<ResponseSuccess> {
//     const jamJadwals = await this.jamJadwalRepository.findByIds(data);

//     if (jamJadwals.length === 0) {
//       throw new HttpException('Jam Jadwal not found', HttpStatus.NOT_FOUND);
//     }

//     await this.jamJadwalRepository.remove(jamJadwals);
//     return this._success('Jam Jadwal deleted successfully', jamJadwals);
//   }
// }
