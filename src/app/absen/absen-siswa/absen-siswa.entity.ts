import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Murid } from '../../auth/siswa/siswa.entity';
import { AbsenKelas } from '../absen-kelas/absen-kelas.entity';
import { User } from '../../auth/auth.entity';
import { Kelas } from '../../kelas/kelas.entity';
import { Jadwal } from '../../jadwal/jadwal.entity';
import { JamJadwal } from '../../jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from 'src/app/jadwal/jam-detail-jadwal.entity';

@Entity()
export class AbsenSiswa {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => JamDetailJadwal, { onDelete: 'CASCADE' })
  jamDetailJadwal: JamDetailJadwal;

  @Column({
    default: 'Hadir',
  })
  status: string;

  @ManyToOne(() => AbsenKelas, (absenKelas) => absenKelas.absenSiswa, {
    nullable: true,
  })
  absenKelas: AbsenKelas | null;

  @Column()
  waktu_absen: Date;
}
