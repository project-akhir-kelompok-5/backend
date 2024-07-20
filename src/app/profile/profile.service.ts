import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { User } from '../auth/auth.entity';
import { ResponseSuccess } from 'src/interface/respone';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './profile.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ProfileService extends BaseResponse {
  constructor(
    @InjectRepository(User)
    private readonly profileRepository: Repository<User>,
  ) {
    super();
  }

  async updateProfile(
    id: any,
    payload: UpdateProfileDto,
  ): Promise<ResponseSuccess> {
    const update = await this.profileRepository.save({
      nama: payload.nama,
      avatar: payload.avatar,
      id: id,
    });

    return this._success('Update Success', update);
  }
}
