import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { JamDetailJadwal } from 'src/app/jam-jadwal/jam-detail-jadwal.entity';
import { JamJadwal } from 'src/app/jam-jadwal/jam-jadwal.entity';
import { Between, Repository } from 'typeorm';
import { AbsenKelas } from '../absen-kelas/absen-kelas.entity';
import { User } from 'src/app/auth/auth.entity';
import { AbsenSiswa } from './absen-siswa.entity';
import { CreateAbsenSiswaDto } from '../absen.dto';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { map } from 'rxjs';
import { getMaxWeeksInMonth, getWeekRange } from 'src/utils/helper function/getWeek';

@Injectable()
export class AbsenSiswaService extends BaseResponse {
  constructor(
    @InjectRepository(AbsenSiswa)
    private readonly absenSiswaRepository: Repository<AbsenSiswa>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AbsenKelas)
    private readonly absenKelasRepository: Repository<AbsenKelas>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
    @InjectRepository(JamJadwal)
    private readonly jamJadwalRepository: Repository<JamJadwal>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async AbsenSiswa(
    createAbsenSiswaDto: CreateAbsenSiswaDto,
  ): Promise<ResponseSuccess> {
    const { kode_class } = createAbsenSiswaDto;
    const absenKelas = await this.absenKelasRepository.findOne({
      where: { kode_kelas: kode_class },
      relations: [
        'kelas',
        'jamJadwal',
        'jamDetailJadwal',
        'jamDetailJadwal.subject_code',
        'jamDetailJadwal.subject_code.mapel',
        'absenSiswa',
        'absenSiswa.user',
      ],
    });

    if (!absenKelas) {
      throw new HttpException('Class code not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: { id: this.req.user.id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const existingAbsen = await this.absenSiswaRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        absenKelas: { id: absenKelas.id },
      },
    });

    if (existingAbsen) {
      throw new HttpException('Siswa sudah absen', HttpStatus.CONFLICT);
    }

    const jamDetailJadwal = await this.jamDetailJadwalRepository.findOne({
      relations: ['jamJadwal'],
      where: {
        id: absenKelas.jamDetailJadwal.id,
      },
    });

    const jamJadwal = jamDetailJadwal.jamJadwal;
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];
    const jamMulai = new Date(`${currentDate}T${jamJadwal.jam_mulai}`);
    const jamSelesai = new Date(`${currentDate}T${jamJadwal.jam_selesai}`);

    if (currentTime < jamMulai || currentTime > jamSelesai) {
      throw new HttpException(
        'Anda tidak bisa absen karena belum waktunya',
        HttpStatus.BAD_REQUEST,
      );
    }

    let status = 'Hadir';
    const diffInMinutes = Math.floor(
      (currentTime.getTime() - jamMulai.getTime()) / 60000,
    );

    if (diffInMinutes > 15 && diffInMinutes <= 60) {
      status = 'Telat';
    } else if (
      diffInMinutes > 60 ||
      currentTime.getTime() > jamSelesai.getTime()
    ) {
      status = 'Alpha';
    }

    const absenSiswa = new AbsenSiswa();
    absenSiswa.user = user;
    absenSiswa.absenKelas = absenKelas;
    absenSiswa.status = status;
    absenSiswa.waktu_absen = currentTime;
    absenSiswa.jamDetailJadwal = absenKelas.jamDetailJadwal;

    await this.absenSiswaRepository.save(absenSiswa);

    return this._success('Siswa absen successfully', absenSiswa);
  }

  async getWeeklySummary(
    month: string,
    week: number,
    mapel: string,
  ): Promise<ResponseSuccess> {
    const user = await this.userRepository.findOne({
      where: { id: this.req.user.id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Validate the week number
    const [startOfWeek, endOfWeek] = getWeekRange(month, week);
    const maxWeeks = getMaxWeeksInMonth(month);

    if (week > maxWeeks) {
      throw new HttpException(
        'Week number exceeds the maximum number of weeks in the month',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log('Date Range:', startOfWeek, endOfWeek);

    const absensi = await this.absenSiswaRepository.find({
      where: {
        user: { id: user.id },
        waktu_absen: Between(startOfWeek, endOfWeek),
        jamDetailJadwal: {
          subject_code: {
            mapel: {
              nama_mapel: mapel,
            },
          },
        },
      },
    });

    console.log('Attendance Records:', absensi);

    const counts = absensi.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      { Hadir: 0, Telat: 0, Alpha: 0 },
    );

    const result = {
      id: user.id,
      nama: user.nama,
      month,
      week,
      data: counts,
    };

    return this._success('Weekly summary fetched successfully', result);
  }

  
}
