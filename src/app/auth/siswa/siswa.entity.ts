// student.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';
import { AbsenSiswa } from 'src/app/absen/absen-siswa/absen-siswa.entity';
import { JamDetailJadwal } from 'src/app/jam-jadwal/jam-detail-jadwal.entity';

@Entity()
export class Murid {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: User;

  @ManyToOne(() => Kelas, (kelas) => kelas.siswa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kelasId' })
  kelas: Kelas;

  @Column({ nullable: true})
  jamDetailJadwal_id: number;

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
