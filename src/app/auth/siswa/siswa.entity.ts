// student.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';

@Entity()
export class Siswa {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: User;

  @ManyToOne(() => Kelas, (kelas) => kelas.siswa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kelasId' })
  kelas: Kelas;

  @Column()
  NISN: string;

  @Column()
  tanggal_lahir: string;

  @Column()
  alamat: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
