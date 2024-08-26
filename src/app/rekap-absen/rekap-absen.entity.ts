import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/auth.entity';
import { Guru } from '../auth/guru/guru.entity';
import { JamDetailJadwal } from '../jadwal/jam-detail-jadwal.entity';
import { AbsenKelas } from '../absen/absen-kelas/absen-kelas.entity';
import { Murid } from '../auth/siswa/siswa.entity';
// import { AbsenKelas } from './absen-kelas.entity';

@Entity()
export class RekapAbsen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'siswa' | 'guru'; // Jenis rekap: siswa atau guru

  @ManyToOne(() => Murid, { nullable: true })
  @JoinColumn({ name: 'siswa_id' })
  siswa: Murid;

  @ManyToOne(() => Guru, { nullable: true })
  @JoinColumn({ name: 'guru_id' })
  guru: Guru;

  @ManyToOne(() => JamDetailJadwal, { nullable: true })
  @JoinColumn({ name: 'jam_detail_jadwal_id' })
  jamDetailJadwal: JamDetailJadwal;

  @ManyToOne(() => AbsenKelas, { nullable: true })
  @JoinColumn({ name: 'absen_kelas_id' })
  absenKelas: AbsenKelas;

  @Column({ type: 'date' })
  tanggal: Date;

  @Column({ default: 'Hadir' })
  status: string;

  @Column()
  totalAbsensi: number;

  @Column()
  totalLembur: number;

//   @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
//   createdAt: Date;

//   @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
//   updatedAt: Date;
}
