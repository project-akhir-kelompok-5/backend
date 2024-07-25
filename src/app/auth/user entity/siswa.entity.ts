// student.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';

@Entity()
export class Siswa {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.siswa)
  user: User;

  @ManyToOne(() => Kelas, kelas => kelas.siswa)
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
