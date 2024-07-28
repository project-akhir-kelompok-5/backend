import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { User } from '../auth/auth.entity';
import { Absen } from '../absen/absen.entity';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';
import { JamJadwal } from '../jam-jadwal/jam-jadwal.entity';


export enum HariEnum {
  Senin = 'Senin',
  Selasa = 'Selasa',
  Rabu = 'Rabu',
  Kamis = 'Kamis',
  Jumat = 'Jumat',
  Sabtu = 'Sabtu',
}
@Entity()
export class Jadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mapel, (mataPelajaran) => mataPelajaran.jadwal)
  mapel: Mapel;

  @OneToMany(() => Absen, (absen) => absen.jadwal)
  absen: Absen;

  @ManyToOne(() => Kelas, kelas => kelas.jadwal)
  kelas: Kelas;

  @OneToMany(() => JamJadwal, (jamJadwal) => jamJadwal.jadwal, {
    onDelete: 'CASCADE',
    cascade: ['insert', 'update']
  })
  jam_jadwal: JamJadwal[];

  @Column({
    type: 'enum',
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  })
  hari: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by: User;
}
