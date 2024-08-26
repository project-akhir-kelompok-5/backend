import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { User } from '../auth/auth.entity';
import { AbsenGuru } from '../absen/absen-guru/absen-guru.entity';
import { JamDetailJadwal } from './jam-detail-jadwal.entity';
import { JamJadwal } from './jam-jadwal.entity';
import { SubjectCodeEntity } from '../subject_code/subject_code.entity';
import { Hari } from '../hari/hari.entity';
import { AbsenSiswa } from '../absen/absen-siswa/absen-siswa.entity';
import { AbsenKelas } from '../absen/absen-kelas/absen-kelas.entity';

export enum HariEnum {
  Senin = 'Senin',
  Selasa = 'Selasa',
  Rabu = 'Rabu',
  Kamis = 'Kamis',
  Jumat = 'Jumat',
  Sabtu = 'Sabtu',
}
@Entity()
export class Jadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => AbsenGuru, (absen) => absen.jadwal)
  absen_guru: AbsenGuru

  @OneToMany(() => AbsenKelas, (absen) => absen.jadwal)
  absen_kelas: AbsenKelas

  @ManyToOne(() => Hari, (Hari) => Hari.jadwals)
  hari: Hari;

  @OneToMany(() => JamJadwal, (jamJadwal) => jamJadwal.jadwal, {
    onDelete: 'CASCADE',
    cascade: ['insert', 'update'],
  })
  jam_jadwal: JamJadwal[];


  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;
}
