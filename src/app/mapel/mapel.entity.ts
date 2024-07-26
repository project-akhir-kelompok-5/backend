import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { User } from '../auth/auth.entity';

@Entity()
export class Mapel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nama_mapel: string;

  @ManyToMany(() => Guru, guru => guru.mapel)
  guru: Guru[];

  @OneToMany(() => Jadwal, jadwal => jadwal.mapel)
  jadwal: Jadwal[];

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
