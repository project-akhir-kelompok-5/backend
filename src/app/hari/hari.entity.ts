// src/day/day.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Jadwal } from '../jadwal/jadwal.entity';

@Entity()
export class Hari {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  })
  nama_hari: string;

  @OneToMany(() => Jadwal, (jadwal) => jadwal.hari)
  jadwals: Jadwal[];
}
