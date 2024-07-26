import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Guru } from '../auth/guru/guru.entity';
import { Mapel } from '../mapel/mapel.entity';
import { Kelas } from '../kelas/kelas.entity';
import { User } from '../auth/auth.entity';
import { Absen } from '../absen/absen.entity';

@Entity()
export class Jadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mapel, (mataPelajaran) => mataPelajaran.jadwal)
  mapel: Mapel;

  @ManyToOne(() => Kelas, (kelas) => kelas.jadwal)
  kelas: Kelas;

  @ManyToOne(() => Absen, (absen) => absen.jadwal)
  absen: Absen;

  @Column({
    type: 'enum',
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  })
  hari: string;

  @Column('time')
  jam_mulai: string;

  @Column('time')
  jam_selesai: string;

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
