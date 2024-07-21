import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Siswa } from './user entity/siswa.entity';
import { Guru } from './user entity/guru.entity';
import { Staf } from './user entity/staf.entity';
import { Kelas } from '../kelas/kelas.entity';
import { Mapel } from '../mapel/mapel.entity';

export enum UserRole {
  ADMIN = 'Admin',
  GURU = 'Guru',
  SISWA = 'Murid',
  STAF = 'Staf',
  KEPALA_SEKOLAH = 'KepalaSekolah',
  WALI_KELAS = 'WaliKelas',
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: false })
  nama: string;

  @Column({ nullable: true })
  nomor_hp: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToMany(() => Siswa, (user) => user.id)
  siswa_id: Siswa

  @OneToMany(() => Guru, (user) => user.id)
  guru_id: Guru

  @OneToMany(() => Staf, (user) => user.id)
  staf_id: Staf

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Kelas, (user) => user.created_by)
  kelas_created_by: Kelas[]

  @OneToMany(() => Kelas, (user) => user.updated_by)
  kelas_updated_by: Kelas[]

  @OneToMany(() => Mapel, (user) => user.created_by)
  mapel_created_by: Mapel[]

  @OneToMany(() => Mapel, (user) => user.updated_by)
  mapel_updated_by: Mapel[]
}
