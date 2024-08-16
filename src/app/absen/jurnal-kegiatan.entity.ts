import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';
import { AbsenGuru } from './absen-guru/absen-guru.entity';

@Entity()
export class JurnalKegiatan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JamJadwal, { nullable: false })
  jamJadwal: JamJadwal;

  @ManyToOne(() => JamDetailJadwal, { nullable: false })
  jamDetailJadwal: JamDetailJadwal;

  @ManyToOne(() => AbsenGuru, { nullable: false , onDelete: 'CASCADE'})
  absen_guru: AbsenGuru;

  @Column({ type: 'varchar', length: 255, default: '' })
  matapelajaran: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  jam_pelajaran: string;

  @Column({ type: 'text' })
  materi: string;

  @Column({ type: 'text', nullable: true })
  kendala?: string;
}
