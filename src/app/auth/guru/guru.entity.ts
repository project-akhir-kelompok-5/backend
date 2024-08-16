// teacher.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { Mapel } from 'src/app/mapel/mapel.entity';
import { SubjectCodeEntity } from 'src/app/subject_code/subject_code.entity';
import { JamDetailJadwal } from 'src/app/jam-jadwal/jam-detail-jadwal.entity';

@Entity()
export class Guru {
  @PrimaryColumn()
  id: number;

  @Column({ length: 1 })
  initial_schedule: string;

  @ManyToOne(() => User, (user) => user.guru, {
    eager: true,
    onUpdate: 'CASCADE',
  })
  user: User;

  @OneToMany(() => SubjectCodeEntity, (subjectCode) => subjectCode.guru, {
    onDelete: 'CASCADE',
  })
  subject_code: SubjectCodeEntity[];

  @ManyToOne(() => JamDetailJadwal, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jadwal_detail_id' })
  jadwal_detail: JamDetailJadwal;

  @ManyToMany(() => Mapel, (mapel) => mapel.guru, { onDelete: 'CASCADE' })
  @JoinTable()
  mapel: Mapel[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
