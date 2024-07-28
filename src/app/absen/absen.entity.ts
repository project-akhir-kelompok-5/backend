import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Jadwal } from '../jadwal/jadwal.entity';
import { User } from '../auth/auth.entity';

export enum Status {
  HADIR = 'Hadir',
  TELAT = 'Telat',
  ALPHA = 'Alpha',
}

@Entity()
export class Absen {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Jadwal, (jadwal) => jadwal.absen)
  // jadwal: Jadwal;

  @ManyToOne(() => User) // Define relationship with User entity
  user: User;

  @Column('datetime')
  waktu_absen: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.HADIR,
  })
  status: Status;

  @Column({ nullable: true, default: 'belum ada' })
  hasil_jurnal_kegiatan: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
