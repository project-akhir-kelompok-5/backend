import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Kelas } from '../../kelas/kelas.entity';
import { Guru } from '../../auth/guru/guru.entity';
import { AbsenSiswa } from '../absen-siswa/absen-siswa.entity';
import { JamDetailJadwal } from '../../jam-jadwal/jam-detail-jadwal.entity';
import { JamJadwal } from '../../jam-jadwal/jam-jadwal.entity';
import { Jadwal } from '../../jadwal/jadwal.entity';
import { User } from '../../auth/auth.entity';

@Entity()
export class AbsenKelas {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Kelas)
  kelas: Kelas;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Guru)
  guru: Guru;

  @ManyToOne(() => Jadwal, (jadwal) => jadwal.absen_kelas, {
    onDelete: 'CASCADE',
  })
  jadwal: Jadwal;

  @ManyToOne(() => JamJadwal, (jamJadwal) => jamJadwal.absen_guru, {
    onDelete: 'CASCADE',
  })
  jamJadwal: JamJadwal;

  @ManyToOne(() => JamDetailJadwal, {onDelete: 'CASCADE'})
  jamDetailJadwal: JamDetailJadwal;

  @Column()
  tanggal: Date;

  @Column()
  kode_kelas: string;

  @OneToMany(() => AbsenSiswa, (absenSiswa) => absenSiswa.absenKelas, {
    onDelete: 'CASCADE',
  })
  absenSiswa: AbsenSiswa[];
}
