import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectCodeEntity } from './subject_code.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class SubjectCodeService extends BaseResponse {
  constructor(
    @InjectRepository(SubjectCodeEntity)
    private readonly subjectCodeRepository: Repository<SubjectCodeEntity>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async findAll(): Promise<ResponseSuccess> {
    const data = await this.subjectCodeRepository.find({
      relations: ['guru.user', 'mapel'],
    });

    // Map the data to match the required format
    const formattedData = data.map((subject) => ({
      id: subject.id,
      nama_mapel: subject.mapel.nama_mapel, // Adjust these properties based on your entity
      status_mapel: subject.mapel.status_mapel,
      subject_code: subject.code,
      nama_guru: subject.guru.user.nama,
    }));

    return {
      status: 'success',
      message: 'List of Subject retrieved successfully',
      data: formattedData,
    };
  }
}
