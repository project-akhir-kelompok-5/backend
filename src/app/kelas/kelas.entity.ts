// kelas.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Murid } from '../auth/siswa/siswa.entity';
import { Jadwal } from '../jadwal/jadwal.entity';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.entity';
import { JamJadwal } from '../jadwal/jam-jadwal.entity';
import { JamDetailJadwal } from '../jadwal/jam-detail-jadwal.entity';
import { KelasEnum } from '../auth/roles.enum';
import { SubjectCodeEntity } from '../subject_code/subject_code.entity';

UseGuards(JwtGuard);
@Entity()
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama_kelas: string;

  @OneToMany(() => JamDetailJadwal, (jamJadwal) => jamJadwal.kelas, {
    onDelete: 'CASCADE',
  })
  jamDetail: JamDetailJadwal[];

  @OneToMany(() => Murid, (siswa) => siswa.kelas)
  siswa: Murid[];


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
