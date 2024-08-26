import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Like, Repository } from 'typeorm';
import { AbsenGuru } from './app/absen/absen-guru/absen-guru.entity';
import { JamDetailJadwal } from './app/jadwal/jam-detail-jadwal.entity';
import { Guru } from './app/auth/guru/guru.entity';
import { Jadwal } from './app/jadwal/jadwal.entity';
import { AbsenSiswa } from './app/absen/absen-siswa/absen-siswa.entity';
import { Murid } from './app/auth/siswa/siswa.entity';
import * as webPush from 'web-push';
import { AbsenGateway } from './app/absen/absen.gateway';
import { REQUEST } from '@nestjs/core';
import { AuthService } from './app/auth/auth.service';
import { Notifikasi } from './app/notifikasi/notifikasi.entity';

webPush.setVapidDetails(
  'mailto:nayhan.nayhn@example.com',
  'BDxOXWB_-WZelAIl-UDXXOmtrI7B0Ldd1ltENQs2zgyLR9FJO4ODbQaxihiWghHOy5sj6TfX2eoREXFfUacLm24',
  'sDrmPBNFvvb0jrbcJQ9KTnKijfVgUP46SrKb47Re2ZU',
);

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AbsenGuru)
    private readonly absenGuruRepository: Repository<AbsenGuru>,
    @InjectRepository(AbsenSiswa)
    private readonly absenSiswaRepository: Repository<AbsenSiswa>,
    @InjectRepository(Jadwal)
    private readonly jadwalRepository: Repository<Jadwal>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
    @InjectRepository(Murid)
    private readonly siswaRepository: Repository<Murid>,
    @InjectRepository(Notifikasi)
    private readonly notifRepository: Repository<Notifikasi>,
    // private readonly authService: AuthService,
    private readonly absenGateway: AbsenGateway, // @Inject(REQUEST) // readonly req: any,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAutoAbsenGuru() {
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];
    const currentDay = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
    }).format(currentTime);

    console.log(`Current Time: ${currentTime}, Current Day: ${currentDay}`);

    // Fetch the schedule for the current day
    const jadwalList = await this.jadwalRepository.find({
      where: {
        hari: {
          nama_hari: Like(`%${currentDay}%`),
        },
      },
      relations: [
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.subject_code.guru',
      ],
    });

    // Extract JamJadwal IDs for efficient filtering
    const jamJadwalIds = jadwalList.flatMap((jadwal) =>
      jadwal.jam_jadwal.map((jj) => jj.id),
    );

    // Fetch JamDetailJadwal for the current day
    const jamDetailList = await this.jamDetailJadwalRepository.find({
      relations: ['kelas', 'subject_code.guru.user', 'jamJadwal'],
      where: {
        jamJadwal: {
          id: In(jamJadwalIds),
        },
      },
    });

    console.log('jamDetailList', jamDetailList);

    const lastJamJadwal = jadwalList
      .flatMap((jadwal) => jadwal.jam_jadwal)
      .pop();

    // Iterate through each JamDetailJadwal
    for (const jamDetailJadwal of jamDetailList) {
      const jamJadwal = jamDetailJadwal.jamJadwal;
      const jamMulai = new Date(`${currentDate}T${jamJadwal.jam_mulai}`);
      const jamSelesai = new Date(`${currentDate}T${jamJadwal.jam_selesai}`);
      const jamSelesaiAlpha = new Date(jamMulai.getTime() + 45 * 60000); // 45 minutes after jam_mulai

      console.log(
        `Checking Jam Detail ID: ${jamDetailJadwal.id}, Jam Mulai: ${jamMulai}, Jam Selesai (45 min after): ${jamSelesai}`,
      );
      let allSchedulesDone;

      if (jamJadwal.id === lastJamJadwal.id && currentTime > jamSelesai) {
        allSchedulesDone = true;
        console.log(
          `All schedules are done for the day. JamJadwal ID: ${jamJadwal.id}`,
        );
        await this.guruRepository.update(
          {},
          { jadwal_detail: null, is_absen_today: false },
        );

        for (const jamDEtail of jamDetailList) {
          const guru = await this.guruRepository.findOne({
            where: {
              id: jamDEtail.subject_code.guru.id,
              is_absen_today: false,
            },
          });

          console.log('guru id', guru.id);
        }
        return;
      } else {
        allSchedulesDone = false;
      }

      if (currentTime > jamSelesaiAlpha) {
        console.log(
          `Time exceeded 45 minutes for Jam Detail ID: ${jamDetailJadwal.id}`,
        );

        const absentStudents = await this.absenSiswaRepository.find({
          relations: ['user'],
          where: {
            jamDetailJadwal: {
              id: jamDetailJadwal.id,
            },
            waktu_absen:  Between(
              new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
              new Date(new Date().setHours(23, 59, 59, 999)) // End of today
            ),
            status: 'Alpha',
          },
        });
        

        console.log(
          `Found ${absentStudents.length} absent students for Jam Detail ID: ${jamDetailJadwal.id} KJNKSNK`,
        );

        // Kumpulkan nama-nama siswa yang tidak absen
        const absentStudentNames = absentStudents.map((data) => data.user.nama)

        const absentTeachers = await this.guruRepository.find({
          where: {
            id: jamDetailJadwal.subject_code.guru.id,
            is_absen_today: false,
          },
        });

        console.log(
          `Found ${absentTeachers.length} absent teachers for Jam Detail ID: ${jamDetailJadwal.id}`,
        );

        const processedTeachers = new Set<number>();

        // Mark teachers as "Alpha" if they haven't marked attendance
        for (const absentTeacher of absentTeachers) {
          if (processedTeachers.has(absentTeacher.id)) {
            continue; // Skip if this teacher has already been processed
          }
        
          const newAbsenGuru = this.absenGuruRepository.create({
            guru: { id: absentTeacher.id }, // Assign the teacher's ID
            jamDetailJadwal: jamDetailJadwal, // Assign the related JamDetailJadwal
            status: 'Alpha',
            waktu_absen: currentTime, // Set attendance time as current time
            jamJadwal: jamDetailJadwal.jamJadwal
          });
          console.log('guru id:', absentTeacher.id);

          const payload: any = {
            guruId: absentTeacher.id.toString(),
            message: `Anda belum absen hari ini. Siswa yang belum absen sebanyak: ${absentStudents.length} di jamDEtail: ${jamDetailJadwal.id}`,
            data: absentStudentNames,
          };

          let dataEmit = this.absenGateway.server
            .to(payload.guruId)
            .emit('notifGurus', payload);

          console.log('Data emitted:', dataEmit);
          console.log('Payload:', payload);
          const notifikasi = this.notifRepository.create({
            message: payload.message,
            user: absentTeacher.user, // Assuming the Notifikasi entity has a relation to User
            createdAt: new Date(), // Assuming you have a createdAt field
          });

          await this.notifRepository.save(notifikasi);


          await this.absenGuruRepository.save(newAbsenGuru); // Save new entry to database
          await this.guruRepository.update(absentTeacher.id, {
            is_absen_today: true, // Update teacher's attendance status
          });

          console.log(`Marked teacher ID: ${absentTeacher.id} as Alpha`);
          
        }
        if (jamJadwal.allSchedulesDone === true) {
          console.log(
            'All schedules are done for JamJadwal ID: ${jamJadwal.id}',
          );
          // return;
        }
      } else {
        console.log(
          `Current time hasn't exceeded 45 minutes after start for Jam Detail ID: ${jamDetailJadwal.id}`,
        );
      }

      if (currentTime > jamSelesai) {
        console.log('Reset is_absen_today for all teachers after jam_selesai');
        await this.guruRepository.update(
          {},
          { jadwal_detail: null, is_absen_today: false },
        );
        // this.absenGateway.server.emit.
        // console.log('jadmetai id:', jamDetailJadwal.id);
        // this.absenGateway.server.to(`${jamDetailJadwal.id}`).emit('notifGuru', {
        //   data: 'Anda belum absen hari ini',
        // });
      } else {
        console.log(
          `Current time hasn't exceeded jam_selesai for JamJadwal ID: ${jamJadwal.id}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAutoAbsenSiswa() {
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];
    const currentDay = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
    }).format(currentTime);

    console.log(`Current Time: ${currentTime}, Current Day: ${currentDay}`);

    const jadwalList = await this.jadwalRepository.find({
      where: {
        hari: { nama_hari: Like(`%${currentDay}%`) },
      },
      relations: [
        'jam_jadwal',
        'jam_jadwal.jam_detail',
        'jam_jadwal.jam_detail.subject_code',
      ],
    });

    const jamJadwalIds = jadwalList.flatMap((jadwal) =>
      jadwal.jam_jadwal.map((jj) => jj.id),
    );

    const jamDetailList = await this.jamDetailJadwalRepository.find({
      relations: [
        'kelas',
        'subject_code.guru.user',
        'subject_code.mapel',
        'jamJadwal',
      ],
      where: { jamJadwal: { id: In(jamJadwalIds) } },
    });

    const lastJamJadwal = jadwalList
      .flatMap((jadwal) => jadwal.jam_jadwal)
      .pop();

    const processedStudents = new Set<number>();

    for (const jamDetailJadwal of jamDetailList) {
      const jamJadwal = jamDetailJadwal.jamJadwal;
      const jamMulai = new Date(`${currentDate}T${jamJadwal.jam_mulai}`);
      const jamSelesaiAlpha = new Date(jamMulai.getTime() + 45 * 60000); // 45 minutes after jam_mulai
      const jamSelesai = new Date(`${currentDate}T${jamJadwal.jam_selesai}`);

      let allSchedulesDone;

      if (jamJadwal.id === lastJamJadwal.id && currentTime > jamSelesai) {
        allSchedulesDone = true;
        console.log(
          `All schedules are done for the day. JamJadwal ID: ${jamJadwal.id}`,
        );
        await this.siswaRepository.update(
          {},
          { jamDetailJadwal_id: null, is_absen_today: false },
        );

        for (const jamDetail of jamDetailList) {
          const siswa = await this.siswaRepository.findOne({
            where: {
              // id: jamDetail.kelas.id,
              kelas: {
                id: jamDetail.kelas.id,
              },
              is_absen_today: false,
            },
          });

          console.log('Student ID:', siswa?.id);
        }
        return;
      } else {
        allSchedulesDone = false;
      }

      if (currentTime > jamSelesaiAlpha) {
        console.log(
          `Time exceeded 45 minutes for Jam Detail ID: ${jamDetailJadwal.id}`,
        );

        const absentStudents = await this.siswaRepository.find({
          where: {
            kelas: { id: jamDetailJadwal.kelas.id },
            is_absen_today: false,
          },
        });

        console.log(
          `Found ${absentStudents.length} absent students for Jam Detail ID: ${jamDetailJadwal.id}`,
        );

        for (const absentStudent of absentStudents) {
          const newAbsenSiswa = this.absenSiswaRepository.create({
            user: absentStudent,
            jamDetailJadwal: jamDetailJadwal,
            status: 'Alpha',
            waktu_absen: currentTime,
          });
          console.log('Student ID:', absentStudent.id);

          const payload: any = {
            studentId: absentStudent.id.toString(),
            message: `Anda belum absen hari ini pada mata pelajaran ${jamDetailJadwal.subject_code.mapel.nama_mapel}`,
          };

          let dataEmit = this.absenGateway.server
            .to(payload.studentId)
            .emit('notifSiswas', payload);
          console.log('dataEmit:', dataEmit);

          const notifikasi = this.notifRepository.create({
            message: payload.message,
            user: absentStudent.user, // Assuming the Notifikasi entity has a relation to User
            createdAt: new Date(), // Assuming you have a createdAt field
          });

          await this.notifRepository.save(notifikasi);

          console.log('Data emitted:', dataEmit);
          console.log('Payload:', payload);

          await this.absenSiswaRepository.save(newAbsenSiswa);
          await this.siswaRepository.update(absentStudent.id, {
            is_absen_today: true,
          });

          console.log(`Marked student ID: ${absentStudent.id} as Alpha`);
        }
        if (jamJadwal.allSchedulesDone === true) {
          console.log(
            'All schedules are done for JamJadwal ID: ${jamJadwal.id}',
          );
        }
      } else {
        console.log(
          `Current time hasn't exceeded 45 minutes after start for Jam Detail ID: ${jamDetailJadwal.id}`,
        );
      }

      if (currentTime > jamSelesai) {
        console.log('Reset is_absen_today for all students after jam_selesai');
        await this.siswaRepository.update(
          {},
          { jamDetailJadwal_id: null, is_absen_today: false },
        );

      //   this.absenGateway.server
      //     .to(`${jamDetailJadwal.id}`)
      //     .emit('notifSiswa', {
      //       data: 'Anda belum absen hari ini',
      //     });
      // } else {
        console.log(
          `Current time hasn't exceeded jam_selesai for JamJadwal ID: ${jamJadwal.id}`,
        );
      }
    }
  }

  getHello(): string {
    return 'Hai';
  }
}
