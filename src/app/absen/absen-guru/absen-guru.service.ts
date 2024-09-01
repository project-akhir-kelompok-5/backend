import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AbsenGuru } from './absen-guru.entity';
import { Guru } from 'src/app/auth/guru/guru.entity';
import { JamDetailJadwal } from 'src/app/jadwal/jam-detail-jadwal.entity';
import { JamJadwal } from 'src/app/jadwal/jam-jadwal.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { Murid } from 'src/app/auth/siswa/siswa.entity';
import { AbsenGateway } from '../absen.gateway';
import { REQUEST } from '@nestjs/core';
import { CreateAbsenGuruDto } from '../absen.dto';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import {
  getMaxWeeksInMonth,
  getMonthRange,
  getWeekNumberInMonth,
  getWeekRange,
  indexToMonthName,
} from 'src/utils/helper function/getWeek';
import { User } from 'src/app/auth/auth.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { calculateDistance } from 'src/utils/validator/location.validator';
import { GeoLocation } from 'src/app/geo-location/geo-location.entity';

@Injectable()
export class AbsenGuruService extends BaseResponse {
  private readonly logger = new Logger(AbsenGuruService.name);
  constructor(
    @InjectRepository(AbsenGuru)
    private readonly absenGuruRepository: Repository<AbsenGuru>,
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
    @InjectRepository(JamJadwal)
    private readonly jamJadwalRepository: Repository<JamJadwal>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(Murid)
    private readonly siswaRepository: Repository<Murid>,
    @InjectRepository(GeoLocation)
    private readonly geoRepository: Repository<GeoLocation>,
    @Inject(REQUEST) private req: any,
    private readonly absenGateway: AbsenGateway,
  ) {
    super();
  }

  async AbsenGuru(
    createAbsenDto: CreateAbsenGuruDto,
  ): Promise<ResponseSuccess> {
    const {
      jam_detail,
      latitude: currentLatitude,
      longitude: currentLongitude,
    } = createAbsenDto;

    const defaultLokasi = await this.geoRepository.findOne({
      where: {
        id: 0,
      },
    });

    const defaultLatitude = defaultLokasi.latitude;
    const defaultLongitude = defaultLokasi.longitude;
    console.log('default lati', defaultLatitude);
    const distance = calculateDistance(
      currentLatitude,
      currentLongitude,
      defaultLatitude,
      defaultLongitude,
    );

    // if (distance > 50) { // Misalkan 50 meter adalah batas jarak yang valid
    //   throw new HttpException('Anda tidak berada di lokasi yang tepat', HttpStatus.FORBIDDEN);
    // }

    const guru = await this.guruRepository.findOne({
      where: { id: this.req.user.id },
      relations: ['jadwal_detail'],
    });

    if (!guru) {
      throw new HttpException('Guru not found', HttpStatus.NOT_FOUND);
    }

    const existingAbsen = await this.absenGuruRepository.findOne({
      where: {
        guru: { id: this.req.user.id },
        jamDetailJadwal: { id: jam_detail },
      },
    });

    if (existingAbsen) {
      throw new HttpException('Guru sudah absen', HttpStatus.CONFLICT);
    }

    const jamDetailJadwal = await this.jamDetailJadwalRepository.findOne({
      relations: ['jamJadwal', 'kelas'],
      where: { id: jam_detail },
    });

    if (!jamDetailJadwal) {
      throw new HttpException(
        'Jam Detail Jadwal not found',
        HttpStatus.NOT_FOUND,
      );
    }

    guru.jadwal_detail = jamDetailJadwal;
    await this.guruRepository.save(guru);

    const jamJadwal = jamDetailJadwal.jamJadwal;
    if (!jamJadwal) {
      throw new HttpException('Jam Jadwal not found', HttpStatus.NOT_FOUND);
    }

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
    } else if (diffInMinutes > 60 || currentTime > jamSelesai) {
      status = 'Alpha';
    }

    const absen = new AbsenGuru();
    absen.guru = guru;
    absen.jamDetailJadwal = jamDetailJadwal;
    absen.status = status;
    absen.waktu_absen = currentTime;

    await this.absenGuruRepository.save(absen);

    await this.guruRepository.update(this.req.user.id, {
      is_absen_today: true,
    });
    // this.absenGateway.server.emit('absenGuru', absen);

    const students = await this.siswaRepository.find({
      where: { kelas: { id: jamDetailJadwal.kelas.id } },
    });

    console.log('ID Jadwal Detail:', jamDetailJadwal.kelas.id);
    console.log('Students:', students);

    for (const tes of students) {
      tes.jamDetailJadwal_id = jamDetailJadwal.id;
      await this.siswaRepository.update(tes.id, tes);
    }

    return this._success('Guru absen successfully', absen.id);
  }

  async getRekapGuru(
    month?: string,
    week?: number,
    mapel?: string,
  ): Promise<ResponseSuccess> {
    const user = await this.userRepository.findOne({
      where: { id: this.req.user.id },
    });

    if (!user) {
      throw new HttpException('Guru not found', HttpStatus.NOT_FOUND);
    }

    const currentDate = new Date();

    // If month is not provided, use the current month
    if (!month) {
      month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    } else {
      month = month.padStart(2, '0'); // Ensure it's in 'MM' format
    }

    // If week is not provided, calculate the current week of the month
    if (!week) {
      week = getWeekNumberInMonth();
    }

    const [startOfMonth, endOfMonth] = getMonthRange(month);
    // const maxWeeks = getMaxWeeksInMonth(month);
    // if (week > maxWeeks) {
    //   week = maxWeeks; // Adjust week to the last valid week
    // }

    // if (week > maxWeeks) {
    //   throw new HttpException(
    //     'Week number exceeds the maximum number of weeks in the month',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const startOfWeek = week ? getWeekRange(month)[0] : startOfMonth;
    const endOfWeek = week ? getWeekRange(month)[1] : endOfMonth;

    console.log('Parameters:', { month, week });
    console.log('Date Range:', { startOfWeek, endOfWeek });

    // Build query conditions
    const whereConditions: any = {
      guru: { id: user.id },
      waktu_absen: Between(startOfWeek, endOfWeek),
    };

    if (mapel) {
      whereConditions.jamDetailJadwal = {
        subject_code: {
          mapel: {
            nama_mapel: mapel,
          },
        },
      };
    }

    const absensi = await this.absenGuruRepository.find({
      where: whereConditions,
      relations: ['jamDetailJadwal', 'jamDetailJadwal.subject_code'],
    });

    console.log('Attendance Records:', absensi);

    const counts = absensi.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      { Hadir: 0, Telat: 0, Alpha: 0 },
    );

    const guru = await this.guruRepository.findOne({
      where: { id: user.id },
      relations: ['user', 'mapel'],
    });

    const formattedMapelList = guru.mapel.map((subject, index) => ({
      id_mapel: subject.id,
      nama_mapel: subject.nama_mapel,
      status_mapel: subject.status_mapel,
      subject_code: `${guru.initial_schedule}${index + 1}`,
    }));

    const monthName = indexToMonthName[parseInt(month, 10) - 1]; // Get month name from index

    const result = {
      id: user.id,
      nama: user.nama,
      month: monthName,
      week: week,
      list_mapel: formattedMapelList,
      data: counts,
    };

    return this._success('Weekly summary fetched successfully', result);
  }
}
