import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';


@Entity()
export class Staf {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.guru)
  user: User;

  @Column({nullable: true})
  jurnal_kegiatan: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}