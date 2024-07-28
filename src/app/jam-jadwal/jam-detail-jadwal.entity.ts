// src/app/jam-jadwal-detail/jam-detail-jadwal.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { Absen } from '../absen/absen.entity';

@Entity()
export class JamDetailJadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JamJadwal, (jamJadwal) => jamJadwal.jam_detail)
  @JoinColumn()
  jamJadwal: JamJadwal;

  @ManyToOne(() => Mapel, (mapel) => mapel.jamDetail)
  @JoinColumn()
  mapel: Mapel;

  @OneToMany(() => Absen, (absen) => absen.jadwal)
  absen: Absen[]

  @ManyToOne(() => Kelas, (kelas) => kelas.jamDetail)
  @JoinColumn()
  kelas: Kelas;
}
