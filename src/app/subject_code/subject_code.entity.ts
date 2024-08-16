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
import { Jadwal } from '../jadwal/jadwal.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';
import { Kelas } from '../kelas/kelas.entity';

@Entity()
export class SubjectCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @ManyToOne(() => Guru, (guru) => guru.subject_code, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guru_id' })
  guru: Guru;

  @ManyToOne(() => Mapel, (mapel) => mapel.subject_code, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'mapel_id' })
  mapel: Mapel;


  @OneToMany(() => Jadwal, (jadwal) => jadwal.subject_code)
  jadwal: Jadwal[];

  @OneToMany(() => JamDetailJadwal, (jadwal) => jadwal.subject_code)
  jamDetail: JamDetailJadwal[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
