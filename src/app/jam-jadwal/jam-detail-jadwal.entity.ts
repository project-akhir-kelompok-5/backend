// src/app/jam-jadwal-detail/jam-detail-jadwal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { AbsenGuru } from '../absen/absen-guru/absen-guru.entity';
import { SubjectCodeEntity } from '../subject_code/subject_code.entity';

@Entity()
export class JamDetailJadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JamJadwal, (jamJadwal) => jamJadwal.jam_detail, { onDelete: 'CASCADE' })
  @JoinColumn()
  jamJadwal: JamJadwal;

  @ManyToOne(() => SubjectCodeEntity, (subjectCode) => subjectCode.jamDetail, {onDelete: 'CASCADE'})
  @JoinColumn()
  subject_code: SubjectCodeEntity;;

  @OneToMany(() => AbsenGuru, (absen) => absen.jadwal)
  absen: AbsenGuru[]

  @ManyToOne(() => Kelas, (kelas) => kelas.jamDetail, {onDelete: 'CASCADE'})
  @JoinColumn()
  kelas: Kelas;

  @ManyToOne(() => Mapel, (mapel) => mapel.jamDetail)
  @JoinColumn()
  mapel: Mapel;
}
