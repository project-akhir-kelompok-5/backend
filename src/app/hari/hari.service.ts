// src/app/hari/hari.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hari } from './hari.entity';
import { ResponseSuccess } from 'src/interface/respone';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class HariService extends BaseResponse {
  constructor(
    @InjectRepository(Hari)
    private readonly hariRepository: Repository<Hari>,
  ) {
    super();
  }

  async createBulk(): Promise<Hari[]> {
    // Daftar nama hari dari Senin sampai Sabtu
    const hariNames = [
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
      'Minggu',
    ];

    // Membuat array objek Hari
    const hariEntities = hariNames.map((name) =>
      this.hariRepository.create({ nama_hari: name }),
    );

    // Menyimpan semua entitas Hari ke database
    return await this.hariRepository.save(hariEntities);
  }

  async list(): Promise<ResponseSuccess> {
    // Fetch all Hari entities from the database
    const hariList = await this.hariRepository.find();

    // Return a success response
    return this._success('Hari list fetched successfully', hariList);
  }
}
