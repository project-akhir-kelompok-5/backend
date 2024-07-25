import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Siswa } from './user entity/siswa.entity';
import { Guru } from './user entity/guru.entity';
import { Staf } from './user entity/staf.entity';
import { Kelas } from '../kelas/kelas.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Role } from './roles.enum';



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

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @OneToMany(() => Siswa, (siswa) => siswa.user)
  siswa: Siswa

  @OneToMany(() => Guru, (guru) => guru.user)
  guru: Guru

  @OneToMany(() => Staf, (staf) => staf.user)
  staf: Staf

  @ManyToOne(() => Kelas, (kelas) => kelas.user, { nullable: true })
  kelas: Kelas; 

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
