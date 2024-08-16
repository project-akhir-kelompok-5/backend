import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RekapAbsen } from './rekap-absen.entity';
import { Between, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';

@Injectable()
export class RekapAbsenService extends BaseResponse {
  constructor(
    @InjectRepository(RekapAbsen)
    private readonly rekapAbsenRepository: Repository<RekapAbsen>,
  ) {
    super();
  }

  async getRekapMingguan(
    startDate: Date,
    endDate: Date,
  ): Promise<ResponseSuccess> {
    const result = await this.rekapAbsenRepository.find({
      where: {
        tanggal: Between(startDate, endDate),
      },
    });
    return this._success('Oke', result);
  }

  async getRekapBulanan(year: number, month: number): Promise<ResponseSuccess> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    const hasil = await this.rekapAbsenRepository.find({
      where: {
        tanggal: Between(startDate, endDate),
      },
    });
    return this._success('Oke', hasil);
  }

  async rekapSiswa(startDate: Date, endDate: Date): Promise<ResponseSuccess> {
    // Query to get weekly/monthly report for siswa
    // This should include aggregation and counting based on `siswa_id`
    // Example:
    const result = await this.rekapAbsenRepository
      .createQueryBuilder('rekap')
      .select('rekap.siswa_id', 'siswa_id')
      .addSelect('COUNT(*)', 'total_absen')
      .where('rekap.tanggal BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('rekap.type = :type', { type: 'siswa' })
      .groupBy('rekap.siswa_id')
      .getRawMany();
    return this._success('Oke', result);
  }

  async rekapGuru(startDate: Date, endDate: Date): Promise<ResponseSuccess> {
    // Query to get weekly/monthly report for guru
    // This should include aggregation and counting based on `guru_id`
    // Example:
    const result = await this.rekapAbsenRepository
      .createQueryBuilder('rekap')
      .select('rekap.guru_id', 'guru_id')
      .addSelect('COUNT(*)', 'total_absen')
      .where('rekap.tanggal BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('rekap.type = :type', { type: 'guru' })
      .groupBy('rekap.guru_id')
      .getRawMany();

    return this._success('Oke', result);
  }
}
