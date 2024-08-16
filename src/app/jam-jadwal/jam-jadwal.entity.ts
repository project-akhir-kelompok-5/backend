import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { JamDetailJadwal } from './jam-detail-jadwal.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { AbsenGuru } from '../absen/absen-guru/absen-guru.entity';
import { AbsenSiswa } from '../absen/absen-siswa/absen-siswa.entity';
import { AbsenKelas } from '../absen/absen-kelas/absen-kelas.entity';

@Entity()
export class JamJadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => JamDetailJadwal, (jamJadwal) => jamJadwal.jamJadwal, {onDelete: 'CASCADE'})
  jam_detail: JamDetailJadwal[];

  @ManyToOne(() => Jadwal, (jadwal) => jadwal.jam_jadwal, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'jadwal_id'})
  jadwal: Jadwal;

  @OneToMany(() => AbsenGuru, (absen) => absen.jadwal)
  absen_guru: AbsenGuru[]

  @OneToMany(() => AbsenKelas, (absen) => absen.jadwal)
  absen_kelas: AbsenKelas[]

  @Column({ type: 'boolean', default: false , nullable: true})
  is_rest: boolean;

  @Column()
  jam_mulai: string;

  @Column()
  jam_selesai: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
