import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Absen, Status } from './absen.entity';
import { CreateAbsenDto, FilterAbsenDto, UpdateAbsenDto } from './absen.dto';
import { Jadwal } from '../jadwal/jadwal.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { REQUEST } from '@nestjs/core';
import { User } from '../auth/auth.entity';
import { Role } from '../auth/roles.enum';
import { AbsenGateway } from './absen.gateway';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';
import { Kelas } from '../kelas/kelas.entity';

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
    private readonly absenGateway: AbsenGateway,
    @InjectRepository(JamJadwal)
    private readonly jamJadwalRepository: Repository<JamJadwal>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {
    super();
  }

  async testSocket(): Promise<ResponseSuccess> {
    let counters = 0; // Increment the counter

    const testMessage = { message: 'tai', counter: counters++ };
    this.absenGateway.server.emit('asu', testMessage);
    return this._success('Test message emitted successfully', testMessage);
  }

  async createAbsen(createAbsenDto: { jam_detail: number }): Promise<ResponseSuccess> {
    const { jam_detail } = createAbsenDto;
  
    const jamDetail = await this.jamDetailJadwalRepository.findOne({
      where: { id: jam_detail },
      relations: ['jamJadwal', 'jamJadwal.jadwal', 'mapel', 'kelas'],
    });
  
    if (!jamDetail) {
      throw new HttpException('Jam Detail Jadwal not found', HttpStatus.NOT_FOUND);
    }
  
    const jamJadwal = jamDetail.jamJadwal;
    const jadwal = jamJadwal.jadwal;
  
    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }
  
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = days[currentDay];
  
    // if (currentDayName !== jadwal.hari) {
    //   throw new HttpException(
    //     'Tidak bisa absen pada hari ini karena jadwal tidak sesuai',
    //     HttpStatus.FORBIDDEN,
    //   );
    // }
  
    const user = await this.userRepository.findOne({
      where: { id: this.req.user.id },
    });
  
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    const existingAbsen = await this.absenRepository.findOne({
      where: {
        jadwal: { id: jadwal.id },
        user: { id: user.id },
        jamJadwal: { id: jamJadwal.id },
        jamDetailJadwal: { id: jamDetail.id },
      },
    });
  
    if (existingAbsen) {
      return this._error('Anda sudah absen untuk jadwal ini', HttpStatus.BAD_REQUEST);
    }
  
    let status = Status.HADIR;
    const [startHours, startMinutes] = jamJadwal.jam_mulai.split(':').map(Number);
    const [endHours, endMinutes] = jamJadwal.jam_selesai.split(':').map(Number);
  
    const scheduleStartTime = new Date(currentTime);
    scheduleStartTime.setHours(startHours, startMinutes, 0, 0);
  
    const scheduleEndTime = new Date(currentTime);
    scheduleEndTime.setHours(endHours, endMinutes, 0, 0);
  
    const attendanceTime = currentTime.getTime();
  
    if (attendanceTime > scheduleEndTime.getTime()) {
      status = Status.ALPHA;
    } else if (attendanceTime > scheduleStartTime.getTime() + 15 * 60 * 1000) {
      status = Status.TELAT;
    }
  
    const hasilJurnalKegiatan = user.role === Role.GURU ? 'belum ada' : '';
  
    const absen = this.absenRepository.create({
      jadwal: { id: jadwal.id },
      user: { id: user.id },
      jamJadwal: { id: jamJadwal.id },
      jamDetailJadwal: { id: jamDetail.id },
      waktu_absen: currentTime,
      status,
      hasil_jurnal_kegiatan: hasilJurnalKegiatan,
    });
  
    await this.absenRepository.save(absen);
  
    this.absenGateway.broadcastUpdate(absen);
  
    const message = `Berhasil absen pada jam ${jamJadwal.jam_mulai} - ${jamJadwal.jam_selesai}, hari ${jadwal.hari}, kelas ${jamDetail.kelas.nama_kelas}, dan mapel ${jamDetail.mapel.nama_mapel}`;
    return this._success(message, absen);
  }
  

  async listFilterKelas(jamDetailJadwalId: number): Promise<ResponseSuccess> {
    let absens;
  
    if (jamDetailJadwalId) {
      absens = await this.absenRepository.find({
        where: { jamDetailJadwal: { id: jamDetailJadwalId } },
        relations: [
          'jadwal',
          'user',
          'user.kelas',
          'jamJadwal',
          'jamDetailJadwal',
          'jamDetailJadwal.mapel',
          'jamDetailJadwal.kelas',
        ],
      });
    } else {
      absens = await this.absenRepository.find({
        relations: [
          'jadwal',
          'user',
          'user.kelas',
          'jamJadwal',
          'jamDetailJadwal',
          'jamDetailJadwal.mapel',
          'jamDetailJadwal.kelas',
        ],
      });
    }
  
    // Get all students in the relevant class
    const jamDetailJadwal = await this.jamDetailJadwalRepository.findOne({
      where: { id: jamDetailJadwalId },
      relations: ['kelas', 'kelas.user', 'kelas.user.siswa'],
    });
  
    if (!jamDetailJadwal) {
      throw new HttpException(
        'Jam Detail Jadwal not found',
        HttpStatus.NOT_FOUND,
      );
    }
  
    const kelasList = await this.kelasRepository.findOne({
      where: { id: jamDetailJadwal.kelas.id },
      relations: ['siswa', 'siswa.user', 'siswa'],
    });
  
    const allStudents = jamDetailJadwal.kelas.user;
  
    const groupedData = absens.reduce((acc, absen) => {
      const key = `${absen.jamDetailJadwal.id}`;
      if (!acc[key]) {
        acc[key] = {
          id: absen.jamDetailJadwal.id,
          mapel: absen.jamDetailJadwal.mapel.nama_mapel,
          kelas: absen.jamDetailJadwal.kelas.nama_kelas,
          hari: absen.jadwal.hari,
          jam_mulai: absen.jamJadwal.jam_mulai,
          jam_selesai: absen.jamJadwal.jam_selesai,
          hasil_jurnal_kegiatan: absen.hasil_jurnal_kegiatan,
          jumlah_siswa: kelasList.siswa.length,
          jumlah_hadir: 0,
          jumlah_belum_absen: kelasList.siswa.length,
          jumlah_sakit: 0,
          jumlah_alpha: 0,
          siswa_hadir: [],
          siswa_izin: [],
          siswa_alpha: [],
        };
      }
  
      switch (absen.status) {
        case 'Hadir':
          acc[key].jumlah_hadir += 1;
          acc[key].siswa_hadir.push({
            id: absen.user.id,
            nama: absen.user.nama,
            status: absen.status,
            role: absen.user.role,
            waktu_absen: absen.waktu_absen,
          });
          break;
        case 'Sakit':
          acc[key].jumlah_sakit += 1;
          acc[key].siswa_izin.push({
            id: absen.user.id,
            nama: absen.user.nama,
            status: absen.status,
            role: absen.user.role,
            waktu_absen: absen.waktu_absen,
          });
          break;
        case 'Alpha':
          acc[key].jumlah_alpha += 1;
          acc[key].siswa_alpha.push({
            id: absen.user.id,
            nama: absen.user.nama,
            status: absen.status,
            role: absen.user.role,
            waktu_absen: absen.waktu_absen,
          });
          break;
      }
  
      return acc;
    }, {});
  
    if (Object.keys(groupedData).length === 0) {
      const defaultData = {
        message: 'Belum ada yang absen',
        jumlah_siswa: kelasList.siswa.length,
      };
  
      return this._success('Filtered Attendance List', [defaultData]);
    } else {
      for (const key in groupedData) {
        const absenStudents = groupedData[key].siswa_hadir.concat(
          groupedData[key].siswa_izin,
          groupedData[key].siswa_alpha,
        );
        const absenStudentIds = new Set(
          absenStudents.map((student) => student.id),
        );
  
        allStudents.forEach((student) => {
          if (!absenStudentIds.has(student.id)) {
            groupedData[key].jumlah_alpha += 1;
            groupedData[key].siswa_alpha.push({
              id: student.id,
              nama: student.nama,
              status: 'Alpha',
              role: student.role,
              waktu_absen: null,
            });
          }
        });
  
        // Update jumlah_belum_absen
        groupedData[key].jumlah_belum_absen =
          groupedData[key].jumlah_siswa -
          (groupedData[key].jumlah_hadir +
            groupedData[key].jumlah_sakit +
            groupedData[key].jumlah_alpha);
      }
    }
  
    const data = Object.values(groupedData);
  
    return this._success('Filtered Attendance List', data);
  }
  

  async list(): Promise<ResponseSuccess> {
    const absens = await this.absenRepository.find({
      relations: [
        'jadwal',
        'user',
        'jamJadwal',
        'jamDetailJadwal',
        'jamDetailJadwal.mapel',
        'jamDetailJadwal.kelas',
      ],
    });

    const data = absens.map((absen) => ({
      id: absen.id,
      nama: absen.user.nama,
      waktu_absen: absen.waktu_absen,
      status: absen.status,
      hasil_jurnal_kegiatan: absen.hasil_jurnal_kegiatan,
      hari: absen.jadwal.hari,
      jam_mulai: absen.jamJadwal.jam_mulai,
      jam_selesai: absen.jamJadwal.jam_selesai,
      mapel: absen.jamDetailJadwal.mapel.nama_mapel,
      kelas: absen.jamDetailJadwal.kelas.nama_kelas,
      role: absen.user.role,
    }));

    return this._success('Filtered Attendance List', data);
  }

  async update(
    id: number,
    updateAbsenDto: UpdateAbsenDto,
  ): Promise<ResponseSuccess> {
    const absen = await this.absenRepository.findOne({
      where: { id },
      relations: ['jadwal', 'user'],
    });

    if (!absen) {
      throw new HttpException('Attendance not found', HttpStatus.NOT_FOUND);
    }

    // if (updateAbsenDto.jadwal) {
    //   const jadwal = await this.jadwalRepository.findOne({
    //     where: { id: updateAbsenDto.jadwal },
    //   });
    //   if (!jadwal) {
    //     throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    //   }
    //   // absen.jadwal = jadwal;
    // }

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
