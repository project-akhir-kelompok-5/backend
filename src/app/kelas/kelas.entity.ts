// kelas.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Siswa } from '../auth/siswa/siswa.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.entity';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';

UseGuards(JwtGuard)
@Entity()
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nama_kelas: string;

  @OneToMany(() => JamDetailJadwal, jamJadwal => jamJadwal.kelas)
  jamDetail: JamDetailJadwal[];

  @OneToMany(() => Siswa, siswa => siswa.kelas)
  siswa: Siswa[];

  // @OneToMany(() => Jadwal, jadwal => jadwal.kelas)
  // jadwal: Jadwal[];

  @OneToMany(() => JamJadwal, jadwal => jadwal.kelas)
  jam_jadwal: JamJadwal[];

  @OneToMany(() => User, (user) => user.kelas)
  user: User[];

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
