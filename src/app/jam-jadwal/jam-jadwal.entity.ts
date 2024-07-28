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
import { Absen } from '../absen/absen.entity';

@Entity()
export class JamJadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => JamDetailJadwal, (jamJadwal) => jamJadwal.kelas, {onDelete: 'CASCADE'})
  jam_detail: JamDetailJadwal[];

  @ManyToOne(() => Jadwal, (jadwal) => jadwal.jam_jadwal)
  @JoinColumn({name: 'jadwal_id'})
  jadwal: Jadwal;

  @OneToMany(() => Absen, (absen) => absen.jadwal)
  absen: Absen[]

  @ManyToOne(() => Mapel, (mapel) => mapel.jam_jadwal)
  mapel: Mapel;

  @ManyToOne(() => Kelas, (kelas) => kelas.jam_jadwal)
  kelas: Kelas;

  @Column()
  jam_mulai: string;

  @Column()
  jam_selesai: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
