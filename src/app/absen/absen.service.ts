import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Absen, Status } from './absen.entity';
import { CreateAbsenDto, UpdateAbsenDto } from './absen.dto';
import { Jadwal } from '../jadwal/jadwal.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { REQUEST } from '@nestjs/core';
import { User } from '../auth/auth.entity';
import { Role } from '../auth/roles.enum';

@Injectable()
export class AbsenService extends BaseResponse {
  constructor(
    @InjectRepository(Absen)
    private readonly absenRepository: Repository<Absen>,
    @InjectRepository(Jadwal)
    private readonly jadwalRepository: Repository<Jadwal>,
    @InjectRepository(User) // Inject User repository
    private readonly userRepository: Repository<User>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  // async create(jadwal_id: number): Promise<ResponseSuccess> {
  //   const jadwal = await this.jadwalRepository.findOne({ where: { id: jadwal_id } });
  //   if (!jadwal) {
  //     throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
  //   }
  
  //   const currentTime = new Date();
  //   const currentDay = currentTime.getDay();
  //   const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  //   const currentDayName = days[currentDay];
  
  //   // Validate if current day matches the scheduled day
  //   if (currentDayName !== jadwal.hari) {
  //     throw new HttpException('Tidak bisa absen pada hari ini karena jadwal tidak sesuai', HttpStatus.FORBIDDEN);
  //   }
  
  //   const user = await this.userRepository.findOne({
  //     where: { id: this.req.user.id },
  //     relations: ['siswa'], // Ensure class information is loaded
  //   });
  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }
  
  //   // Check if the user has already logged attendance for the given schedule
  //   const existingAbsen = await this.absenRepository.findOne({
  //     where: {
  //       jadwal: { id: jadwal_id },
  //       user: { id: user.id },
  //     },
  //   });
  
  //   if (existingAbsen) {
  //     return this._error('Anda sudah absen untuk jadwal ini', HttpStatus.BAD_REQUEST);
  //   }
  
  //   let status = Status.HADIR;
  
  //   if (currentDayName === jadwal.hari) {
  //     const [startHours, startMinutes] = jadwal.jam_mulai.split(':').map(Number);
  //     const [endHours, endMinutes] = jadwal.jam_selesai.split(':').map(Number);
  
  //     const scheduleStartTime = new Date(currentTime);
  //     scheduleStartTime.setHours(startHours, startMinutes, 0, 0);
  
  //     const scheduleEndTime = new Date(currentTime);
  //     scheduleEndTime.setHours(endHours, endMinutes, 0, 0);
  
  //     const attendanceTime = currentTime.getTime();
  
  //     if (attendanceTime > scheduleEndTime.getTime()) {
  //       status = Status.ALPHA;
  //     } else if (attendanceTime > scheduleStartTime.getTime() + 15 * 60 * 1000) {
  //       status = Status.TELAT;
  //     }
  //   }
  
  //   if (user.role === Role.Murid) {
  //     // Check if a teacher has already marked attendance for the given jadwal
  //     const absensiGuru = await this.absenRepository.findOne({
  //       where: {
  //         jadwal: { id: jadwal_id },
  //         user: { role: Role.GURU },
  //       },
  //     });
  
  //     if (!absensiGuru) {
  //       throw new HttpException('Tidak bisa absen karena tidak ada guru yang absen', HttpStatus.FORBIDDEN);
  //     }
  //   }
  
  //   const hasilJurnalKegiatan = user.role === Role.Murid ? '' : 'belum ada';
  
  //   const absen = this.absenRepository.create({
  //     jadwal: {
  //       id: jadwal.id,
  //       hari: jadwal.hari,
  //       jam_mulai: jadwal.jam_mulai,
  //       jam_selesai: jadwal.jam_selesai,
  //     },
  //     user: {
  //       id: user.id,
  //       nama: user.nama,
  //       role: user.role,
  //     },
  //     waktu_absen: currentTime,
  //     status,
  //     hasil_jurnal_kegiatan: hasilJurnalKegiatan,
  //   });
  
  //   await this.absenRepository.save(absen);
  //   return this._success('Absensi Berhasil', absen);
  // }
  
  
  async findAll(query: any): Promise<ResponseSuccess> {
    const { role, jadwal_id } = query;
    
    const where: any = {};
    if (role) where.user = { role };
    if (jadwal_id) where.jadwal = { id: jadwal_id };
    
    const absenList = await this.absenRepository.find({
      where,
      relations: ['jadwal', 'jadwal.mapel', 'jadwal.kelas', 'user'],
    });

    return this._success('Filtered Attendance List', absenList);
  }

  // async logExit(jadwal_id: number, hasil_jurnal_kegiatan: string): Promise<ResponseSuccess> {
  //   const jadwal = await this.jadwalRepository.findOne({ where: { id: jadwal_id } });
  //   if (!jadwal) {
  //     throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
  //   }
  
  //   const currentTime = new Date();
  //   const [endHours, endMinutes] = jadwal.jam_selesai.split(':').map(Number);
  
  //   const scheduleEndTime = new Date(currentTime);
  //   scheduleEndTime.setHours(endHours, endMinutes, 0, 0);
  
  //   let warning = '';
  //   if (currentTime.getTime() > scheduleEndTime.getTime()) {
  //     warning = 'Peringatan: Waktu keluar melebihi jadwal!';
  //   }
  
  //   const user = await this.userRepository.findOne({ where: { id: this.req.user.id } });
  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }
  
  //   const existingAbsen = await this.absenRepository.findOne({
  //     where: {
  //       jadwal: { id: jadwal_id },
  //       user: { id: user.id },
  //       hasil_jurnal_kegiatan: Not('belum ada') // Check if exit has already been logged
  //     }
  //   });
  
  //   if (existingAbsen) {
  //     return this._error('Anda sudah keluar dari absensi', HttpStatus.BAD_REQUEST);
  //   }
  
  //   const absen = await this.absenRepository.findOne({
  //     where: {
  //       jadwal: { id: jadwal_id },
  //       user: { id: user.id }
  //     },
  //     order: { waktu_absen: 'DESC' }
  //   });
  
  //   if (!absen) {
  //     throw new HttpException('No attendance found for this schedule', HttpStatus.NOT_FOUND);
  //   }
  
  //   absen.hasil_jurnal_kegiatan = hasil_jurnal_kegiatan || warning;
  
  //   await this.absenRepository.save(absen);
  //   return this._success('Berhasil keluar dari absen', { ...absen, warning });
  // }  

  async update(id: number, updateAbsenDto: UpdateAbsenDto): Promise<ResponseSuccess> {
    const absen = await this.absenRepository.findOne({
      where: { id },
      relations: ['jadwal', 'user'],
    });

    if (!absen) {
      throw new HttpException('Attendance not found', HttpStatus.NOT_FOUND);
    }

    if (updateAbsenDto.jadwal) {
      const jadwal = await this.jadwalRepository.findOne({ where: { id: updateAbsenDto.jadwal } });
      if (!jadwal) {
        throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
      }
      // absen.jadwal = jadwal;
    }

    await this.absenRepository.save(absen);
    return this._success('Attendance updated successfully', absen);
  }

  async delete(id: number): Promise<ResponseSuccess> {
    const absen = await this.absenRepository.findOne({ where: { id } });

    if (!absen) {
      throw new HttpException('Attendance not found', HttpStatus.NOT_FOUND);
    }

    await this.absenRepository.remove(absen);
    return this._success('Attendance deleted successfully', absen);
  }
}
