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
import { SubjectCodeEntity } from 'src/app/subject_code/subject_code.entity';

@Injectable()
export class GuruService extends BaseResponse {
  constructor(
    @InjectRepository(Guru) private readonly guruRepository: Repository<Guru>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @InjectRepository(SubjectCodeEntity)
    private readonly subjectCodeRepository: Repository<SubjectCodeEntity>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async registerGuru(
    registerGuruDto: RegisterGuruDto,
  ): Promise<ResponseSuccess> {
    const { nama, email, password, mapel, initial_schedule } = registerGuruDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return this._error(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if initial_schedule is unique
    const existingGuru = await this.guruRepository.findOne({
      where: { initial_schedule },
    });
    if (existingGuru) {
      return this._error(
        'Initial schedule already exists',
        HttpStatus.BAD_REQUEST,
      );
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
      return this._error(
        'One or more subjects not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create and save teacher with the same ID as user
    const guru = this.guruRepository.create({
      id: user.id, // Set Guru ID to be the same as User ID
      user,
      mapel: mapelEntities,
      initial_schedule,
    });
    const savedGuru = await this.guruRepository.save(guru);

    // Generate and save subject codes based on initial_schedule
    const subjectCodes = mapelEntities.map((subject, index) => {
      return this.subjectCodeRepository.create({
        code: `${initial_schedule}${index + 1}`,
        guru: savedGuru,
        mapel: subject,
      });
    });
    await this.subjectCodeRepository.save(subjectCodes);

    return this._success('Teacher registered successfully', savedGuru);
  }

  async updateGuru(
    id: number,
    updateGuruDto: UpdateGuruDto,
  ): Promise<ResponseSuccess> {
    const { avatar, nomor_hp, mapel, nama } = updateGuruDto;

    // Find the teacher by ID
    const guru = await this.guruRepository.findOne({
      where: { id },
      relations: ['user', 'mapel'],
    });

    if (!guru) {
      throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    }

    // Update user details
    guru.user.nama = nama ?? guru.user.nama;
    guru.user.avatar = avatar ?? guru.user.avatar;
    guru.user.nomor_hp = nomor_hp ?? guru.user.nomor_hp;

    // If mapel is provided, update the associated mapel entities
    if (mapel && mapel.length > 0) {
      const mapelEntities = await this.mapelRepository.findBy({
        id: In(mapel),
      });

      if (mapelEntities.length !== mapel.length) {
        return this._error(
          'One or more subjects not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update the guru's mapel associations
      guru.mapel = mapelEntities;

      // Generate and save subject codes based on initial_schedule
      // First, delete existing subject codes for the guru
      await this.subjectCodeRepository.delete({ guru: { id } });

      const subjectCodes = mapelEntities.map((subject, index) => {
        return this.subjectCodeRepository.create({
          code: `${guru.initial_schedule}${index + 1}`,
          guru,
          mapel: subject,
        });
      });

      await this.subjectCodeRepository.save(subjectCodes);
    }

    // Save updated teacher
    const updatedGuru = await this.guruRepository.save(guru);
    await this.userRepository.save(guru.user); // Save user details as well

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

    return this._success(
      `Successfully deleted ${berhasil} teachers, failed to delete ${gagal}`,
    );
  }

  async getGuruList(): Promise<ResponseSuccess> {
    const guruList = await this.guruRepository.find({
      relations: ['user', 'mapel'],
    });

    return this._success('List of teachers retrieved successfully', guruList);
  }

  async getGuruListWithSubject(): Promise<ResponseSuccess> {
    // Fetch the list of teachers with their associated mapel
    const guruList = await this.guruRepository.find({
      relations: ['user', 'mapel'],
    });

    // Format the response to include the subject_code
    const formattedGuruList = guruList.map((guru) => {
      // Extract initial_schedule and mapel for the current teacher
      const { initial_schedule, mapel } = guru;

      // Map over the subjects to create a formatted list with subject codes
      const formattedMapelList = mapel.map((subject, index) => ({
        id_mapel: subject.id,
        nama_mapel: subject.nama_mapel,
        status_mapel: subject.status_mapel,
        subject_code: `${initial_schedule}${index + 1}`,
      }));

      // Return the teacher object with formatted mapel
      return {
        id: guru.id,
        initial_schedule: guru.initial_schedule,
        nama: guru.user.nama,
        email: guru.user.email,
        mapel: formattedMapelList,
        created_at: guru.user.created_at,
        updated_at: guru.user.updated_at,
      };
    });

    // Sort the formatted list by initial_schedule alphabetically
    const sortedGuruList = formattedGuruList.sort((a, b) => {
      // Compare initial_schedule values
      if (a.initial_schedule < b.initial_schedule) return -1;
      if (a.initial_schedule > b.initial_schedule) return 1;
      return 0;
    });

    return this._success(
      'List of teachers retrieved successfully',
      sortedGuruList,
    );
  }

  async getGuruDetailWithSubject(id: number): Promise<ResponseSuccess> {
    // Fetch the teacher with their associated user and mapel
    const guru = await this.guruRepository.findOne({
      where: { id },
      relations: ['user', 'mapel'],
    });

    if (!guru) {
      throw new HttpException('Teacher not found', HttpStatus.NOT_FOUND);
    }

    // Extract initial_schedule and mapel for the teacher
    const { initial_schedule, mapel } = guru;

    // Map over the subjects to create a formatted list with subject codes
    const formattedMapelList = mapel.map((subject, index) => ({
      id_mapel: subject.id,
      nama_mapel: subject.nama_mapel,
      status_mapel: subject.status_mapel,
      subject_code: `${initial_schedule}${index + 1}`,
    }));

    // Return the teacher object with formatted mapel
    const formattedGuru = {
      id: guru.id,
      initial_schedule: guru.initial_schedule,
      nama: guru.user.nama,
      email: guru.user.email,
      mapel: formattedMapelList,
      created_at: guru.user.created_at,
      updated_at: guru.user.updated_at,
    };

    return this._success(
      'Teacher detail retrieved successfully',
      formattedGuru,
    );
  }

  async getGuruProfile(): Promise<ResponseSuccess> {
    const guru = await this.guruRepository.findOne({
      where: { user: { id: this.req.user.id } },
      relations: ['user.guru', 'mapel', 'jadwal_detail'],
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
      mapel: mapel.map((m) => m.id), // Array of mapel IDs
      created_at: user.created_at,
      updated_at: user.updated_at,
      jadwal_detail_id: guru.jadwal_detail.id,
    };

    return this._success(
      'Teacher details retrieved successfully',
      teacherDetail,
    );
  }
}
