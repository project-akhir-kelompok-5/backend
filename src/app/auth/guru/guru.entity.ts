// teacher.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { Mapel } from 'src/app/mapel/mapel.entity';

@Entity()
export class Guru {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.guru, {eager: true})
  user: User;

  @ManyToMany(() => Mapel, mapel => mapel.guru)
  @JoinTable()
  mapel: Mapel[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
