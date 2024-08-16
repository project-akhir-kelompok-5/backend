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
import { JamDetailJadwal } from 'src/app/jam-jadwal/jam-detail-jadwal.entity';
import { JamJadwal } from 'src/app/jam-jadwal/jam-jadwal.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { Murid } from 'src/app/auth/siswa/siswa.entity';
import { AbsenGateway } from '../absen.gateway';
import { REQUEST } from '@nestjs/core';
import { CreateAbsenGuruDto } from '../absen.dto';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import {
  getMaxWeeksInMonth,
  getWeekRange,
} from 'src/utils/helper function/getWeek';
import { User } from 'src/app/auth/auth.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

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
    @Inject(REQUEST) private req: any,
    private readonly absenGateway: AbsenGateway,
  ) {
    super();
  }

  async AbsenGuru(
    createAbsenDto: CreateAbsenGuruDto,
  ): Promise<ResponseSuccess> {
    const { jam_detail } = createAbsenDto;

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
    absen.jadwal = jamJadwal.jadwal;
    absen.jamJadwal = jamJadwal;
    absen.status = status;
    absen.waktu_absen = currentTime;

    await this.absenGuruRepository.save(absen);
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

  async getWeeklySummary(
    month: string,
    week: number,
    mapel: string,
  ): Promise<ResponseSuccess> {
    const user = await this.userRepository.findOne({
      where: { id: this.req.user.id },
    });

    if (!user) {
      throw new HttpException('Guru not found', HttpStatus.NOT_FOUND);
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

    // Filter absensi berdasarkan jamDetailJadwalId jika disediakan
    const absensi = await this.absenGuruRepository.find({
      where: {
        guru: { id: user.id },
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

    const result = {
      id: user.id,
      nama: user.nama,
      month,
      week,
      list_mapel: formattedMapelList,
      data: counts,
    };

    return this._success('Weekly summary fetched successfully', result);
  }

  
}
