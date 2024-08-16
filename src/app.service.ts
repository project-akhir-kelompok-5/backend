import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbsenGuru } from './app/absen/absen-guru/absen-guru.entity';
import { JamDetailJadwal } from './app/jam-jadwal/jam-detail-jadwal.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AbsenGuru)
    private readonly absenGuruRepository: Repository<AbsenGuru>,
    @InjectRepository(JamDetailJadwal)
    private readonly jamDetailJadwalRepository: Repository<JamDetailJadwal>,
  ) {}
  
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAutoAbsenGuru() {
    const currentTime = new Date();
    const currentDate = currentTime.toISOString().split('T')[0];

    console.log(`Current Time: ${currentTime}`);

    // Fetch all jamDetailJadwal along with their jamJadwal relations
    const jamDetailJadwals = await this.jamDetailJadwalRepository.find({
      relations: ['jamJadwal'],
    });

    for (const jamDetailJadwal of jamDetailJadwals) {
      const jamJadwal = jamDetailJadwal.jamJadwal;
      const jamSelesai = new Date(`${currentDate}T${jamJadwal.jam_selesai}`);

      console.log(`Checking Jam Detail ID: ${jamDetailJadwal.id}, Jam Selesai: ${jamSelesai}`);

      // Check if the current time has passed the jam_selesai time
      if (currentTime > jamSelesai) {
        console.log(`Time exceeded for Jam Detail ID: ${jamDetailJadwal.id}`);

        // Find all teachers who haven't marked attendance for this jamDetailJadwal
        const absentTeachers = await this.absenGuruRepository.find({
          where: {
            jamDetailJadwal: { id: jamDetailJadwal.id },
            waktu_absen: null,
          },
          select: ['id'], // Select only the IDs of the absent teachers
        });

        console.log(`Found ${absentTeachers.length} absent teachers for Jam Detail ID: ${jamDetailJadwal.id}`);

        // Iterate over each absent teacher and mark them as "Alpha"
        for (const absentTeacher of absentTeachers) {
          await this.absenGuruRepository.update(absentTeacher.id, {
            status: 'Alpha',
            waktu_absen: jamSelesai,
          });
          console.log(`Marked teacher ID: ${absentTeacher.id} as Alpha`);
        }
      }
    }
  }

  getHello(): string {
    return 'Hai';
  }
}
