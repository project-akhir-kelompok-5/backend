// src/app/jadwal/jadwal.service.ts
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Jadwal } from './jadwal.entity';
import {
  CreateJadwalDto,
  // CreateJamDto,
  FindAllJadwalDTO,
  UpdateJadwalDto,
} from './jadwal.dto';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';
import { REQUEST } from '@nestjs/core';
import { JamJadwal } from './jam-jadwal.entity';
import { JamDetailJadwal } from './jam-detail-jadwal.entity';
import { SubjectCodeEntity } from '../subject_code/subject_code.entity';
import { User } from '../auth/auth.entity';
import { Murid } from '../auth/siswa/siswa.entity';
import {
  getTodayDayNames,
  isCurrentTimeBetween,
} from 'src/utils/helper function/getDay';
import { Guru } from '../auth/guru/guru.entity';
import { AbsenGuru } from '../absen/absen-guru/absen-guru.entity';
import { AbsenSiswa } from '../absen/absen-siswa/absen-siswa.entity';
import { AbsenKelas } from '../absen/absen-kelas/absen-kelas.entity';

@Injectable()
export class JadwalService extends BaseResponse {
  constructor(
    @InjectRepository(Jadwal)
    private readonly jadwalRepository: Repository<Jadwal>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Murid)
    private readonly siswaRepository: Repository<Murid>,
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
    @InjectRepository(Mapel)
    private readonly mapelRepository: Repository<Mapel>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
    @InjectRepository(AbsenGuru)
    private readonly absenGuruRepository: Repository<AbsenGuru>,
    @InjectRepository(AbsenSiswa)
    private readonly absenSiswaRepository: Repository<AbsenSiswa>,
    @InjectRepository(AbsenKelas)
    private readonly absenKelasRepository: Repository<AbsenKelas>,
    @InjectRepository(SubjectCodeEntity)
    private readonly subjectCodeRepository: Repository<SubjectCodeEntity>,
    @InjectRepository(JamJadwal)
    private readonly jamJadwalRepository: Repository<JamJadwal>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async getCurrentJamDetailUser(): Promise<ResponseSuccess> {
    const todayDayName = getTodayDayNames();
    const jadwalList = await this.jadwalRepository.find({
      where: {
        hari: {
          nama_hari: todayDayName,
        },
      },
      relations: [
        'hari',
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.kelas',
        'jam_jadwal.jam_detail.subject_code.mapel',
        'jam_jadwal.jam_detail.subject_code.guru',
      ],
    });

    const user = await this.findUserByRole(this.req.user.id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];

    const todaysSchedules = jadwalList
      .flatMap((jadwal) =>
        jadwal.jam_jadwal.map((jamJadwal) => ({
          jamJadwal,
          jamDetail: this.findJamDetail(jamJadwal.jam_detail, user),
        })),
      )
      .filter((item) => item.jamDetail);

    todaysSchedules.sort((a, b) => {
      const jamMulaiA = new Date(`${currentDate}T${a.jamJadwal.jam_mulai}`);
      const jamMulaiB = new Date(`${currentDate}T${b.jamJadwal.jam_mulai}`);
      return jamMulaiA.getTime() - jamMulaiB.getTime();
    });

    const allSchedulesDone = this.checkIfAllSchedulesDone(
      todaysSchedules,
      currentTime,
      currentDate,
    );

    for (const schedule of todaysSchedules) {
      const jamMulai = new Date(
        `${currentDate}T${schedule.jamJadwal.jam_mulai}`,
      );
      const jamSelesai = new Date(
        `${currentDate}T${schedule.jamJadwal.jam_selesai}`,
      );

      if (currentTime >= jamMulai && currentTime <= jamSelesai) {
        const { isAbsen, isMasukKelas } = await this.getAbsenStatus(
          schedule,
          user,
        );

        return this._success('Jam detail found successfully', {
          id_user: user.user.id,
          nama_user: user.user.nama,
          role: user.user.role,
          jamDetailId: schedule.jamDetail.id,
          jam_mulai: schedule.jamJadwal.jam_mulai,
          jam_selesai: schedule.jamJadwal.jam_selesai,
          mapel: schedule.jamDetail.subject_code.mapel.nama_mapel,
          kelas: schedule.jamDetail.kelas.nama_kelas,
          is_absen: isAbsen,
          is_masuk_kelas: isMasukKelas,
          is_mulai: true,
          is_jadwal_habis: false,
          is_jadwal_habis_hari_ini: allSchedulesDone,
        });
      }
    }

    if (todaysSchedules.length > 0) {
      const nextSchedule = todaysSchedules[0];
      const isJadwalHabis =
        allSchedulesDone ||
        currentTime >=
          new Date(`${currentDate}T${nextSchedule.jamJadwal.jam_selesai}`);
      const isMulai =
        !isJadwalHabis &&
        currentTime >=
          new Date(`${currentDate}T${nextSchedule.jamJadwal.jam_mulai}`);

      return this._success('Jam detail found successfully', {
        id_user: user.user.id,
        nama_user: user.user.nama,
        role: user.user.role,
        jamDetailId: nextSchedule.jamDetail.id,
        jam_mulai: nextSchedule.jamJadwal.jam_mulai,
        jam_selesai: nextSchedule.jamJadwal.jam_selesai,
        mapel: nextSchedule.jamDetail.subject_code.mapel.nama_mapel,
        kelas: nextSchedule.jamDetail.kelas.nama_kelas,
        is_absen: false,
        is_masuk_kelas: false,
        is_mulai: isMulai,
        is_jadwal_habis: isJadwalHabis,
        is_jadwal_habis_hari_ini: allSchedulesDone,
      });
    }

    throw new HttpException(
      'Jam detail not found for today',
      HttpStatus.NOT_FOUND,
    );
  }

  async getCurrentJamDetailIdSiswa(): Promise<ResponseSuccess> {
    const todayDayName = getTodayDayNames();
    const jadwalList = await this.jadwalRepository.find({
      where: {
        hari: {
          nama_hari: todayDayName,
        },
      },
      relations: [
        'hari',
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.kelas',
        'jam_jadwal.jam_detail.subject_code.mapel',
      ],
    });

    console.log('Jadwal List:', JSON.stringify(jadwalList, null, 2));

    const siswa = await this.siswaRepository.findOne({
      where: {
        id: this.req.user.id,
      },
      relations: ['kelas', 'user'],
    });

    if (!siswa) {
      throw new HttpException('Siswa not found', HttpStatus.NOT_FOUND);
    }

    console.log('Siswa:', JSON.stringify(siswa, null, 2));

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];

    // Mengumpulkan semua jadwal hari ini
    const todaysSchedules = jadwalList
      .flatMap((jadwal) =>
        jadwal.jam_jadwal
          .map((jamJadwal) => ({
            jamJadwal,
            jamDetail: jamJadwal.jam_detail.find(
              (detail) => detail.kelas.id === siswa.kelas.id,
            ),
          }))
          .filter((item) => item.jamDetail),
      )
      .sort((a, b) => {
        const jamMulaiA = new Date(`${currentDate}T${a.jamJadwal.jam_mulai}`);
        const jamMulaiB = new Date(`${currentDate}T${b.jamJadwal.jam_mulai}`);
        return jamMulaiA.getTime() - jamMulaiB.getTime();
      });

    // Mengecek apakah semua jadwal hari ini telah selesai
    const allSchedulesDone = todaysSchedules.every(
      (schedule) => schedule.jamJadwal.allSchedulesDone,
    );

    // Memeriksa apakah ada jadwal aktif atau jadwal berikutnya
    for (const schedule of todaysSchedules) {
      const jamMulai = new Date(
        `${currentDate}T${schedule.jamJadwal.jam_mulai}`,
      );
      const jamSelesai = new Date(
        `${currentDate}T${schedule.jamJadwal.jam_selesai}`,
      );

      if (currentTime >= jamMulai && currentTime <= jamSelesai) {
        const absenSiswa = await this.absenSiswaRepository.findOne({
          relations: ['absenKelas'],
          where: {
            absenKelas: {
              id: schedule.jamDetail.id,
            },
            user: {
              id: this.req.user.id,
            },
          },
        });

        const isAbsen = !!absenSiswa;
        const isMasukKelas = !!absenSiswa;
        const isMulai = !allSchedulesDone && currentTime >= jamMulai;

        return this._success('Jam detail found successfully', {
          nama_user: this.req.user.id,
          jamDetailId: schedule.jamDetail.id,
          jam_mulai: schedule.jamJadwal.jam_mulai,
          jam_selesai: schedule.jamJadwal.jam_selesai,
          mapel: schedule.jamDetail.subject_code.mapel.nama_mapel,
          kelas: schedule.jamDetail.kelas.nama_kelas,
          is_absen: isAbsen,
          is_masuk_kelas: isMasukKelas,
          is_mulai: isMulai,
          is_jadwal_habis: allSchedulesDone,
        });
      }
    }

    if (todaysSchedules.length > 0) {
      const nextSchedule = todaysSchedules[0];
      const isJadwalHabis =
        allSchedulesDone ||
        currentTime >=
          new Date(`${currentDate}T${nextSchedule.jamJadwal.jam_selesai}`);
      const isMulai =
        !isJadwalHabis &&
        currentTime >=
          new Date(`${currentDate}T${nextSchedule.jamJadwal.jam_mulai}`);

      return this._success('Jam detail found successfully', {
        nama_user: siswa.user.nama,
        jamDetailId: nextSchedule.jamDetail.id,
        jam_mulai: nextSchedule.jamJadwal.jam_mulai,
        jam_selesai: nextSchedule.jamJadwal.jam_selesai,
        mapel: nextSchedule.jamDetail.subject_code.mapel.nama_mapel,
        kelas: nextSchedule.jamDetail.kelas.nama_kelas,
        is_absen: false,
        is_masuk_kelas: false,
        is_mulai: isMulai,
        is_jadwal_habis: isJadwalHabis,
      });
    }

    throw new HttpException(
      'Jam detail not found for today',
      HttpStatus.NOT_FOUND,
    );
  }

  async getCurrentJamDetailIdGuru(): Promise<ResponseSuccess> {
    const todayDayName = getTodayDayNames();
    const jadwalList = await this.jadwalRepository.find({
      where: {
        hari: {
          nama_hari: todayDayName,
        },
      },
      relations: [
        'hari',
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.kelas',
        'jam_jadwal.jam_detail.subject_code.mapel',
        'jam_jadwal.jam_detail.subject_code.guru',
      ],
    });

    const guru = await this.guruRepository.findOne({
      where: {
        id: this.req.user.id,
      },
      relations: ['subject_code'],
    });

    if (!guru) {
      throw new HttpException('Guru not found', HttpStatus.NOT_FOUND);
    }

    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];

    // Collect all today's schedules
    const todaysSchedules = jadwalList
      .flatMap((jadwal) =>
        jadwal.jam_jadwal.map((jamJadwal) => ({
          jamJadwal,
          jamDetail: jamJadwal.jam_detail.find(
            (detail) => detail.subject_code.guru.id === guru.id,
          ),
        })),
      )
      .filter((item) => item.jamDetail);

    // Sort by start time
    todaysSchedules.sort((a, b) => {
      const jamMulaiA = new Date(`${currentDate}T${a.jamJadwal.jam_mulai}`);
      const jamMulaiB = new Date(`${currentDate}T${b.jamJadwal.jam_mulai}`);
      return jamMulaiA.getTime() - jamMulaiB.getTime();
    });

    // Check if all schedules are done
    const lastSchedule = todaysSchedules[todaysSchedules.length - 1];
    const lastJamSelesai = lastSchedule
      ? new Date(`${currentDate}T${lastSchedule.jamJadwal.jam_selesai}`)
      : null;

    const allSchedulesDone =
      lastSchedule?.jamJadwal.allSchedulesDone ||
      (lastJamSelesai && currentTime > lastJamSelesai);

    let isJadwalHabis = false;
    let isMulai = false;
    let isJadwalHabisHariIni = allSchedulesDone;

    for (const schedule of todaysSchedules) {
      const jamMulai = new Date(
        `${currentDate}T${schedule.jamJadwal.jam_mulai}`,
      );
      const jamSelesai = new Date(
        `${currentDate}T${schedule.jamJadwal.jam_selesai}`,
      );

      isMulai = currentTime >= jamMulai && currentTime <= jamSelesai;
      isJadwalHabis = currentTime >= jamSelesai;

      if (isMulai) {
        const absenGuru = await this.absenGuruRepository.findOne({
          relations: ['jamDetailJadwal'],
          where: {
            jamDetailJadwal: {
              id: schedule.jamDetail.id,
            },
            guru: {
              id: this.req.user.id,
            },
          },
        });
        const absenKelas = await this.absenKelasRepository.findOne({
          where: {
            jamDetailJadwal: {
              id: schedule.jamDetail.id,
            },
            guru: {
              id: this.req.user.id,
            },
          },
        });
        const isAbsen = !!absenGuru;
        const isMasukKelas = !!absenKelas;

        return this._success('Jam detail found successfully', {
          nama_user: guru.user.nama,
          jamDetailId: schedule.jamDetail.id,
          jam_mulai: schedule.jamJadwal.jam_mulai,
          jam_selesai: schedule.jamJadwal.jam_selesai,
          mapel: schedule.jamDetail.subject_code.mapel.nama_mapel,
          kelas: schedule.jamDetail.kelas.nama_kelas,
          is_absen: isAbsen,
          is_masuk_kelas: isMasukKelas,
          is_mulai: true,
          is_jadwal_habis: false,
          is_jadwal_habis_hari_ini: isJadwalHabisHariIni, // Ditambahkan properti ini
        });
      }
    }

    if (todaysSchedules.length > 0) {
      const nextSchedule = todaysSchedules[0];
      const nextJamMulai = new Date(
        `${currentDate}T${nextSchedule.jamJadwal.jam_mulai}`,
      );
      const nextJamSelesai = new Date(
        `${currentDate}T${nextSchedule.jamJadwal.jam_selesai}`,
      );

      isJadwalHabis = allSchedulesDone || currentTime >= nextJamSelesai;
      isMulai = !isJadwalHabis && currentTime >= nextJamMulai;

      return this._success('Jam detail found successfully', {
        id_user: guru.user.id,
        nama_user: guru.user.nama,
        jamDetailId: nextSchedule.jamDetail.id,
        jam_mulai: nextSchedule.jamJadwal.jam_mulai,
        jam_selesai: nextSchedule.jamJadwal.jam_selesai,
        mapel: nextSchedule.jamDetail.subject_code.mapel.nama_mapel,
        kelas: nextSchedule.jamDetail.kelas.nama_kelas,
        is_absen: false,
        is_masuk_kelas: false,
        is_mulai: isMulai,
        is_jadwal_habis: isJadwalHabis,
        is_jadwal_habis_hari_ini: isJadwalHabisHariIni, // Ditambahkan properti ini
      });
    }

    throw new HttpException(
      'Jam detail not found for today',
      HttpStatus.NOT_FOUND,
    );
  }

  async findOne(id: number): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({
      where: {
        hari: { id: id },
      },
      relations: [
        'hari',
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.kelas',
        'jam_jadwal.jam_detail.subject_code',
      ],
    });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    // Sort jam_detail by kelas.id
    const sortedJamJadwal = jadwal.jam_jadwal.map((jam) => ({
      ...jam,
      jam_detail: jam.jam_detail.sort((a, b) => a.kelas.id - b.kelas.id),
    }));

    const jadwalDto = {
      id: jadwal.id,
      hari: jadwal.hari,
      jam_jadwal: sortedJamJadwal.map((jam) => ({
        id: jam.id,
        jam_mulai: jam.jam_mulai,
        jam_selesai: jam.jam_selesai,
        is_rest: jam.is_rest,
        jam_detail: jam.jam_detail.map((detail) => ({
          id: detail.id,
          kelas: {
            id: detail.kelas.id,
            nama_kelas: detail.kelas.nama_kelas,
          },
          subject_code: {
            id: detail.subject_code.id,
            code: detail.subject_code.code,
          },
        })),
      })),
    };

    return this._success('Jadwal fetched successfully', jadwalDto);
  }

  async create(createJadwalDto: CreateJadwalDto): Promise<ResponseSuccess> {
    const { hari_id, jam_jadwal } = createJadwalDto;

    const existingJadwal = await this.jadwalRepository.findOne({
      relations: ['hari'],
      where: { hari: { id: createJadwalDto.hari_id } },
    });

    if (existingJadwal) {
      throw new HttpException(
        `Jadwal for ${existingJadwal.hari.nama_hari} already exists`,
        HttpStatus.FOUND,
      );
      // return
    }

    // Create the main Jadwal entity
    const jadwal = this.jadwalRepository.create({
      hari: { id: hari_id },
      created_by: { id: this.req.user.id },
    });

    // Save the main Jadwal entity
    const savedJadwal = await this.jadwalRepository.save(jadwal);

    // Loop through each JamJadwal DTO to create related entities
    let lastSavedJamJadwal: JamJadwal;
    for (const jamJadwalDto of jam_jadwal) {
      // Create the JamJadwal entity
      const jamJadwal = this.jamJadwalRepository.create({
        jam_mulai: jamJadwalDto.jam_mulai,
        jam_selesai: jamJadwalDto.jam_selesai,
        is_rest: jamJadwalDto.is_rest,
        jadwal: savedJadwal,
      });

      // Save the JamJadwal entity
      lastSavedJamJadwal = await this.jamJadwalRepository.save(jamJadwal);

      // Loop through each JamDetailJadwal DTO to create related entities
      for (const jdDto of jamJadwalDto.jam_detail) {
        const jamDetailJadwal = new JamDetailJadwal();
        jamDetailJadwal.jamJadwal = lastSavedJamJadwal;

        // Find the related Kelas and SubjectCode entities
        const kelas = await this.kelasRepository.findOne({
          where: { id: jdDto.kelas },
        });
        const subject_code = await this.subjectCodeRepository.findOne({
          where: { id: jdDto.subject_code },
        });

        // Check if Kelas and SubjectCode entities are found
        if (!kelas || !subject_code) {
          throw new HttpException(
            'Kelas or Subject Code not found',
            HttpStatus.NOT_FOUND,
          );
        }

        // Assign the found entities to the JamDetailJadwal
        jamDetailJadwal.kelas = kelas;
        jamDetailJadwal.subject_code = subject_code;

        // Save the JamDetailJadwal entity
        await this.jamDetailJadwalRepository.save(jamDetailJadwal);
      }
    }

    // Set the last JamJadwal's allSchedulesDone to true
    if (lastSavedJamJadwal) {
      lastSavedJamJadwal.allSchedulesDone = true;
      await this.jamJadwalRepository.save(lastSavedJamJadwal);
    }

    return this._success('Jadwal created successfully', savedJadwal);
  }

  async update(
    id: number,
    updateJadwalDto: UpdateJadwalDto,
  ): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({
      where: {
        hari: { id: id },
      },
      relations: [
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.subject_code',
        'jam_jadwal.jam_detail.kelas',
      ],
    });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    if (updateJadwalDto.jam_jadwal) {
      for (const jamJadwalDto of updateJadwalDto.jam_jadwal) {
        let jamJadwal = jadwal.jam_jadwal.find(
          (jj) => jj.id === jamJadwalDto.id,
        );
        if (jamJadwal) {
          // Update existing jamJadwal
          jamJadwal.jam_mulai = jamJadwalDto.jam_mulai;
          jamJadwal.jam_selesai = jamJadwalDto.jam_selesai;
          jamJadwal.is_rest = jamJadwalDto.is_rest;

          // Track existing jamDetailJadwal IDs to handle deletions
          const existingDetailIds = jamJadwal.jam_detail.map((jd) => jd.id);
          const updatedDetailIds = jamJadwalDto.jam_detail.map(
            (jdDto) => jdDto.id,
          );
          const detailIdsToDelete = existingDetailIds.filter(
            (id) => !updatedDetailIds.includes(id),
          );

          // Delete removed jamDetailJadwal
          await this.jamDetailJadwalRepository.delete({
            id: In(detailIdsToDelete),
          });

          // Update existing or add new jamDetailJadwal records
          for (const jdDto of jamJadwalDto.jam_detail) {
            let jamDetailJadwal = jamJadwal.jam_detail.find(
              (jd) => jd.id === jdDto.id,
            );
            if (jamDetailJadwal) {
              // Find subject_code by name
              const subject_code = await this.subjectCodeRepository.findOne({
                where: { code: jdDto.subject_code }, // Update this line
              });
              const kelas = await this.kelasRepository.findOne({
                where: { id: jdDto.kelas },
              });

              if (!subject_code || !kelas) {
                throw new HttpException(
                  'Subject code or Kelas not found',
                  HttpStatus.NOT_FOUND,
                );
              }

              jamDetailJadwal.subject_code = subject_code;
              jamDetailJadwal.kelas = kelas;

              await this.jamDetailJadwalRepository.save(jamDetailJadwal);
            } else {
              // Create new jamDetailJadwal if not exists
              const subject_code = await this.subjectCodeRepository.findOne({
                where: { code: jdDto.subject_code }, // Update this line
              });
              const kelas = await this.kelasRepository.findOne({
                where: { id: jdDto.kelas },
              });

              if (!subject_code || !kelas) {
                throw new HttpException(
                  'Subject code or Kelas not found',
                  HttpStatus.NOT_FOUND,
                );
              }

              const newJamDetailJadwal = this.jamDetailJadwalRepository.create({
                jamJadwal,
                subject_code,
                kelas,
              });

              await this.jamDetailJadwalRepository.save(newJamDetailJadwal);
            }
          }
        } else {
          // Create new jamJadwal and jamDetailJadwal records if not exists
          jamJadwal = this.jamJadwalRepository.create({
            jam_mulai: jamJadwalDto.jam_mulai,
            jam_selesai: jamJadwalDto.jam_selesai,
            is_rest: jamJadwalDto.is_rest,
            jadwal: jadwal,
          });

          const savedJamJadwal = await this.jamJadwalRepository.save(jamJadwal);

          const jamDetailJadwals = await Promise.all(
            jamJadwalDto.jam_detail.map(async (jdDto) => {
              const subject_code = await this.subjectCodeRepository.findOne({
                where: { code: jdDto.subject_code }, // Update this line
              });
              const kelas = await this.kelasRepository.findOne({
                where: { id: jdDto.kelas },
              });

              if (!subject_code || !kelas) {
                throw new HttpException(
                  'Subject code or Kelas not found',
                  HttpStatus.NOT_FOUND,
                );
              }

              const newJamDetailJadwal = this.jamDetailJadwalRepository.create({
                jamJadwal: savedJamJadwal,
                subject_code,
                kelas,
              });
              return newJamDetailJadwal;
            }),
          );

          await this.jamDetailJadwalRepository.save(jamDetailJadwals);
        }
      }
    }

    const updatedJadwal = await this.jadwalRepository.save(jadwal);
    return this._success('Jadwal updated successfully', updatedJadwal);
  }

  async findAll(query: FindAllJadwalDTO): Promise<ResponseSuccess> {
    const { hari } = query;
    const filter: any = {};

    if (hari) {
      filter.hari = {
        nama_hari: Like(`%${hari}%`),
      };
    }

    // Fetch jadwal entities with the necessary relations
    const jadwalList = await this.jadwalRepository.find({
      where: filter,
      relations: [
        'hari',
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.kelas',
        'jam_jadwal.jam_detail.subject_code.guru.user',
      ],
    });

    // Extract JamJadwal IDs for efficient filtering
    const jamJadwalIds = jadwalList.flatMap((jadwal) =>
      jadwal.jam_jadwal.map((jj) => jj.id),
    );

    // Fetch all JamDetailJadwal with the specified relations and filter
    const jamDetailList = await this.jamDetailJadwalRepository.find({
      relations: ['kelas', 'subject_code.guru.user', 'jamJadwal'],
      where: {
        jamJadwal: {
          id: In(jamJadwalIds),
        },
      },
    });

    // Helper function to convert time string to a comparable format
    const timeStringToDate = (timeString: string) => {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      return new Date(0, 0, 0, hours, minutes, seconds);
    };

    // Construct the final response object with sorting by jam_mulai
    const hasil = jadwalList.map((jadwal) => ({
      id: jadwal.id,
      hari: jadwal.hari,
      jam_jadwal: jadwal.jam_jadwal
        .sort(
          (a, b) =>
            timeStringToDate(a.jam_mulai).getTime() -
            timeStringToDate(b.jam_mulai).getTime(),
        ) // Sort by jam_mulai
        .map((jamJadwal) => ({
          id: jamJadwal.id,
          jam_mulai: jamJadwal.jam_mulai,
          jam_selesai: jamJadwal.jam_selesai,
          is_rest: jamJadwal.is_rest,
          allSchedulesDone: jamJadwal.allSchedulesDone,
          jam_detail: jamDetailList
            .filter((detail) => detail.jamJadwal.id === jamJadwal.id)
            .sort((a, b) =>
              a.kelas.nama_kelas.localeCompare(b.kelas.nama_kelas),
            ) // Sort by nama_kelas
            .map((detail) => ({
              id: detail.id,
              id_subject_code: detail.subject_code?.id || null,
              nama_kelas: detail.kelas?.nama_kelas || null,
              subject_code: detail.subject_code?.code || null,
              nama_guru: detail.subject_code?.guru.user.nama || null,
              id_guru: detail.subject_code.guru.id,
            })),
        })),
    }));

    return this._success('Jadwal found successfully', hasil);
  }

  async delete(id: number): Promise<ResponseSuccess> {
    const jadwal = await this.jadwalRepository.findOne({
      where: {
        hari: {
          id: id,
        },
      },
      relations: ['hari'],
    });

    if (!jadwal) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    await this.jadwalRepository.remove(jadwal);
    return this._success('Jadwal deleted successfully', jadwal);
  }

  async deleteBulk(data: number[]): Promise<ResponseSuccess> {
    const jadwals = await this.jadwalRepository.find({
      where: { id: In(data) },
    });

    if (jadwals.length === 0) {
      throw new HttpException('Jadwal not found', HttpStatus.NOT_FOUND);
    }

    await this.jadwalRepository.remove(jadwals);
    return this._success('Jadwal deleted successfully', jadwals);
  }

  private async findUserByRole(userId: number): Promise<Murid | Guru> {
    const siswa = await this.siswaRepository.findOne({
      where: { id: userId },
      relations: ['kelas', 'user'],
    });

    if (siswa) return siswa;

    const guru = await this.guruRepository.findOne({
      where: { id: userId },
      relations: ['subject_code', 'user'],
    });

    return guru || null;
  }

  private findJamDetail(
    jamDetailList: JamDetailJadwal[],
    user: Murid | Guru,
  ): JamDetailJadwal | null {
    if ('kelas' in user) {
      // Siswa
      return jamDetailList.find((detail) => detail.kelas.id === user.kelas.id);
    } else if ('subject_code' in user) {
      // Guru
      return jamDetailList.find(
        (detail) => detail.subject_code.guru.id === user.id,
      );
    }
    return null;
  }

  private checkIfAllSchedulesDone(
    schedules: any[],
    currentTime: Date,
    currentDate: string,
  ): boolean {
    const lastSchedule = schedules[schedules.length - 1];
    const lastJamSelesai = lastSchedule
      ? new Date(`${currentDate}T${lastSchedule.jamJadwal.jam_selesai}`)
      : null;

    return (
      lastSchedule?.jamJadwal.allSchedulesDone ||
      (lastJamSelesai && currentTime > lastJamSelesai)
    );
  }

  private async getAbsenStatus(
    schedule: any,
    user: Murid | Guru,
  ): Promise<{ isAbsen: boolean; isMasukKelas: boolean }> {
    if ('kelas' in user) {
      // Siswa
      const absenSiswa = await this.absenSiswaRepository.findOne({
        relations: ['absenKelas'],
        where: {
          absenKelas: { id: schedule.jamDetail.id },
          user: { id: user.id },
        },
      });
      return {
        isAbsen: !!absenSiswa,
        isMasukKelas: !!absenSiswa,
      };
    } else if ('subject_code' in user) {
      // Guru
      const absenGuru = await this.absenGuruRepository.findOne({
        relations: ['jamDetailJadwal'],
        where: {
          jamDetailJadwal: { id: schedule.jamDetail.id },
          guru: { id: user.id },
        },
      });
      const absenKelas = await this.absenKelasRepository.findOne({
        where: {
          jamDetailJadwal: { id: schedule.jamDetail.id },
          guru: { id: user.id },
        },
      });
      return {
        isAbsen: !!absenGuru,
        isMasukKelas: !!absenKelas,
      };
    }
    return { isAbsen: false, isMasukKelas: false };
  }
}
