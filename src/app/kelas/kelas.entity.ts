// kelas.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Guru } from '../auth/user entity/guru.entity';
import { Siswa } from '../auth/user entity/siswa.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.entity';

UseGuards(JwtGuard)
@Entity()
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nama_kelas: string;

  @OneToMany(() => Guru, Guru => Guru.kelas_id)
  guru_id: Guru[];

  @OneToMany(() => Siswa, siswa => siswa.kelas_id)
  siswa_id: Siswa[];

  @OneToMany(() => Jadwal, jadwal => jadwal.kelas_id)
  jadwal_id: Siswa[];

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
