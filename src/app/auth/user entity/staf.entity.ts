import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth.entity';
import { Kelas } from 'src/app/kelas/kelas.entity';


@Entity()
export class Staf {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.guru_id)
  user: User;

  @Column({nullable: true})
  jurnal_kegiatan: string;
}