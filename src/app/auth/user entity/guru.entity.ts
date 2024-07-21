// teacher.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { Mapel } from 'src/app/mapel/mapel.entity';

@Entity()
export class Guru {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.guru_id)
  user_id: User;

  @Column({nullable: true})
  jurnal_kegiatan: string;

  @ManyToOne(() => Kelas, kelas => kelas.id)
  kelas_id: Kelas;

  @ManyToOne(() => Mapel, mapel => mapel.guru_id)
  mapel_id: Kelas;
}
