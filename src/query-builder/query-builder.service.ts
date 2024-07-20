import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/app/auth/auth.entity';
import BaseResponse from 'src/utils/response/base.response';
import { Repository } from 'typeorm';
import { latihanQueryBuilderDto } from './query-builder.dto';

@Injectable()
export class QueryBuilderService extends BaseResponse {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async latihan(query: latihanQueryBuilderDto) {
    const { nama,  role} = query;
    const queryBuilder = await this.userRepository.createQueryBuilder('user');

    if (nama) {
      queryBuilder.where(`user.nama LIKE :nama`, {
        nama: `%${nama}%`,
      });
    }

    if (role) {
      queryBuilder.where(`user.role LIKE :role`, {
        role: `%${role}%`,
      });
    }

    const result = await queryBuilder.getOne();

    return this._success(`Total data: ${await queryBuilder.getCount()}`, result);
  }
  // async latihan2(query: latihanQueryBuilderDto) {
  //   const { nama_produk, stok } = query;
  //   const queryBuilder = await this.produkRepository.createQueryBuilder(
  //     'produk',
  //   );

  //   if (nama_produk) {
  //     queryBuilder.where(`produk.nama_produk LIKE :nama_produk`, {
  //       nama_produk: `%${nama_produk}%`,
  //     });
  //   }

  //   if (stok) {
  //     queryBuilder.andWhere(`produk.stok LIKE :stok`, {
  //       stok: stok,
  //     });
  //   }

  //   queryBuilder
  //     .leftJoin(`produk.created_by`, 'created_by')
  //     .leftJoin(`produk.updated_by`, 'updated_by')
  //     .select([
  //        'produk.id',
  //       'produk.nama_produk',
  //       'produk.stok',
  //       'produk.harga',
  //       'produk.deskripsi_produk',
  //       'created_by.nama',
  //       'updated_by.nama',
  //     ]);

  //   const result = await queryBuilder.getMany();

  //   return this._success('ok', result);
  // }
}