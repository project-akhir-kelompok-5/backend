import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { User } from '../auth/auth.entity';
import { JamJadwal } from '../jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jadwal/jam-detail-jadwal.entity';
import { StatusMapel } from '../auth/roles.enum';
import { SubjectCodeEntity } from '../subject_code/subject_code.entity';

@Entity()
export class Mapel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nama_mapel: string;

  @Column({ type: 'enum', enum: StatusMapel, default: StatusMapel.ONLINE })
  status_mapel: StatusMapel;

  @ManyToMany(() => Guru, (guru) => guru.mapel, {onDelete: 'CASCADE'})
  guru: Guru[];


  @OneToMany(() => SubjectCodeEntity, subjectCode => subjectCode.mapel, {onDelete: 'CASCADE'})
  subject_code: SubjectCodeEntity[];


  @OneToMany(() => JamDetailJadwal, (jamJadwal) => jamJadwal.kelas)
  jamDetail: JamDetailJadwal[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
