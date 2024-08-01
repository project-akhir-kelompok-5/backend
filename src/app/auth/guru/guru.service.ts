// guru.service.ts

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { In, Repository } from 'typeorm';
import { Guru } from './guru.entity';
import { Mapel } from 'src/app/mapel/mapel.entity';
import { User } from '../auth.entity';
import { RegisterGuruDto, UpdateGuruDto, DeleteBulkGuruDto } from './guru.dto';
import { ResponseSuccess } from 'src/interface/respone';
import { Role } from '../roles.enum';
import { hash } from 'bcrypt';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class GuruService extends BaseResponse {
  constructor(
    @InjectRepository(Guru) private readonly guruRepository: Repository<Guru>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Mapel) private readonly mapelRepository: Repository<Mapel>,
    @Inject(REQUEST) private req: any
  ) {
    super();
  }

  async registerGuru(registerGuruDto: RegisterGuruDto): Promise<ResponseSuccess> {
    const { nama, email, password, mapel } = registerGuruDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return this._error('User with this email already exists', HttpStatus.BAD_REQUEST);
    }

    // Create and save user
    const hashedPassword = await hash(password, 12);
    const user = this.userRepository.create({
      nama,
      email,
      password: hashedPassword,
      role: Role.GURU, // Ensure the role is correctly set
    });
    await this.userRepository.save(user);

    // Find all subjects using the new method
    const mapelEntities = await this.mapelRepository.findBy({
      id: In(mapel),
    });
    if (mapelEntities.length !== mapel.length) {
      return this._error('One or more subjects not found', HttpStatus.BAD_REQUEST);
    }

    // Create and save teacher
    const guru = this.guruRepository.create({
      user,
      mapel: mapelEntities,
    });

    const savedGuru = await this.guruRepository.save(guru);
    return this._success('Teacher registered successfully', savedGuru);
  }

  async updateGuru(id: number, updateGuruDto: UpdateGuruDto): Promise<ResponseSuccess> {
    const { avatar, nomor_hp } = updateGuruDto;

    // Find the teacher by ID
    const guru = await this.guruRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!guru) {
      throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    }

    // Update user details
    guru.user.avatar = avatar ?? guru.user.avatar;
    guru.user.nomor_hp = nomor_hp ?? guru.user.nomor_hp;

    // Save updated teacher
    const updatedGuru = await this.guruRepository.save(guru);
    return this._success('Teacher updated successfully', updatedGuru);
  }

  async deleteGuru(id: number): Promise<ResponseSuccess> {
    const result = await this.guruRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    }

    return this._success('Teacher deleted successfully');
  }

  async deleteBulkGuru(payload: DeleteBulkGuruDto): Promise<ResponseSuccess> {
    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.data.map(async (id) => {
        try {
          const result = await this.guruRepository.delete(id);

          if (result.affected === 1) {
            berhasil += 1;
          } else {
            gagal += 1;
          }
        } catch {
          gagal += 1;
        }
      }),
    );

    return this._success(`Successfully deleted ${berhasil} teachers, failed to delete ${gagal}`);
  }

  async getGuruList(): Promise<ResponseSuccess> {
    const guruList = await this.guruRepository.find({
      relations: ['user', 'mapel'],
    });

    return this._success('List of teachers retrieved successfully', guruList);
  }

  async getGuruListWithSubject(): Promise<ResponseSuccess> {
    const guruList = await this.guruRepository.find({
      relations: ['user', 'mapel'],
      select: {
        user: {
          nama: true,
          
        },
        mapel: {
          nama_mapel: true,
          subject_code: true,
          status_mapel: true
        }
      }
    });

    return this._success('List of teachers retrieved successfully', guruList);
  }

  async getGuruProfile(): Promise<ResponseSuccess> {
    const guru = await this.guruRepository.findOne({
      where: { user: { id: this.req.user.id } },
      relations: ['user', 'mapel'],
    });

    if (!guru) {
      throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    }

    const { user, mapel } = guru;

    const teacherDetail = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      avatar: user.avatar,
      nomor_hp: user.nomor_hp,
      mapel: mapel.map(m => m.id),  // Array of mapel IDs
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return this._success('Teacher details retrieved successfully', teacherDetail);
  }
}
