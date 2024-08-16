import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Jadwal } from '../../jadwal/jadwal.entity';
import { User } from '../../auth/auth.entity';
import { JamJadwal } from '../../jam-jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../../jam-jadwal/jam-detail-jadwal.entity';
import { Guru } from '../../auth/guru/guru.entity';
import { AbsenKelas } from '../absen-kelas/absen-kelas.entity';

// src/absen/absen.entity.ts

@Entity()
export class AbsenGuru {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JamDetailJadwal, { nullable: false })
  jamDetailJadwal: JamDetailJadwal;

  @ManyToOne(() => JamJadwal, { nullable: false , onDelete: 'CASCADE'})
  jamJadwal: JamJadwal;

  @ManyToOne(() => Jadwal, { nullable: true })
  jadwal: Jadwal;

  @ManyToOne(() => AbsenKelas, (absenKelas) => absenKelas.absenSiswa, {
    onDelete: 'CASCADE',
  })
  absenKelas: AbsenKelas;

  @ManyToOne(() => Guru)
  @JoinColumn({ name: 'guru_id' })
  guru: Guru;

  @Column('datetime')
  waktu_absen: Date;

  @Column({
    default: 'Hadir',
  })
  status: string;

  @Column({ nullable: true, default: 'belum ada' })
  hasil_jurnal_kegiatan: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
