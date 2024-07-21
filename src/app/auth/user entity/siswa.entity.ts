// student.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';

@Entity()
export class Siswa {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.siswa_id)
  user_id: User;

  @ManyToOne(() => Kelas, kelas => kelas.siswa_id)
  kelas_id: Kelas;

  @Column()
  NISN: string;

  @Column()
  tanggal_lahir: string;

  @Column()
  alamat: string;
}
